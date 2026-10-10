import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_USER } from './mockData';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

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
      paymentMethod: 'Instant UPI / GPay',
    },
    items: [
      {
        id: 'prod-w-trad-1',
        name: 'Embroidered Royal Anarkali Set',
        category: 'Festive / Traditional',
        price: 4799,
        selectedSize: 'M',
        quantity: 1,
        imageUrl: '/images/women tarditional dress/1183653B-EA4C-4D27-A91A-900C61473B85_600x.webp',
      },
      {
        id: 'prod-w-acc-1',
        name: 'Artisan Gold-Plated Statement Earrings & Choker',
        category: 'Accessories',
        price: 1499,
        selectedSize: 'Free Size',
        quantity: 1,
        imageUrl: '/images/women accessories/images (1).jpg',
      }
    ],
    subtotal: 6298,
    gstAmount: 315,
    shippingFee: 0,
    totalAmount: 6613,
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
        id: 'prod-m-form-1',
        name: 'Bespoke Slim-Fit Tuxedo Jacket',
        category: 'Formals',
        price: 5499,
        selectedSize: 'L',
        quantity: 1,
        imageUrl: '/images/men formal/-473Wx593H-469514972-black-MODEL.avif',
      }
    ],
    subtotal: 5499,
    gstAmount: 275,
    shippingFee: 0,
    totalAmount: 5774,
    status: 'Dispatched',
  }
];

export const apiService = {
  // Get catalog products with multi-dimensional filtering, search, and sorting
  async getProducts({
    category = 'all',
    quickFilter = 'all',
    size = 'all',
    searchQuery = '',
    sortBy = 'featured',
    minPrice = 0,
    maxPrice = 10000,
  } = {}) {
    await delay();

    let catalog = MOCK_PRODUCTS;
    try {
      const stored = localStorage.getItem('stylestack_catalog_v9');
      if (stored) {
        catalog = JSON.parse(stored);
      } else {
        catalog = MOCK_PRODUCTS;
        localStorage.setItem('stylestack_catalog_v9', JSON.stringify(MOCK_PRODUCTS));
      }
    } catch (e) {
      console.error('Error reading catalog', e);
    }

    let result = [...catalog];

    const hasSearchQuery = Boolean(searchQuery && searchQuery.trim());

    // Filter by Category or Gender (only when NOT performing a global text search)
    if (!hasSearchQuery && category && category !== 'all') {
      const catLower = category.toLowerCase();
      if (catLower === 'men') {
        result = result.filter((p) => p.gender === 'men' || p.category === 'men');
      } else if (catLower === 'women') {
        result = result.filter((p) => p.gender === 'women' || p.category === 'women');
      } else {
        result = result.filter(
          (p) => p.category && p.category.toLowerCase() === catLower
        );
      }
    }

    // Filter by Quick Filter Chips (only when NOT performing a global text search)
    if (!hasSearchQuery && quickFilter && quickFilter !== 'all') {
      if (quickFilter === 'new-arrivals') {
        result = result.filter((p) => p.isNewArrival || p.tag === 'New Arrival');
      } else if (quickFilter === 'festive-offers') {
        result = result.filter((p) => p.isFestiveOffer || p.tag === 'Festive Offer');
      } else if (quickFilter === 'on-sale') {
        result = result.filter((p) => p.isOnSale || p.tag === 'Sale');
      } else if (quickFilter === 'men') {
        result = result.filter((p) => p.gender === 'men');
      } else if (quickFilter === 'women') {
        result = result.filter((p) => p.gender === 'women');
      }
    }

    // Filter by Size
    if (size && size !== 'all') {
      result = result.filter(
        (p) => p.sizes && (p.sizes.includes(size) || p.sizes.includes('Free Size') || p.sizes.includes('One Size'))
      );
    }

    // Global Smart Search Query Filter (Searches Entire Catalog Across All Fields)
    if (hasSearchQuery) {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      result = result.filter((p) => {
        const searchableCorpus = [
          p.name || '',
          p.title || '',
          p.category || '',
          p.categoryName || '',
          p.gender || '',
          p.tag || '',
          p.season || '',
          p.style || '',
          Array.isArray(p.tags) ? p.tags.join(' ') : '',
          p.description || '',
          p.imageUrl || '',
          p.image || '',
          // Category expansions and aliases
          (p.category === 'formal' ? 'formal formals formalwear office workwear suit blazer shirt dress' : ''),
          (p.category === 'traditional' ? 'traditional ethnic festive celebration kurta saree anarkali sherwani tarditional wedding' : ''),
          (p.category === 'winter' ? 'winter warm cold coat jacket sweater cardigan thermal wool' : ''),
          (p.category === 'casual' ? 'casual summer dress beach sundress slip maxi midi' : ''),
          (p.category === 'men-tshirts' || p.category === 'women-tshirts' ? 't-shirt tshirt tshirts tee tees top summer' : ''),
          (p.category === 'accessories' ? 'accessories accessory cap hat watch belt wallet jewelry bag sunglasses jhumka choker' : ''),
          (p.gender === 'men' ? 'men mens men\'s' : ''),
          (p.gender === 'women' ? 'women womens women\'s' : ''),
        ].join(' ').toLowerCase();

        // Every term entered must match the product's searchable data
        return terms.every((rawTerm) => {
          // Direct substring match
          if (searchableCorpus.includes(rawTerm)) return true;

          // Stemming: plural / singular matching (e.g. 'formals' -> 'formal', 'accessories' -> 'accessory')
          let stemmed = rawTerm;
          if (rawTerm.endsWith('ies')) {
            stemmed = rawTerm.slice(0, -3) + 'y';
            if (searchableCorpus.includes(stemmed)) return true;
          } else if (rawTerm.endsWith('es')) {
            stemmed = rawTerm.slice(0, -2);
            if (searchableCorpus.includes(stemmed)) return true;
          } else if (rawTerm.endsWith('s') && rawTerm.length > 3) {
            stemmed = rawTerm.slice(0, -1);
            if (searchableCorpus.includes(stemmed)) return true;
          }

          // Traditional / tarditional typo and folder name matching
          if (rawTerm.includes('traditional') && (searchableCorpus.includes('traditional') || searchableCorpus.includes('tarditional'))) {
            return true;
          }

          // Hyphenated variants (e.g. 't-shirt' <-> 'tshirt')
          const unhyphenated = rawTerm.replace(/[^a-z0-9]/g, '');
          if (unhyphenated && searchableCorpus.includes(unhyphenated)) {
            return true;
          }

          return false;
        });
      });
    }

    // Filter by Price
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
    await delay(150);

    const newProduct = {
      id: 'prod-' + Date.now(),
      name: newProductData.name,
      gender: newProductData.gender || 'women',
      category: (newProductData.category || 'casual').toLowerCase(),
      categoryName: newProductData.categoryName || newProductData.category || 'Casual / Summer',
      price: Number(newProductData.price),
      originalPrice: Math.round(Number(newProductData.price) * 1.3),
      rating: 5.0,
      reviewsCount: 1,
      sizes: newProductData.sizes || ['S', 'M', 'L', 'XL'],
      imageUrl: newProductData.imageUrl || '/images/women formal/Asymmetrical_Co_ord_Set-Blue-JA0100-010001-2819.webp',
      tag: newProductData.tag || 'New Arrival',
      discountPercent: 20,
      isFestiveOffer: newProductData.tag === 'Festive Offer',
      isOnSale: newProductData.tag === 'Sale',
      isNewArrival: true,
      description: newProductData.description || 'Newly added exclusive fashion piece.',
      inStock: Number(newProductData.inStock || 15),
    };

    try {
      const stored = localStorage.getItem('stylestack_catalog_v9');
      const catalog = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];
      const updatedCatalog = [newProduct, ...catalog];
      localStorage.setItem('stylestack_catalog_v9', JSON.stringify(updatedCatalog));
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
    await delay(150);
    if (!email || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }
    
    const userSession = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
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

  // Place Order
  async placeOrder({ customer, items, subtotal, gstAmount, shippingFee, totalAmount }) {
    await delay(200);

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const invoice = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: {
        name: customer.name || 'Fashion Customer',
        email: customer.email || 'customer@stylestack.com',
        address: customer.address || 'Standard Delivery Address',
        state: customer.state || '',
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

  // Get all orders
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

  // Update order status
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
