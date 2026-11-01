const request = require('supertest');
const app = require('../app');
const emailService = require('../src/services/emailService');

describe('Gmail & Nodemailer Email Service Tests', () => {
  const sampleOrder = {
    id: 'ORD-TEST-9901',
    orderId: 'ORD-TEST-9901',
    customerName: 'Aarav Patel',
    customerEmail: 'aarav.patel@example.com',
    shippingAddress: '74 Park Street, Kolkata, West Bengal - 700016',
    items: [
      {
        id: 'prod-w-trad-1',
        name: 'Royal Silk Kurta Set',
        size: 'L',
        quantity: 2,
        price: 1499,
      },
    ],
    subtotal: 2998,
    taxAmount: 149.9,
    shippingFee: 0,
    totalAmount: 3147.9,
    paymentMethod: 'Instant UPI / GPay',
    date: '1 Nov 2026',
    createdAt: new Date().toISOString(),
  };

  describe('Order Confirmation Email Transmission', () => {
    it('should format and dispatch an order confirmation email without throwing', async () => {
      const result = await emailService.sendOrderConfirmationEmail(sampleOrder);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.recipient).toBe('aarav.patel@example.com');
    });

    it('should prevent duplicate order confirmation emails for the same order', async () => {
      // Second call for the identical order
      const duplicateResult = await emailService.sendOrderConfirmationEmail(sampleOrder);

      expect(duplicateResult).toBeDefined();
      expect(duplicateResult.success).toBe(true);
      expect(duplicateResult.skipped).toBe(true);
      expect(duplicateResult.message).toMatch(/duplicate/i);
    });

    it('should handle missing recipient email gracefully without throwing error', async () => {
      const invalidOrder = {
        id: 'ORD-NO-EMAIL',
        customerName: 'No Email User',
        items: [],
      };

      const result = await emailService.sendOrderConfirmationEmail(invalidOrder);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Missing or invalid recipient email/i);
    });
  });

  describe('Payment Confirmation Email Transmission', () => {
    const paymentOrder = {
      id: 'ORD-PAY-8802',
      customerName: 'Neha Kapoor',
      customerEmail: 'neha.kapoor@example.com',
      totalAmount: 2499,
      paymentMethod: 'Razorpay Secure (Test Mode)',
    };

    it('should format and dispatch a payment receipt email with transaction ID', async () => {
      const result = await emailService.sendPaymentConfirmationEmail(paymentOrder, {
        paymentId: 'pay_test_abc123xyz',
        razorpay_order_id: 'order_test_987654',
        status: 'Paid',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.recipient).toBe('neha.kapoor@example.com');
    });

    it('should prevent duplicate payment confirmation emails for the same transaction', async () => {
      const duplicateResult = await emailService.sendPaymentConfirmationEmail(paymentOrder, {
        paymentId: 'pay_test_abc123xyz',
        razorpay_order_id: 'order_test_987654',
      });

      expect(duplicateResult).toBeDefined();
      expect(duplicateResult.success).toBe(true);
      expect(duplicateResult.skipped).toBe(true);
    });

    it('should handle null or invalid order safely without throwing', async () => {
      const result = await emailService.sendPaymentConfirmationEmail(null);
      expect(result.success).toBe(false);
    });
  });

  describe('Integration: Order Placement with Email Trigger', () => {
    it('should successfully place an order and trigger confirmation email without disrupting response', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'Priya Sharma',
          customerEmail: 'priya.sharma@example.com',
          shippingAddress: 'Flat 402, Lotus Heights, Bengaluru - 560038',
          paymentMethod: 'Cash on Delivery',
          items: [
            {
              id: 'prod-w-trad-1',
              name: 'Royal Silk Kurta Set',
              price: 1499,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.customerEmail).toBe('priya.sharma@example.com');
    });
  });

  describe('POST /api/payment/email/test - Gmail SMTP Verification Endpoint', () => {
    it('should handle test email request with structured response', async () => {
      const res = await request(app)
        .post('/api/payment/email/test')
        .send({
          to: 'test.verification@example.com',
        });

      // If credentials are not set in environment, returns 400 with helpful explanation
      // If credentials are set, returns 200 with success: true
      if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
        expect(res.body).toHaveProperty('success');
      } else {
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch(/credentials.*not configured/i);
      }
    });
  });
});
