const request = require('supertest');
const app = require('../src/app');

describe('Health and System Routes', () => {
  it('GET /api/health returns 200 and healthy status message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('StyleStack API is healthy');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/nonexistent-route returns 404 with uniform error format', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });
});
