const request = require('supertest');
const app = require('../app');

describe('Authentication Endpoints', () => {
  it('POST /api/auth/register registers user with firstName, lastName, email, and password', async () => {
    const uniqueEmail = `fashionista_${Date.now()}@stylestack.com`;
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Pooja',
      lastName: 'Hegde',
      email: uniqueEmail,
      password: 'password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail);
    expect(res.body.user.firstName).toBe('Pooja');
    expect(res.body.user.lastName).toBe('Hegde');
  });

  it('POST /api/auth/login logs in valid user and returns email and role', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@stylestack.com',
      password: 'adminPassword123',
      role: 'admin',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@stylestack.com');
    expect(res.body.user.role).toBe('admin');
  });

  it('POST /api/auth/login returns 401 for invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@stylestack.com',
      password: 'wrongPassword',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register returns 400 when email already exists', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Duplicate',
      lastName: 'User',
      email: 'admin@stylestack.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
