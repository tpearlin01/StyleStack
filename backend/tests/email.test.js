const request = require('supertest');
const app = require('../app');
const emailService = require('../src/services/emailService');

describe('Gmail & Nodemailer Email Service Tests', () => {
  jest.setTimeout(15000);
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

  describe('Credential Sanitization & Validation', () => {
    it('should strip internal whitespace from 16-character Google App Passwords', () => {
      expect(emailService.sanitizePassword('abcd efgh ijkl mnop')).toBe('abcdefghijklmnop');
      expect(emailService.sanitizePassword('"abcd efgh ijkl mnop"')).toBe('abcdefghijklmnop');
      expect(emailService.sanitizePassword("'abcd efgh ijkl mnop'")).toBe('abcdefghijklmnop');
    });

    it('should strip quotes and whitespace from email credentials', () => {
      expect(emailService.sanitizeCredential(' "test@gmail.com" ')).toBe('test@gmail.com');
      expect(emailService.sanitizeCredential("'test@gmail.com'")).toBe('test@gmail.com');
    });

    it('should correctly identify placeholder credentials', () => {
      expect(emailService.isPlaceholder('your_gmail@gmail.com')).toBe(true);
      expect(emailService.isPlaceholder('your_actual_app_password')).toBe(true);
      expect(emailService.isPlaceholder('')).toBe(true);
      expect(emailService.isPlaceholder(null)).toBe(true);
      expect(emailService.isPlaceholder('stylestack.store@gmail.com')).toBe(false);
    });
  });

  describe('GET /api/email/verify - Gmail SMTP Verification Endpoint', () => {
    it('should return a structured response verifying connection or reporting placeholder status', async () => {
      const res = await request(app).get('/api/email/verify');
      expect(res.body).toHaveProperty('success');
      if (res.body.success) {
        expect(res.status).toBe(200);
        expect(res.body.data.configured).toBe(true);
      } else {
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/not configured or using default placeholders/i);
      }
    });
  });

  describe('Recipient Email Resolution in Local Testing', () => {
    it('should preserve legitimate customer recipient email addresses', () => {
      expect(emailService.resolveRecipientEmail('customer.real@gmail.com')).toBe('customer.real@gmail.com');
      expect(emailService.resolveRecipientEmail('aarav.patel@example.com')).toBe('aarav.patel@example.com');
    });

    it('should reroute mock stylestack.com fallback recipients to configured EMAIL_USER in development', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUser = process.env.EMAIL_USER;
      process.env.NODE_ENV = 'development';
      process.env.EMAIL_USER = 'storeowner@gmail.com';

      expect(emailService.resolveRecipientEmail('customer@stylestack.com')).toBe('storeowner@gmail.com');
      expect(emailService.resolveRecipientEmail('admin@stylestack.com')).toBe('storeowner@gmail.com');

      process.env.NODE_ENV = originalEnv;
      process.env.EMAIL_USER = originalUser;
    });
  });
});
