const request = require('supertest');
const app = require('../app');

describe('Product Endpoints & Stock Management', () => {
  it('GET /api/products returns catalog with total count and 133 seed apparel items', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(133);
    expect(res.body.total).toBe(res.body.data.length);
  });

  it('GET /api/products?category=accessories filters catalog items by category', async () => {
    const res = await request(app).get('/api/products?category=accessories');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p) => p.category.toLowerCase() === 'accessories')).toBe(true);
  });

  it('GET /api/products?gender=men filters catalog items by gender', async () => {
    const res = await request(app).get('/api/products?gender=men');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p) => p.gender.toLowerCase() === 'men')).toBe(true);
  });

  it('GET /api/products?search=Belt searches products by keyword', async () => {
    const res = await request(app).get('/api/products?search=Belt');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name.toLowerCase()).toContain('belt');
  });

  it('GET /api/products/:id returns single product detail', async () => {
    const res = await request(app).get('/api/products/prod-1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('prod-1');
    expect(res.body.data.name).toContain('Belt');
  });

  it('GET /api/products/:id returns 404 for unknown product id', async () => {
    const res = await request(app).get('/api/products/unknown-prod-999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/products adds a new apparel item to the catalog', async () => {
    const newProduct = {
      name: 'Tailored Linen Mandarin Shirt',
      category: 'casual',
      gender: 'men',
      price: 699,
      stock: 25,
      badge: 'New Arrival',
      image: '/images/men tshirt summer/Artboard4_98.webp',
      description: 'Handcrafted breathable linen mandarin collar shirt.',
    };

    const res = await request(app).post('/api/products').send(newProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Tailored Linen Mandarin Shirt');
    expect(res.body.data.price).toBe(699);
    expect(res.body.data.stock).toBe(25);
  });

  it('PATCH /api/products/:id/stock decrements item stock after checkout', async () => {
    // Get product first
    const initialRes = await request(app).get('/api/products/prod-1');
    const initialStock = initialRes.body.data.stock;

    const res = await request(app)
      .patch('/api/products/prod-1/stock')
      .send({ quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stock).toBe(Math.max(0, initialStock - 2));
  });

  it('PATCH /api/products/:id/stock returns 404 for nonexistent product', async () => {
    const res = await request(app)
      .patch('/api/products/prod-nonexistent/stock')
      .send({ quantity: 1 });
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
