const request = require('supertest');
const crypto = require('crypto');
const app = require('../app');
const store = require('../src/data/store');

describe('Payment & Razorpay Gateway Integration Tests', () => {
  let createdOrderId;

  beforeAll(() => {
    // Seed an order in local store for testing payment status updates
    const testOrder = store.createOrder({
      customerName: 'Test Customer',
      customerEmail: 'test.customer@example.com',
      shippingAddress: '123 Test Street, Mumbai, Maharashtra - 400001',
      items: [
        {
          id: 'prod-test-1',
          name: 'Designer Casual Shirt',
          price: 999,
          quantity: 1,
        },
      ],
      paymentMethod: 'Razorpay Gateway (Test Mode)',
    });
    createdOrderId = testOrder.id;
  });

  describe('POST /api/payment/razorpay/order - Order Creation', () => {
    it('should successfully create a Razorpay payment order for a valid amount', async () => {
      const res = await request(app)
        .post('/api/payment/razorpay/order')
        .send({
          amount: 1048.95,
          currency: 'INR',
          orderId: createdOrderId,
          receipt: createdOrderId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('orderId');
      expect(res.body.data.amount).toBe(104895); // 1048.95 * 100 paise
      expect(res.body.data.currency).toBe('INR');
      expect(res.body.data).toHaveProperty('keyId');
    });

    it('should reject payment order creation when amount is zero or negative', async () => {
      const res = await request(app)
        .post('/api/payment/razorpay/order')
        .send({
          amount: 0,
          currency: 'INR',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject payment order creation when amount is missing or not a number', async () => {
      const res = await request(app)
        .post('/api/payment/razorpay/order')
        .send({
          amount: 'invalid-amount',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/payment/razorpay/verify - Signature Verification', () => {
    it('should fail verification if signature is invalid or tampered', async () => {
      const res = await request(app)
        .post('/api/payment/razorpay/verify')
        .send({
          razorpay_order_id: 'order_test_12345',
          razorpay_payment_id: 'pay_test_67890',
          razorpay_signature: 'invalid_tampered_signature_hex_1234',
          orderId: createdOrderId,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid payment signature/i);
    });

    it('should reject verification when required parameters are missing', async () => {
      const res = await request(app)
        .post('/api/payment/razorpay/verify')
        .send({
          razorpay_order_id: 'order_test_12345',
          // razorpay_payment_id and razorpay_signature intentionally omitted
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should verify payment successfully when given a valid cryptographic signature', async () => {
      const rzpOrderId = 'order_test_998877';
      const rzpPaymentId = 'pay_test_112233';

      // Generate valid signature using configured secret or fallback mock secret
      const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_fallback';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest('hex');

      const res = await request(app)
        .post('/api/payment/razorpay/verify')
        .send({
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId,
          razorpay_signature: validSignature,
          orderId: createdOrderId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('Paid');
      expect(res.body.data.paymentId).toBe(rzpPaymentId);

      // Verify that the order in store was updated
      const updatedOrder = store.getOrderById(createdOrderId);
      expect(updatedOrder.paymentStatus).toBe('Paid');
      expect(updatedOrder.razorpayPaymentId).toBe(rzpPaymentId);
    });
  });

  describe('POST /api/payment/razorpay/failure - Failure and Cancellation Handling', () => {
    it('should record payment failure details in the order', async () => {
      const res = await request(app)
        .post('/api/payment/razorpay/failure')
        .send({
          orderId: createdOrderId,
          razorpay_payment_id: 'pay_failed_445566',
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Payment was cancelled by the customer in popup modal',
            reason: 'payment_cancelled_by_user',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentStatus).toBe('Failed');

      const updatedOrder = store.getOrderById(createdOrderId);
      expect(updatedOrder.paymentStatus).toBe('Failed');
    });
  });

  describe('GET /api/payment/razorpay/config - Public Configuration', () => {
    it('should return public keyId and testMode flag without exposing secret key', async () => {
      const res = await request(app).get('/api/payment/razorpay/config');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('keyId');
      expect(res.body.data.testMode).toBe(true);
      expect(res.body.data).not.toHaveProperty('keySecret');
      expect(res.body.data).not.toHaveProperty('secret');
    });
  });
});
