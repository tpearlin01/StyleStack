const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const productsFilePath = path.join(__dirname, '../../data/products.json');
const ordersFilePath = path.join(__dirname, '../../data/orders.json');

const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@stylestack.com',
    password: 'adminPassword123',
    role: 'admin',
  },
  {
    id: 'usr-customer',
    name: 'Ananya Sharma',
    firstName: 'Ananya',
    lastName: 'Sharma',
    email: 'ananya@example.com',
    password: 'password123',
    role: 'customer',
  },
];

const loadJsonSafely = (filePath, fallback = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`[Migration] Could not load JSON from ${filePath}: ${err.message}`);
  }
  return fallback;
};

/**
 * Migrate products, orders and seed users into MongoDB without duplicates or data loss.
 */
const migrateData = async () => {
  const stats = {
    productsInserted: 0,
    productsExisting: 0,
    ordersInserted: 0,
    ordersExisting: 0,
    usersInserted: 0,
    usersExisting: 0,
  };

  try {
    // 1. Migrate Products
    const productsJson = loadJsonSafely(productsFilePath, []);
    for (const p of productsJson) {
      const productId = p.id || p._id;
      const query = productId
        ? { $or: [{ id: String(productId) }, { name: p.name, category: p.category }] }
        : { name: p.name, category: p.category };

      const existing = await Product.findOne(query);
      if (!existing) {
        const stockVal = p.stock !== undefined ? Number(p.stock) : (p.inStock !== undefined ? Number(p.inStock) : 10);
        await Product.create({
          id: String(productId || `prod-${Date.now()}`),
          name: p.name || p.title || 'Apparel Item',
          title: p.title || p.name || 'Apparel Item',
          brand: p.brand || 'StyleStack',
          category: (p.category || 'casual').toLowerCase(),
          categoryName: p.categoryName || p.category || 'Casual',
          gender: (p.gender || 'unisex').toLowerCase(),
          price: Number(p.price) || 0,
          sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
          stock: stockVal,
          inStock: stockVal,
          stockQuantity: stockVal,
          badge: p.badge || p.tag || 'New Arrival',
          image: p.image || p.imageUrl || '',
          imageUrl: p.imageUrl || p.image || '',
          description: p.description || '',
          rating: Number(p.rating) || 5.0,
          reviewsCount: Number(p.reviewsCount) || 1,
          tags: Array.isArray(p.tags) ? p.tags : [],
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        });
        stats.productsInserted++;
      } else {
        stats.productsExisting++;
      }
    }

    // 2. Migrate Orders
    const ordersJson = loadJsonSafely(ordersFilePath, []);
    for (const o of ordersJson) {
      const orderIdentifier = o.orderId || o.id;
      if (!orderIdentifier) continue;

      const existing = await Order.findOne({
        $or: [{ orderId: String(orderIdentifier) }, { id: String(orderIdentifier) }],
      });

      if (!existing) {
        const subtotal = Number(o.subtotal || 0);
        const tax = Number(o.taxAmount !== undefined ? o.taxAmount : (o.gstAmount || 0));
        const total = Number(o.totalAmount !== undefined ? o.totalAmount : (o.total || (subtotal + tax)));

        const items = Array.isArray(o.items)
          ? o.items.map((item) => ({
              id: item.id ? String(item.id) : (item.productId ? String(item.productId) : ''),
              productId: item.productId ? String(item.productId) : (item.id ? String(item.id) : 'prod-unknown'),
              name: item.name || item.title || 'Apparel Item',
              size: item.size || item.selectedSize || 'M',
              quantity: Math.max(1, Number(item.quantity) || 1),
              unitPrice: Number(item.unitPrice !== undefined ? item.unitPrice : (item.price || 0)),
              price: Number(item.price !== undefined ? item.price : (item.unitPrice || 0)),
              image: item.image || item.imageUrl || '',
              imageUrl: item.imageUrl || item.image || '',
            }))
          : [];

        await Order.create({
          id: String(orderIdentifier),
          orderId: String(orderIdentifier),
          customerName: o.customerName || (o.customer && o.customer.name) || 'Valued Customer',
          customerEmail: (o.customerEmail || (o.customer && o.customer.email) || 'customer@example.com').toLowerCase(),
          shippingAddress: o.shippingAddress || (o.customer && o.customer.address) || 'Standard Shipping Address',
          customer: o.customer || {
            name: o.customerName || 'Valued Customer',
            email: o.customerEmail || 'customer@example.com',
            address: o.shippingAddress || 'Standard Shipping Address',
            paymentMethod: o.paymentMethod || 'Cash on Delivery',
          },
          items: items.length > 0 ? items : [{
            productId: 'prod-legacy',
            name: 'Historical Order Item',
            size: 'M',
            quantity: 1,
            unitPrice: subtotal || total,
            price: subtotal || total,
          }],
          subtotal,
          taxAmount: tax,
          gstAmount: tax,
          shippingFee: Number(o.shippingFee || 0),
          totalAmount: total,
          total,
          status: o.status || 'Placed',
          paymentMethod: o.paymentMethod || 'Cash on Delivery',
          paymentStatus: o.paymentStatus || 'Pending',
          transactionId: o.transactionId || null,
          paymentDetails: o.paymentDetails || {},
          orderConfirmationEmailSent: Boolean(o.orderConfirmationEmailSent),
          paymentConfirmationEmailSent: Boolean(o.paymentConfirmationEmailSent),
          date: o.date || (o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString()),
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        });
        stats.ordersInserted++;
      } else {
        stats.ordersExisting++;
      }
    }

    // 3. Migrate Default Users
    for (const u of INITIAL_USERS) {
      const existing = await User.findOne({ email: u.email.toLowerCase() });
      if (!existing) {
        await User.create(u);
        stats.usersInserted++;
      } else {
        stats.usersExisting++;
      }
    }

    console.log(
      `[Migration] Completed. Products: ${stats.productsInserted} added (${stats.productsExisting} existing) | Orders: ${stats.ordersInserted} added (${stats.ordersExisting} existing) | Users: ${stats.usersInserted} added (${stats.usersExisting} existing)`
    );
    return stats;
  } catch (err) {
    console.error('[Migration Error] Data migration failed:', err.message);
    throw err;
  }
};

module.exports = migrateData;
