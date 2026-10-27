import React, { useState, useEffect, useMemo } from 'react';
import {
  IndianRupee,
  Package,
  AlertTriangle,
  Plus,
  RefreshCw,
  LogOut,
  Star,
  MessageSquare,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Filter,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import {
  INITIAL_CUSTOMER_REVIEWS,
  CSAT_METRICS,
  RETURN_REASON_BREAKDOWN,
  ITEM_RETURN_DIAGNOSTICS,
} from '../data/adminIntelligenceData';

// Fallback image helper
const fallbackImg = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80";

export const AdminDashboard = ({ onProductAdded }) => {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Customer Reviews State
  const [reviews, setReviews] = useState(INITIAL_CUSTOMER_REVIEWS);
  const [reviewFilter, setReviewFilter] = useState('all');

  // Restock feedback state
  const [restockStatus, setRestockStatus] = useState({});

  // Add Product Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('traditional');
  const [categoryName, setCategoryName] = useState('Festive / Traditional');
  const [gender, setGender] = useState('women');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('15');
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [tag, setTag] = useState('New Arrival');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        apiService.getProducts({ category: 'all' }),
        apiService.getOrders(),
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (orderRes.success) setOrders(orderRes.data);
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Real-time synchronization listeners across tabs & storefront checkout
    const handleSync = () => {
      loadAdminData();
    };

    window.addEventListener('stylestack_orders_updated', handleSync);
    window.addEventListener('stylestack_catalog_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('stylestack_orders_updated', handleSync);
      window.removeEventListener('stylestack_catalog_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Compute Live KPI Metrics directly from real stored data
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  const totalOrdersCount = orders.length;

  const lowStockCount = useMemo(() => {
    return products.filter((p) => Number(p.inStock) < 10).length;
  }, [products]);

  const catalogItems = products;

  // Aggregate Top Selling Products combining storefront orders & baseline sales
  const topSellingProducts = useMemo(() => {
    // Map live orders sales count
    const liveSalesMap = {};
    orders.forEach((ord) => {
      if (ord.items && Array.isArray(ord.items)) {
        ord.items.forEach((item) => {
          const key = item.id || item.name;
          const qty = Number(item.quantity) || 1;
          liveSalesMap[key] = (liveSalesMap[key] || 0) + qty;
        });
      }
    });

    return [...products]
      .map((p) => {
        const liveCount = liveSalesMap[p.id] || liveSalesMap[p.name] || 0;
        // Consistent baseline sales seed based on popularity
        const baseline = Math.max(12, Math.floor((p.reviewsCount || 15) * 1.6));
        const totalSold = baseline + liveCount;
        const currentStock = Number(p.inStock) || 0;

        // Velocity & Restock determination
        let stockBadge = 'Optimal Stock';
        let badgeType = 'optimal';

        if (currentStock < 10 && totalSold >= 25) {
          stockBadge = 'Restock Urgently';
          badgeType = 'urgent';
        } else if (totalSold >= 35 || currentStock <= 15) {
          stockBadge = 'High Demand';
          badgeType = 'high';
        }

        return {
          ...p,
          totalSold,
          liveCount,
          totalRevenueGenerated: totalSold * (Number(p.price) || 0),
          stockBadge,
          badgeType,
        };
      })
      .sort((a, b) => b.totalSold - a.totalSold);
  }, [products, orders]);

  // Handle Quick Restock Action
  const handleQuickRestock = async (productId) => {
    try {
      setRestockStatus((prev) => ({ ...prev, [productId]: 'restocking' }));
      const res = await apiService.restockProduct(productId, 20);
      if (res && res.success) {
        await loadAdminData();
        setRestockStatus((prev) => ({ ...prev, [productId]: 'success' }));
        setTimeout(() => {
          setRestockStatus((prev) => ({ ...prev, [productId]: null }));
        }, 2500);
      }
    } catch (err) {
      console.error('Restock failed:', err);
      setRestockStatus((prev) => ({ ...prev, [productId]: 'error' }));
    }
  };

  const handleSizeToggle = (sz) => {
    if (selectedSizes.includes(sz)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== sz));
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    if (val === 'traditional') setCategoryName('Festive / Traditional');
    else if (val === 'formal') setCategoryName('Formals');
    else if (val === 'casual') setCategoryName('Casual / Summer');
    else if (val === 'winter') setCategoryName('Winter Wear');
    else if (val === 'accessories') setCategoryName('Bags & Accessories');
    else if (val === 'shoes') setCategoryName('Footwear');
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!title || !price || !imageUrl) {
      setFormError('Please fill in product title, price, and image URL.');
      return;
    }

    try {
      const res = await apiService.addProduct({
        name: title,
        category,
        categoryName,
        gender,
        price: Number(price),
        sizes: selectedSizes.length > 0 ? selectedSizes : ['M'],
        tag,
        inStock: Number(stockQuantity),
        imageUrl,
        description: description || `Handcrafted ${categoryName.toLowerCase()} fashion piece.`,
      });

      if (res.success) {
        setFormSuccess(res.message);
        setTitle('');
        setPrice('');
        setImageUrl('');
        setDescription('');
        await loadAdminData();
        if (onProductAdded) {
          onProductAdded();
        }
      }
    } catch (err) {
      setFormError('Failed to add product. Please check inputs.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await apiService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error('Status update failed', e);
    }
  };

  // Filtered customer reviews
  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter((r) => r.tag.toLowerCase() === reviewFilter.toLowerCase());
  }, [reviews, reviewFilter]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" subtitle="ADMIN PORTAL" />
            <span className="hidden sm:inline-block text-xs text-slate-400 border-l border-slate-800 pl-3">
              Authenticated as {user?.email || 'Administrator'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
              <span className="hidden md:inline">Sync Live Data</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Admin Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards Row - Dynamic Real-time Calculations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Revenue Metric */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
              <h3 className="font-serif-luxury text-3xl font-bold text-slate-900 mt-0.5">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Calculated live from {orders.length} confirmed orders
              </p>
            </div>
          </div>

          {/* Total Orders Metric */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
              <h3 className="font-serif-luxury text-3xl font-bold text-slate-900 mt-0.5">
                {totalOrdersCount}
              </h3>
              <p className="text-[11px] text-indigo-600 font-medium">Synchronized storefront checkouts</p>
            </div>
          </div>

          {/* Low Stock Alert Metric */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
              lowStockCount > 0
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Items</p>
              <h3 className="font-serif-luxury text-3xl font-bold text-slate-900 mt-0.5">
                {lowStockCount}
              </h3>
              <p className="text-[11px] text-rose-600 font-medium">
                Products with &lt; 10 units in stock
              </p>
            </div>
          </div>

        </div>

        {/* Reordered Admin Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 pb-2 mb-6 overflow-x-auto text-sm font-medium scrollbar-none">
          {/* 1. Recent Orders */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-b-2 border-rose-600 text-rose-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent Customer Orders ({orders.length || 33})
          </button>

          {/* 2. Customer Feedback & Reviews */}
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`pb-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'feedback'
                ? 'border-b-2 border-rose-600 text-rose-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Customer Feedback &amp; Reviews</span>
            <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-semibold">4.8 ★</span>
          </button>

          {/* 3. Sales & Return Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-b-2 border-rose-600 text-rose-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales &amp; Return Analytics
          </button>

          {/* 4. Catalog & Inventory */}
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`pb-2 transition-colors whitespace-nowrap ${
              activeTab === 'catalog' || activeTab === 'overview'
                ? 'border-b-2 border-rose-600 text-rose-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catalog &amp; Inventory ({catalogItems.length || 133})
          </button>

          {/* 5. Add New Apparel Item */}
          <button
            type="button"
            onClick={() => setActiveTab('add_item')}
            className={`pb-2 transition-colors whitespace-nowrap ${
              activeTab === 'add_item' || activeTab === 'add-product'
                ? 'border-b-2 border-rose-600 text-rose-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Add New Apparel Item
          </button>
        </div>

        {/* 1. ORDERS VIEW - DEFAULT TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-slate-900">Recent Customer Orders</h3>
                <p className="text-xs text-slate-500">Live order stream synced with customer storefront checkout</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  {orders.length} Live Orders
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Items Summary</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-6 text-right">Status Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-rose-600">
                        {o.orderId}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{o.customer?.name}</p>
                        <p className="text-[10px] text-slate-400">{o.customer?.email}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {o.customer?.city}{o.customer?.state ? `, ${o.customer?.state}` : ''} • {o.customer?.paymentMethod}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{o.items?.length || 1} Item(s)</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {o.items?.map((i) => `${i.name} (${i.selectedSize || 'M'})`).join(', ')}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{o.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <select
                          value={o.status || 'Placed'}
                          onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:outline-none transition-all ${
                            o.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : o.status === 'Dispatched'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          }`}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. CUSTOMER FEEDBACK & REVIEWS */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            
            {/* Top Score & Sentiment Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CSAT Score Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Satisfaction (CSAT)</p>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="font-serif-luxury text-4xl font-bold text-slate-900">
                      {CSAT_METRICS.overallScore}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto">
                      {CSAT_METRICS.satisfactionRate}% Positive
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs text-slate-500 font-medium ml-2">
                      Based on {CSAT_METRICS.totalReviews} verified ratings
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <ShieldCheck className="w-4 h-4" /> 100% Verified Purchases
                  </span>
                  <span>Benchmark: 4.4 ★</span>
                </div>
              </div>

              {/* Star Rating Breakdown Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Rating Distribution</p>
                {CSAT_METRICS.starBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-10 font-bold text-slate-700 flex items-center gap-1">
                      {row.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${row.percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-9 text-right font-medium text-slate-400">
                      {row.percentage}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Sentiment Distribution Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sentiment Distribution</p>
                  
                  {/* Visual Bar Segment */}
                  <div className="h-3 w-full rounded-full overflow-hidden flex gap-1 mt-3 mb-4">
                    <div
                      className="bg-emerald-500 rounded-l-full"
                      style={{ width: `${CSAT_METRICS.sentimentDistribution.positive}%` }}
                      title="Positive: 88%"
                    ></div>
                    <div
                      className="bg-amber-400"
                      style={{ width: `${CSAT_METRICS.sentimentDistribution.neutral}%` }}
                      title="Neutral: 8%"
                    ></div>
                    <div
                      className="bg-rose-500 rounded-r-full"
                      style={{ width: `${CSAT_METRICS.sentimentDistribution.negative}%` }}
                      title="Critical: 4%"
                    ></div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Positive Sentiment
                      </span>
                      <span className="font-bold font-mono text-emerald-600">
                        {CSAT_METRICS.sentimentDistribution.positive}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        Neutral / Inquiries
                      </span>
                      <span className="font-bold font-mono text-amber-600">
                        {CSAT_METRICS.sentimentDistribution.neutral}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Critical / Action Required
                      </span>
                      <span className="font-bold font-mono text-rose-600">
                        {CSAT_METRICS.sentimentDistribution.negative}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  AI Sentiment Classification analyzed across buyer reviews and returns
                </p>
              </div>

            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter Reviews:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      reviewFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({reviews.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('positive')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      reviewFilter === 'positive'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Positive ({reviews.filter((r) => r.tag === 'Positive').length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('critical')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      reviewFilter === 'critical'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    Critical ({reviews.filter((r) => r.tag === 'Critical').length})
                  </button>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Showing {filteredReviews.length} feedback records
              </span>
            </div>

            {/* Individual Customer Feedback Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Product Preview & Tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.productImage || rev.image || fallbackImg}
                          alt={rev.productName}
                          className="w-12 h-14 rounded-xl object-cover object-top border border-slate-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImg;
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                            {rev.productName}
                          </h4>
                          <span className="text-[11px] font-semibold text-rose-600">
                            {rev.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                          rev.tag === 'Positive'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {rev.tag}
                      </span>
                    </div>

                    {/* Customer Info & Star Rating */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800">{rev.customerName}</span>
                          {rev.verified && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.city} • {rev.date}</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs text-slate-600 leading-relaxed mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
                      "{rev.reviewText}"
                    </p>
                  </div>

                  {/* Card Footer: Fit Note & Helpful Votes */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                      Fit: {rev.fitFeedback}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <ThumbsUp className="w-3 h-3 text-slate-400" /> {rev.helpfulCount} helpful votes
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 3. SALES & RETURN ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            
            {/* SECTION 1: TOP SELLING PRODUCTS & INVENTORY INTELLIGENCE */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-rose-600" />
                    <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
                      Top Selling Products &amp; Stock Recommendations
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ranked by total units sold with automated restocking velocity recommendations
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                    Restock Urgently
                  </span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                    High Demand
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                    Optimal Stock
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Rank &amp; Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Units Sold</th>
                      <th className="py-3.5 px-4">Stock Remaining</th>
                      <th className="py-3.5 px-4">Revenue (Gross)</th>
                      <th className="py-3.5 px-4">Stock Intelligence Badge</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {topSellingProducts.slice(0, 10).map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-6 flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900 font-black'
                              : idx === 2
                              ? 'bg-amber-700 text-white font-black'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            #{idx + 1}
                          </span>
                          <img
                            src={p.imageUrl || p.image || fallbackImg}
                            alt={p.name}
                            className="w-10 h-12 rounded-xl object-cover object-top border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = fallbackImg;
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">₹{p.price} / unit</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">{p.categoryName || p.category}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-base text-slate-900">
                          {p.totalSold} units
                          {p.liveCount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                              +{p.liveCount} live order(s)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            p.inStock < 10
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {p.inStock} units left
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          ₹{p.totalRevenueGenerated.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.badgeType === 'urgent' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-sm animate-pulse">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Restock Urgently
                            </span>
                          ) : p.badgeType === 'high' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Flame className="w-3 h-3 text-amber-600" />
                              High Demand
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Optimal Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleQuickRestock(p.id)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                              restockStatus[p.id] === 'success'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900 shadow-sm'
                            }`}
                          >
                            {restockStatus[p.id] === 'restocking'
                              ? 'Adding...'
                              : restockStatus[p.id] === 'success'
                              ? '✓ +20 Restocked'
                              : '+20 Units'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: PRODUCT RETURN & DEFECT ANALYSIS */}
            <div className="space-y-6">
              
              {/* Return Metrics Overview Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Units Returned</p>
                  <h4 className="font-serif-luxury text-2xl font-bold text-slate-900 mt-1">18 Units</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Across last 450 apparel shipments</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Return Rate %</p>
                  <h4 className="font-serif-luxury text-2xl font-bold text-emerald-600 mt-1">3.8%</h4>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Well below 6.2% luxury benchmark</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolved as Size Exchange</p>
                  <h4 className="font-serif-luxury text-2xl font-bold text-indigo-600 mt-1">77.7%</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">14 of 18 retained via sizing exchange</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Defect Resolution Speed</p>
                  <h4 className="font-serif-luxury text-2xl font-bold text-slate-900 mt-1">24 Hours</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reverse pickup &amp; doorstep swap</p>
                </div>
              </div>

              {/* Categorized Breakdown by Specific Return Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {RETURN_REASON_BREAKDOWN.map((reason) => (
                  <div
                    key={reason.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${reason.colorClass}`}>
                          {reason.category}
                        </span>
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {reason.percentage}%
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-3 mb-4">
                        <div
                          className={`h-full ${reason.barClass} rounded-full`}
                          style={{ width: `${reason.percentage}%` }}
                        ></div>
                      </div>

                      <p className="text-xs font-bold text-slate-800 mb-2">Common Customer Feedback:</p>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {reason.topComplaints.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-slate-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-medium">
                      <span>Volume: {reason.unitsReturned} garments</span>
                      <span className="text-slate-700 font-bold">Action Assigned</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Itemized Return Diagnostics & Suggested Action Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
                      Product Return Diagnostics &amp; Corrective Actions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Detailed item analysis with actionable improvements to prevent return friction
                    </p>
                  </div>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">
                    Quality Intelligence
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-6">Product Item</th>
                        <th className="py-3.5 px-4">Return Reason &amp; Customer Quote</th>
                        <th className="py-3.5 px-4">Frequency</th>
                        <th className="py-3.5 px-4">Severity</th>
                        <th className="py-3.5 px-4">Action Suggested</th>
                        <th className="py-3.5 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {ITEM_RETURN_DIAGNOSTICS.map((diag) => (
                        <tr key={diag.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-6 flex items-center gap-3">
                            <img
                              src={diag.image || diag.productImage || fallbackImg}
                              alt={diag.productName}
                              className="w-10 h-12 rounded-xl object-cover object-top border border-slate-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackImg;
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">{diag.productName}</p>
                              <span className="text-[10px] font-semibold text-rose-600">{diag.category}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-bold text-slate-900">{diag.reason}</p>
                            <p className="text-[11px] text-slate-500 italic mt-0.5">"{diag.customerFeedback}"</p>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {diag.frequency}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              diag.severity === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : diag.severity === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {diag.severity}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="text-xs text-indigo-900 font-semibold bg-indigo-50/70 p-2 rounded-xl border border-indigo-100">
                              {diag.actionSuggested}
                            </p>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              diag.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : diag.status === 'Scheduled'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              {diag.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 4. CATALOG LIST */}
        {(activeTab === 'catalog' || activeTab === 'overview') && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-slate-900">Current Catalog Items</h3>
                <p className="text-xs text-slate-500">Live products available on customer storefront with live stock tracking</p>
              </div>
              <button
                onClick={loadAdminData}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                title="Refresh List"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Gender</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Badge</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-6 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <img
                          src={p.imageUrl || p.image || fallbackImg}
                          alt={p.name}
                          className="w-10 h-12 rounded-xl object-cover object-top border border-slate-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImg;
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {p.id}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">{p.categoryName || p.category}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-600">{p.gender}</td>
                      <td className="py-3.5 px-4 font-bold font-mono">₹{p.price?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          {p.tag || 'Standard'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 ${
                          p.inStock < 10
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {p.inStock < 10 && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>}
                          {p.inStock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleQuickRestock(p.id)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            restockStatus[p.id] === 'success'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white border-slate-200'
                          }`}
                        >
                          {restockStatus[p.id] === 'restocking'
                            ? 'Adding...'
                            : restockStatus[p.id] === 'success'
                            ? '✓ +20 Added'
                            : '+20 Restock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ADD NEW APPAREL ITEM FORM */}
        {(activeTab === 'add_item' || activeTab === 'add-product') && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif-luxury text-2xl font-bold text-slate-900">Add New Fashion Apparel</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload new catalog items with local images, collection category, available sizes, and stock.
              </p>
            </div>

            {formSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Silk Zari Embroidered Kurta"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Collection Category *
                  </label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                  >
                    <option value="traditional">Festive / Traditional</option>
                    <option value="formal">Formals</option>
                    <option value="casual">Casual / Summer</option>
                    <option value="winter">Winter Wear</option>
                    <option value="accessories">Bags &amp; Accessories</option>
                    <option value="shoes">Footwear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="400"
                    max="999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="400 - 999"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Sizes
                </label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleSizeToggle(sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedSizes.includes(sz)
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Image Path / URL *
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/women tarditional dress/... or https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tailored silk festive attire with embellished craftsmanship..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Apparel Item to Catalog &amp; Storefront</span>
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
