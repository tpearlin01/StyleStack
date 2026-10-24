const request = require('supertest');
const app = require('../app');

describe('Order Processing and Checkout Lifecycle', () => {
  it('GET /api/orders returns customer orders sorted by latest date', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    // Verify sorted descending by date
    for (let i = 1; i < res.body.data.length; i++) {
      const prevDate = new Date(res.body.data[i - 1].date || res.body.data[i - 1].createdAt);
      const currDate = new Date(res.body.data[i].date || res.body.data[i].createdAt);
      expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
    }
  });

  it('POST /api/orders creates order, computes 5% GST, and decrements stock', async () => {
    // Check initial stock for a product
    const prodRes = await request(app).get('/api/products/prod-1');
    const initialStock = prodRes.body.data.stock;

    const orderPayload = {
      customerName: 'Priya Verma',
      customerEmail: 'priya.verma@example.com',
      paymentMethod: 'Instant UPI / GPay',
      items: [
        {
          id: 'prod-1',
          name: 'Hand-Stitched Italian Leather Reversible Belt',
          price: 449,
          quantity: 2,
        },
      ],
    };

    const res = await request(app).post('/api/orders').send(orderPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^ORD-\d{6}$/);
    expect(res.body.data.customerName).toBe('Priya Verma');
    expect(res.body.data.customerEmail).toBe('priya.verma@example.com');
    expect(res.body.data.subtotal).toBe(898);
    expect(res.body.data.taxAmount).toBe(44.9); // 5% of 898
    expect(res.body.data.totalAmount).toBe(942.9); // 898 + 44.9
    expect(res.body.data.status).toBe('Placed');

    // Verify stock decremented
    const updatedProdRes = await request(app).get('/api/products/prod-1');
    expect(updatedProdRes.body.data.stock).toBe(Math.max(0, initialStock - 2));
  });

  it('POST /api/orders returns 400 when customerName or customerEmail is missing', async () => {
    const res = await request(app).post('/api/orders').send({
      items: [{ id: 'prod-1', price: 100, quantity: 1 }],
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/orders/:id/status updates status from Placed to Dispatched to Delivered', async () => {
    // Get existing order
    const listRes = await request(app).get('/api/orders');
    const orderId = listRes.body.data[0].id;

    // Update to Dispatched
    const patchRes1 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'Dispatched' });
    expect(patchRes1.statusCode).toBe(200);
    expect(patchRes1.body.success).toBe(true);
    expect(patchRes1.body.data.status).toBe('Dispatched');

    // Update to Delivered
    const patchRes2 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'Delivered' });
    expect(patchRes2.statusCode).toBe(200);
    expect(patchRes2.body.success).toBe(true);
    expect(patchRes2.body.data.status).toBe('Delivered');
  });

  it('PATCH /api/orders/:id/status rejects invalid status with 400', async () => {
    const listRes = await request(app).get('/api/orders');
    const orderId = listRes.body.data[0].id;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'CancelledByMagic' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
