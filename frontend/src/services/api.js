import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_USER } from './mockData';

// Helper to simulate asynchronous API delay
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // Fetch all catalog items with filtering, search, and sorting
  async getProducts({ category = 'all', size = 'all', searchQuery = '', sortBy = 'featured', minPrice = 0, maxPrice = 10000 } = {}) {
    await delay();

    let result = [...MOCK_PRODUCTS];

    // Filter by Category
    if (category && category !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by Size
    if (size && size !== 'all') {
      result = result.filter(
        (p) => p.sizes && (p.sizes.includes(size) || p.sizes.includes('One Size'))
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Filter by Price Range
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return {
      success: true,
      data: result,
      total: result.length,
    };
  },

  // Fetch single product by ID
  async getProductById(id) {
    await delay();
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }
    return { success: true, data: product };
  },

  // User Login Simulation
  async loginUser({ email, password, rememberMe = true }) {
    await delay(300);
    if (!email || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }
    
    // Simulate valid login
    const userSession = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      avatar: MOCK_USER.avatar,
      rememberMe,
      token: 'mock-jwt-token-' + Date.now(),
    };

    return {
      success: true,
      data: userSession,
      message: 'Successfully logged in!',
    };
  },

  // User Registration Simulation
  async registerUser({ fullName, email, password }) {
    await delay(300);
    if (!fullName || !email || !password) {
      return { success: false, message: 'Please fill in all required fields.' };
    }

    const userSession = {
      id: 'usr-' + Date.now(),
      name: fullName,
      email,
      avatar: MOCK_USER.avatar,
      token: 'mock-jwt-token-' + Date.now(),
    };

    return {
      success: true,
      data: userSession,
      message: 'Account created successfully!',
    };
  },

  // Order Placement & Invoice Breakdown Generator
  async placeOrder({ customer, items, subtotal, gstAmount, shippingFee, totalAmount }) {
    await delay(400);

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const invoice = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: customer || {
        name: 'Guest Customer',
        email: 'guest@stylestack.com',
      },
      items,
      subtotal,
      gstAmount,
      shippingFee,
      totalAmount,
      status: 'Placed',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };

    // Store order in local storage for order history reference
    try {
      const existingOrders = JSON.parse(localStorage.getItem('stylestack_orders') || '[]');
      localStorage.setItem('stylestack_orders', JSON.stringify([invoice, ...existingOrders]));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }

    return {
      success: true,
      data: invoice,
      message: `Order #${orderId} confirmed successfully!`,
    };
  },

  // Get categories
  async getCategories() {
    await delay(50);
    return { success: true, data: MOCK_CATEGORIES };
  },
};
