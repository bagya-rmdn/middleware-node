const bunyan = require('bunyan');
const fs = require('fs');

fs.mkdirSync('logs', { recursive: true });

const logger = bunyan.createLogger({
  name: 'express-logger',
  streams: [
    { level: 'info', stream: process.stdout },
    { level: 'info', path: 'logs/requests.log' }
  ],
  serializers: bunyan.stdSerializers
});

module.exports = logger;
