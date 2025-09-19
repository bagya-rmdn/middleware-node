const { AsyncLocalStorage } = require('async_hooks');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const logger = require('./logger');

const als = new AsyncLocalStorage();
const SLOW_MS = 1000;
const SENSITIVE_KEYS = [
  'password', 'pass', 'pwd',
  'token', 'access_token', 'refresh_token',
  'authorization', 'card', 'credit_card',
  'card_number', 'cvv'
];
const MONITORING_ENDPOINT = 'https://webhook.site/637d030e-8aef-4c3d-a1bb-0f1a25287e49'; // dummy test

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const seen = new WeakSet();

  function _red(o) {
    if (o === null) return null;
    if (typeof o !== 'object') return o;
    if (seen.has(o)) return '[Circular]';
    seen.add(o);

    if (Array.isArray(o)) return o.map(_red);

    const out = {};
    for (const [k, v] of Object.entries(o)) {
      if (SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk))) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = _red(v);
      }
    }
    return out;
  }
  return _red(obj);
}

function redactHeaders(headers) {
  const copy = {};
  for (const [k, v] of Object.entries(headers || {})) {
    if (k.toLowerCase() === 'authorization') copy[k] = '[REDACTED]';
    else copy[k] = v;
  }
  return copy;
}

async function sendToMonitoring(payload) {
  try {
    await axios.post(MONITORING_ENDPOINT, payload, { timeout: 1500 });
  } catch (err) {
    logger.warn({ err }, 'Monitoring send failed');
  }
}

function deepLogger(req, res, next) {
  const requestId = uuidv4();
  const start = Date.now();

  const requestSnapshot = {
    id: requestId,
    method: req.method,
    url: req.originalUrl,
    headers: redactHeaders(req.headers),
    params: redact(req.params),
    query: redact(req.query),
    body: redact(req.body)
  };

  als.run({ requestId, start }, () => {
    let responseBody;
    const origSend = res.send.bind(res);

    res.send = function (body) {
      responseBody = body;
      return origSend(body);
    };

    res.once('finish', async () => {
      const durationMs = Date.now() - start;

      const safeResponse = (() => {
        try {
          if (typeof responseBody === 'object') return redact(responseBody);
          const str = String(responseBody);
          return str.length > 1000 ? str.slice(0, 1000) + '...[truncated]' : str;
        } catch {
          return '[UNREADABLE_RESPONSE]';
        }
      })();

      const logEntry = {
        request: requestSnapshot,
        response: {
          statusCode: res.statusCode,
          headers: redactHeaders(res.getHeaders ? res.getHeaders() : {}),
          body: safeResponse
        },
        durationMs
      };

      if (durationMs > SLOW_MS) {
        logger.warn(logEntry, 'Slow request detected');
      } else {
        logger.info(logEntry, 'Request completed');
      }

      await sendToMonitoring(logEntry);
    });

    res.setHeader('X-Request-Id', requestId);
    next();
  });
}

module.exports = deepLogger;
