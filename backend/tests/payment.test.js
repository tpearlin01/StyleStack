const request = require('supertest');
const app = require('../app');
const store = require('../src/data/store');

describe('Simulated Checkout and Payment Flow Tests', () => {
  describe('Cash on Delivery (COD) Checkout Flow', () => {
    it('should successfully place a Cash on Delivery order with Pending payment status', async () => {
      const payload = {
        customerName: 'Aarav Mehta',
        customerEmail: 'aarav.mehta@example.com',
        shippingAddress: '12 Marine Drive, Nariman Point, Mumbai - 400021',
        paymentMethod: 'Cash on Delivery',
        items: [
          {
            id: 'prod-1',
            productId: 'prod-1',
            name: 'Hand-Stitched Italian Leather Reversible Belt',
            price: 449,
            quantity: 1,
            size: 'Standard',
          },
        ],
      };

      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.paymentMethod).toBe('Cash on Delivery');
      expect(res.body.data.status).toBe('Placed');
      expect(res.body.data.subtotal).toBe(449);
      expect(res.body.data.taxAmount).toBe(22.45); // 5% GST
      expect(res.body.data.totalAmount).toBe(471.45);
    });
  });

  describe('Simulated Instant UPI / QR Checkout Flow', () => {
    it('should place an order with Instant UPI / GPay payment method', async () => {
      const payload = {
        customerName: 'Ananya Sharma',
        customerEmail: 'ananya.sharma@example.com',
        shippingAddress: '45 MG Road, Indiranagar, Bengaluru - 560038',
        paymentMethod: 'Instant UPI / GPay',
        items: [
          {
            id: 'prod-2',
            productId: 'prod-2',
            name: 'Artisanal Silk Evening Scarf',
            price: 799,
            quantity: 1,
            size: 'One Size',
          },
        ],
      };

      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentMethod).toBe('Instant UPI / GPay');
      expect(res.body.data.status).toBe('Placed');
    });
  });

  describe('Simulated 3D-Secure Card Checkout Flow', () => {
    it('should place an order with Credit / Debit Card (3D-Secure Verified)', async () => {
      const payload = {
        customerName: 'Rohan Verma',
        customerEmail: 'rohan.verma@example.com',
        shippingAddress: '78 Sector 18, Noida, Uttar Pradesh - 201301',
        paymentMethod: 'Credit / Debit Card (3D-Secure Verified)',
        items: [
          {
            id: 'prod-3',
            productId: 'prod-3',
            name: 'Tailored Slim-Fit Oxford Shirt',
            price: 1299,
            quantity: 1,
            size: 'L',
          },
        ],
      };

      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentMethod).toBe('Credit / Debit Card (3D-Secure Verified)');
      expect(res.body.data.status).toBe('Placed');
      expect(res.body.data.totalAmount).toBe(1363.95);
    });

    it('should reject order creation when customer details are missing', async () => {
      const invalidPayload = {
        paymentMethod: 'Credit / Debit Card (3D-Secure Verified)',
        items: [
          {
            id: 'prod-1',
            price: 449,
            quantity: 1,
          },
        ],
      };

      const res = await request(app).post('/api/orders').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject order creation when cart items are empty', async () => {
      const emptyItemsPayload = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        paymentMethod: 'Cash on Delivery',
        items: [],
      };

      const res = await request(app).post('/api/orders').send(emptyItemsPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
