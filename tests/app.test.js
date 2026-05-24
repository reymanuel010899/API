const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('returns service info with 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('service', 'devops-api');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('environment');
  });
});

describe('GET /health', () => {
  it('returns status ok with 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('timestamp is a valid ISO string', async () => {
    const res = await request(app).get('/health');
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
  });
});
