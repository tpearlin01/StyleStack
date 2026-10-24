const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, 'products.json');
const ordersFilePath = path.join(__dirname, 'orders.json');
const analyticsFilePath = path.join(__dirname, 'analytics.json');

// Initial loads from JSON seeds
let products = [];
try {
  products = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
} catch (e) {
  products = [];
}

let orders = [];
try {
  orders = JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));
} catch (e) {
  orders = [];
}

let analytics = { reviews: [], csatMetrics: {}, returnReasons: [], itemDiagnostics: [] };
try {
  analytics = JSON.parse(fs.readFileSync(analyticsFilePath, 'utf8'));
} catch (e) {
  analytics = { reviews: [], csatMetrics: {}, returnReasons: [], itemDiagnostics: [] };
}

let users = [
  {
    id: 'usr-admin',
    firstName: 'Admin',
    lastName: 'User',
    name: 'Admin User',
    email: 'admin@stylestack.com',
    password: 'adminPassword123',
    role: 'admin',
  },
  {
    id: 'usr-customer',
    firstName: 'Ananya',
    lastName: 'Sharma',
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    password: 'password123',
    role: 'customer',
  },
];

// Helper to persist if needed
const persistOrders = () => {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
  } catch (err) {
    // In-memory fallback if file system is read-only
  }
};

const persistProducts = () => {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  } catch (err) {
    // In-memory fallback
  }
};

const store = {
  // Products
  getProducts({ category, gender, search } = {}) {
    let result = [...products];

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      result = result.filter(
        (p) => (p.category && p.category.toLowerCase() === catLower) || (p.categoryName && p.categoryName.toLowerCase() === catLower)
      );
    }

    if (gender && gender !== 'all') {
      const genLower = gender.toLowerCase();
      result = result.filter((p) => p.gender && p.gender.toLowerCase() === genLower);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => {
        const text = [
          p.name || '',
          p.title || '',
          p.category || '',
          p.description || '',
          Array.isArray(p.tags) ? p.tags.join(' ') : '',
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }

    return {
      products: result,
      total: result.length,
    };
  },

  getProductById(id) {
    return products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));
  },

  addProduct(newProductData) {
    const id = newProductData.id || `prod-${Date.now()}`;
    const price = Number(newProductData.price) || 0;
    const stock = Number(newProductData.stock !== undefined ? newProductData.stock : (newProductData.inStock !== undefined ? newProductData.inStock : 15));
    const name = newProductData.name || newProductData.title || 'Untitled Apparel';
    const image = newProductData.image || newProductData.imageUrl || '';

    const product = {
      id,
      name,
      title: name,
      category: (newProductData.category || 'casual').toLowerCase(),
      categoryName: newProductData.categoryName || newProductData.category || 'Casual',
      gender: newProductData.gender || 'unisex',
      price,
      stock,
      inStock: stock,
      stockQuantity: stock,
      badge: newProductData.badge || newProductData.tag || 'New Arrival',
      image,
      imageUrl: image,
      sizes: newProductData.sizes || ['S', 'M', 'L', 'XL'],
      description: newProductData.description || '',
      rating: newProductData.rating || 5.0,
      reviewsCount: newProductData.reviewsCount || 1,
      brand: newProductData.brand || 'StyleStack',
      createdAt: new Date().toISOString(),
    };

    products.unshift(product);
    persistProducts();
    return product;
  },

  decrementStock(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) return null;

    const qty = Math.max(1, Number(quantity) || 1);
    const currentStock = Number(product.stock !== undefined ? product.stock : (product.inStock || 0));
    const newStock = Math.max(0, currentStock - qty);

    product.stock = newStock;
    product.inStock = newStock;
    product.stockQuantity = newStock;
    persistProducts();
    return product;
  },

  // Orders
  getOrders() {
    return [...orders].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  },

  getOrderById(id) {
    return orders.find((o) => o.id === id || o.orderId === id || o._id === id);
  },

  createOrder({ customerName, customerEmail, shippingAddress, items, paymentMethod = 'Cash on Delivery', customer }) {
    const name = customerName || (customer && customer.name);
    const email = customerEmail || (customer && customer.email);
    const address = shippingAddress || (customer && customer.address) || 'Standard Shipping Address';

    if (!name || !name.trim()) {
      const err = new Error('Customer name is required');
      err.status = 400;
      throw err;
    }

    if (!email || !email.trim()) {
      const err = new Error('Customer email is required');
      err.status = 400;
      throw err;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Order must contain at least one item');
      err.status = 400;
      throw err;
    }

    // Verify stock and compute subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const pid = item.id || item.productId || item._id;
      const itemName = item.name || item.title || 'Apparel Item';
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Number(item.price !== undefined ? item.price : (item.unitPrice || 0));

      if (pid) {
        const prod = this.getProductById(pid);
        if (prod) {
          const avail = Number(prod.stock !== undefined ? prod.stock : (prod.inStock || 0));
          if (avail < qty) {
            const err = new Error(`Insufficient stock for product "${prod.name}". Available: ${avail}, Requested: ${qty}`);
            err.status = 400;
            throw err;
          }
        }
      }

      subtotal += qty * unitPrice;
      validatedItems.push({
        id: pid ? String(pid) : `item-${Date.now()}`,
        productId: pid ? String(pid) : '',
        name: itemName,
        size: item.size || item.selectedSize || 'M',
        quantity: qty,
        unitPrice,
        price: unitPrice,
        imageUrl: item.imageUrl || item.image || '',
        image: item.image || item.imageUrl || '',
      });
    }

    // Deduct stock after verification
    for (const item of validatedItems) {
      if (item.id || item.productId) {
        this.decrementStock(item.id || item.productId, item.quantity);
      }
    }

    subtotal = parseFloat(subtotal.toFixed(2));
    const taxAmount = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const newOrder = {
      id: orderId,
      orderId,
      customerName: name.trim(),
      customerEmail: email.trim().toLowerCase(),
      shippingAddress: address,
      customer: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address,
        paymentMethod,
      },
      items: validatedItems,
      subtotal,
      taxAmount,
      totalAmount,
      status: 'Placed',
      paymentMethod,
      date: nowIso,
      createdAt: nowIso,
    };

    orders.unshift(newOrder);
    persistOrders();
    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const valid = ['Placed', 'Dispatched', 'Delivered'];
    if (!valid.includes(newStatus)) {
      const err = new Error(`Invalid status "${newStatus}". Allowed: ${valid.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const order = this.getOrderById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    persistOrders();
    return order;
  },

  // Analytics
  getAnalyticsOverview() {
    const totalRevenue = parseFloat(
      orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toFixed(2)
    );
    const totalOrders = orders.length;
    const lowStockItems = products.filter(
      (p) => Number(p.stock !== undefined ? p.stock : (p.inStock || 0)) < 10
    ).length;

    return {
      totalRevenue,
      totalOrders,
      lowStockItems,
    };
  },

  getFeedback() {
    const revs = analytics.reviews || [];
    const averageRating =
      revs.length > 0
        ? parseFloat((revs.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / revs.length).toFixed(1))
        : 4.8;
    const csatScore = analytics.csatMetrics?.overallScore || 4.8;

    return {
      reviews: revs,
      csatScore,
      averageRating,
      csatMetrics: analytics.csatMetrics || {},
    };
  },

  getReturns() {
    return {
      returnReasons: analytics.returnReasons || [],
      itemDiagnostics: analytics.itemDiagnostics || [],
      causeBreakdown: analytics.returnReasons || [],
    };
  },

  // Users & Auth
  findUserByEmail(email) {
    if (!email) return null;
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  registerUser({ firstName, lastName, name, email, password, role = 'customer' }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = this.findUserByEmail(normalizedEmail);
    if (existing) {
      const err = new Error('User with this email already exists');
      err.status = 400;
      throw err;
    }

    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Valued Customer';
    const id = `usr-${Date.now()}`;
    const newUser = {
      id,
      firstName: firstName || fullName.split(' ')[0],
      lastName: lastName || fullName.split(' ').slice(1).join(' '),
      name: fullName,
      email: normalizedEmail,
      password,
      role: role === 'admin' ? 'admin' : 'customer',
    };

    users.push(newUser);
    return newUser;
  },

  // Expose raw collections for testing or mocking
  _raw: {
    products,
    orders,
    analytics,
    users,
  },
};

module.exports = store;
