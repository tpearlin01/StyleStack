const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

describe('MongoDB Atlas Mongoose CRUD & Model Integrity', () => {
  const testSuffix = Date.now();
  const testProductId = `prod-test-${testSuffix}`;
  const testOrderId = `ORD-TEST-${testSuffix}`;
  const testUserEmail = `test.user.${testSuffix}@stylestack.test`;

  beforeAll(async () => {
    // Establish connection to Atlas if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  }, 20000);

  afterAll(async () => {
    // Clean up created test documents
    try {
      await Product.deleteOne({ id: testProductId });
      await Order.deleteOne({ id: testOrderId });
      await User.deleteOne({ email: testUserEmail });
    } catch (err) {
      console.warn('Cleanup warning:', err.message);
    }
    // Disconnect mongoose
    await mongoose.disconnect();
  }, 10000);

  describe('MongoDB Atlas Connectivity', () => {
    it('should be connected to MongoDB Atlas with readyState = 1', () => {
      expect(mongoose.connection.readyState).toBe(1);
    });
  });

  describe('Product Model CRUD in MongoDB', () => {
    it('should create a new product document with synchronized fields', async () => {
      const product = await Product.create({
        id: testProductId,
        name: 'Test Urban Silk Jacket',
        title: 'Test Urban Silk Jacket',
        brand: 'StyleStack Luxe',
        category: 'jackets',
        gender: 'men',
        price: 4999,
        stock: 25,
        sizes: ['M', 'L', 'XL'],
        image: 'https://images.unsplash.com/photo-test-jacket.jpg',
        badge: 'Exclusive',
        description: 'Test jacket crafted from pure silk.',
      });

      expect(product).toBeDefined();
      expect(product.id).toBe(testProductId);
      expect(product.name).toBe('Test Urban Silk Jacket');
      expect(product.stockQuantity).toBe(25);
      expect(product.inStock).toBe(25);
    });

    it('should read the product document by id and name', async () => {
      const found = await Product.findOne({ id: testProductId });
      expect(found).not.toBeNull();
      expect(found.price).toBe(4999);
      expect(found.brand).toBe('StyleStack Luxe');
    });

    it('should update the product stock and price', async () => {
      const updated = await Product.findOneAndUpdate(
        { id: testProductId },
        { stock: 20, price: 4499 },
        { new: true }
      );
      expect(updated.stock).toBe(20);
      expect(updated.price).toBe(4499);
    });
  });

  describe('Order Model CRUD in MongoDB', () => {
    it('should create an order with items, GST breakdown, and synchronization hooks', async () => {
      const order = await Order.create({
        id: testOrderId,
        orderId: testOrderId,
        customerName: 'Aarav Mehta',
        customerEmail: 'aarav.mehta@example.com',
        shippingAddress: '42 Marine Drive, Mumbai, Maharashtra - 400020',
        items: [
          {
            id: testProductId,
            productId: testProductId,
            name: 'Test Urban Silk Jacket',
            size: 'L',
            quantity: 1,
            unitPrice: 4499,
            price: 4499,
          },
        ],
        subtotal: 4499,
        gstAmount: 224.95,
        taxAmount: 224.95,
        shippingFee: 0,
        totalAmount: 4723.95,
        total: 4723.95,
        paymentMethod: 'Razorpay Gateway (Test Mode)',
        paymentStatus: 'Pending',
      });

      expect(order).toBeDefined();
      expect(order.orderId).toBe(testOrderId);
      expect(order.items.length).toBe(1);
      expect(order.totalAmount).toBe(4723.95);
      expect(order.status).toBe('Placed');
    });

    it('should read order and update paymentStatus & status', async () => {
      const updated = await Order.findOneAndUpdate(
        { id: testOrderId },
        {
          paymentStatus: 'Completed',
          status: 'Dispatched',
          razorpayPaymentId: 'pay_test_db_9988',
        },
        { new: true }
      );

      expect(updated.paymentStatus).toBe('Completed');
      expect(updated.status).toBe('Dispatched');
      expect(updated.razorpayPaymentId).toBe('pay_test_db_9988');
    });
  });

  describe('User Model CRUD in MongoDB', () => {
    it('should create a user document with synchronized first and last names', async () => {
      const user = await User.create({
        name: 'Kavya Sharma',
        email: testUserEmail,
        password: 'securePassword123',
        role: 'customer',
      });

      expect(user).toBeDefined();
      expect(user.firstName).toBe('Kavya');
      expect(user.lastName).toBe('Sharma');
      expect(user.email).toBe(testUserEmail);
    });

    it('should find user by email', async () => {
      const found = await User.findOne({ email: testUserEmail });
      expect(found).not.toBeNull();
      expect(found.name).toBe('Kavya Sharma');
    });
  });
});
