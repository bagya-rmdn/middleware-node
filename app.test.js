// app.test.js
const request = require('supertest');
const app = require('./app');

describe('Logger Middleware', () => {
  it('should respond to /fast quickly', async () => {
    const res = await request(app).get('/fast');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('should redact sensitive data in /login', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'alice', password: 'secret' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    // password tidak ditampilkan
    expect(res.body).not.toHaveProperty('password');
  });

  it('should handle slow request', async () => {
    const res = await request(app).get('/slow');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('slow', true);
  });
});
