const request = require('supertest');
const app = require('../src/app');

describe('Security Headers Middleware (Helmet)', () => {
  it('enforces expected HTTP security headers on GET /api/health', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);

    // Frameguard (Clickjacking prevention)
    expect(res.headers['x-frame-options']).toBe('DENY');

    // MIME sniffing prevention
    expect(res.headers['x-content-type-options']).toBe('nosniff');

    // Referrer policy
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');

    // Cross-origin resource policy
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');

    // Cross-origin opener policy
    expect(res.headers['cross-origin-opener-policy']).toBe('same-origin');

    // Content Security Policy
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain("object-src 'none'");

    // X-Powered-By header should NOT be exposed
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('enforces security headers on active catalog endpoint GET /api/products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('enforces Strict-Transport-Security (HSTS) on HTTPS / secure forwarded requests', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('X-Forwarded-Proto', 'https');

    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
    expect(res.headers['strict-transport-security']).toContain('includeSubDomains');
  });
});
