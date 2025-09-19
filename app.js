const express = require('express');
const bodyParser = require('body-parser');
const deepLogger = require('./deepLogger');

const app = express();
app.use(bodyParser.json());
app.use(deepLogger);

app.get('/fast', (req, res) => {
  res.json({ ok: true });
});

app.get('/slow', async (req, res) => {
  await new Promise(r => setTimeout(r, 1200));
  res.json({ slow: true });
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.json({ ok: true, username });
});

module.exports = app;
