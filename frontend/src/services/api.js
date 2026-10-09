import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_USER } from './mockData';

// Helper to simulate asynchronous API delay
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for initial mock orders
const INITIAL_MOCK_ORDERS = [
  {
    orderId: 'ORD-849201',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      address: '42 Marine Drive, Apartment 5B',
      city: 'Mumbai',
      pincode: '400020',
      paymentMethod: 'UPI / GPay',
    },
    items: [
      {
        id: 'prod-1',
        name: 'Silk Wrap Floral Maxi Dress',
        category: 'Dresses',
        price: 3499,
        selectedSize: 'M',
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
      },
      {
        id: 'prod-4',
        name: 'Luminous Matte Velvet Lipstick Set',
        category: 'Cosmetics',
        price: 1499,
        selectedSize: 'One Size',
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
      }
    ],
    subtotal: 4998,
    gstAmount: 250,
    shippingFee: 0,
    totalAmount: 5248,
    status: 'Delivered',
  },
  {
    orderId: 'ORD-739104',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      name: 'Rohan Mehta',
      email: 'rohan.m@example.com',
      address: '15 MG Road, Indiranagar',
      city: 'Bengaluru',
      pincode: '560038',
      paymentMethod: 'Credit / Debit Card',
    },
    items: [
      {
        id: 'prod-2',
        name: 'Structured Italian Leather Tote',
        category: 'Bags',
        price: 5299,
        selectedSize: 'One Size',
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      }
    ],
    subtotal: 5299,
    gstAmount: 265,
    shippingFee: 0,
    totalAmount: 5564,
    status: 'Dispatched',
  }
];

export const apiService = {
  // Get catalog products (supports dynamic additions)
  async getProducts({ category = 'all', size = 'all', searchQuery = '', sortBy = 'featured', minPrice = 0, maxPrice = 10000 } = {}) {
    await delay();

    let catalog = MOCK_PRODUCTS;
    try {
      const stored = localStorage.getItem('stylestack_catalog');
      if (stored) {
        catalog = JSON.parse(stored);
      } else {
        localStorage.setItem('stylestack_catalog', JSON.stringify(MOCK_PRODUCTS));
      }
    } catch (e) {
      console.error('Error reading catalog', e);
    }

    let result = [...catalog];

    // Category filter
    if (category && category !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Size filter
    if (size && size !== 'all') {
      result = result.filter(
        (p) => p.sizes && (p.sizes.includes(size) || p.sizes.includes('One Size'))
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Price range filter
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

  // Add new fashion product (Admin)
  async addProduct(newProductData) {
    await delay(200);

    const newProduct = {
      id: 'prod-' + Date.now(),
      name: newProductData.name,
      category: newProductData.category.toLowerCase(),
      categoryName: newProductData.category,
      price: Number(newProductData.price),
      originalPrice: Math.round(Number(newProductData.price) * 1.3),
      rating: 5.0,
      reviewsCount: 1,
      sizes: newProductData.sizes || ['S', 'M', 'L', 'XL'],
      imageUrl: newProductData.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
      tag: 'New Arrival',
      description: newProductData.description || 'Newly added exclusive fashion piece.',
      inStock: Number(newProductData.inStock || 10),
    };

    try {
      const stored = localStorage.getItem('stylestack_catalog');
      const catalog = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];
      const updatedCatalog = [newProduct, ...catalog];
      localStorage.setItem('stylestack_catalog', JSON.stringify(updatedCatalog));
    } catch (e) {
      console.error('Error saving new product', e);
    }

    return {
      success: true,
      data: newProduct,
      message: `Product "${newProduct.name}" added to catalog successfully!`,
    };
  },

  // User Login Simulation
  async loginUser({ email, password, rememberMe = true }) {
    await delay(200);
    if (!email || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }
    
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
    await delay(200);
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

  // Place Order with Customer Form & Invoice breakdown
  async placeOrder({ customer, items, subtotal, gstAmount, shippingFee, totalAmount }) {
    await delay(300);

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const invoice = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: {
        name: customer.name || 'Guest Fashionista',
        email: customer.email || 'guest@stylestack.com',
        address: customer.address || 'Standard Delivery Address',
        city: customer.city || 'Mumbai',
        pincode: customer.pincode || '400001',
        paymentMethod: customer.paymentMethod || 'Cash on Delivery',
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

    try {
      const stored = localStorage.getItem('stylestack_orders');
      const orders = stored ? JSON.parse(stored) : INITIAL_MOCK_ORDERS;
      const updatedOrders = [invoice, ...orders];
      localStorage.setItem('stylestack_orders', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error('LocalStorage order save error', e);
    }

    return {
      success: true,
      data: invoice,
      message: `Order #${orderId} confirmed successfully!`,
    };
  },

  // Get all orders (Admin & Customer History)
  async getOrders() {
    await delay(100);
    try {
      const stored = localStorage.getItem('stylestack_orders');
      if (stored) {
        return { success: true, data: JSON.parse(stored) };
      }
      localStorage.setItem('stylestack_orders', JSON.stringify(INITIAL_MOCK_ORDERS));
      return { success: true, data: INITIAL_MOCK_ORDERS };
    } catch (e) {
      return { success: true, data: INITIAL_MOCK_ORDERS };
    }
  },

  // Update order status (Admin interactive toggle)
  async updateOrderStatus(orderId, newStatus) {
    await delay(100);
    try {
      const stored = localStorage.getItem('stylestack_orders');
      const orders = stored ? JSON.parse(stored) : INITIAL_MOCK_ORDERS;
      const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o));
      localStorage.setItem('stylestack_orders', JSON.stringify(updated));
      return { success: true, data: updated };
    } catch (e) {
      return { success: false, message: 'Could not update status' };
    }
  },

  async getCategories() {
    await delay(50);
    return { success: true, data: MOCK_CATEGORIES };
  },
};
