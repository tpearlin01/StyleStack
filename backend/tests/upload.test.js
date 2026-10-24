const request = require('supertest');
const app = require('../src/app');

describe('Multer File and Image Upload Pipeline', () => {
  it('POST /api/upload successfully uploads image and returns file metadata', async () => {
    // 1x1 transparent PNG buffer
    const dummyImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );

    const res = await request(app)
      .post('/api/upload')
      .attach('image', dummyImage, 'test-swatch.png');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imageUrl).toBeDefined();
    expect(res.body.data.imageUrl).toMatch(/^\/uploads\/product-/);
  });

  it('POST /api/upload returns 400 if no image is sent', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Please provide an image file');
  });

  it('POST /api/products handles multipart form upload with image', async () => {
    const dummyImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );

    const res = await request(app)
      .post('/api/products')
      .field('name', 'Handcrafted Silk Dupatta')
      .field('category', 'Ethnic')
      .field('price', '45.00')
      .field('stock', '15')
      .attach('image', dummyImage, 'dupatta.png');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Handcrafted Silk Dupatta');
    expect(res.body.data.imageUrl).toMatch(/^\/uploads\/product-/);
  });
});
