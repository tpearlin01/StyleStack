import React, { useState, useEffect } from 'react';
import { IndianRupee, Package, AlertTriangle, Plus, RefreshCw, LogOut, Image as ImageIcon } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

export const AdminDashboard = ({ onProductAdded }) => {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
  }, []);

  // Compute Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const lowStockCount = products.filter((p) => p.inStock < 10).length;

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
    else if (val === 'accessories') setCategoryName('Accessories');
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

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Revenue Metric */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
              <h3 className="font-serif-luxury text-3xl font-bold text-slate-900 mt-0.5">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium">Calculated from settled customer orders</p>
            </div>
          </div>

          {/* Total Orders Metric */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
              <h3 className="font-serif-luxury text-3xl font-bold text-slate-900 mt-0.5">
                {totalOrdersCount}
              </h3>
              <p className="text-[11px] text-indigo-600 font-medium">Active storefront customer checkouts</p>
            </div>
          </div>

          {/* Low Stock Alert Metric */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Items</p>
              <h3 className="font-serif-luxury text-3xl font-bold text-slate-900 mt-0.5">
                {lowStockCount}
              </h3>
              <p className="text-[11px] text-amber-600 font-medium">Items with &lt; 10 units in stock</p>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Catalog &amp; Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'add-product'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Apparel Item</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Recent Customer Orders ({orders.length})
          </button>
        </div>

        {/* TAB 1: ADD NEW APPAREL ITEM FORM */}
        {activeTab === 'add-product' && (
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Collection Category *
                  </label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    <option value="traditional">Festive / Traditional</option>
                    <option value="formal">Formals</option>
                    <option value="casual">Casual / Summer</option>
                    <option value="winter">Winter Wear</option>
                    <option value="accessories">Accessories</option>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3999"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Badge Highlight
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    <option value="New Arrival">New Arrival</option>
                    <option value="Festive Offer">Festive Offer</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Sizes
                </label>
                <div className="flex items-center gap-3">
                  {['S', 'M', 'L', 'XL', 'Free Size'].map((sz) => (
                    <label key={sz} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(sz)}
                        onChange={() => handleSizeToggle(sz)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>{sz}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Path */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Local Image Path / URL *
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/images/women tarditional dress/1183653B-EA4C-4D27-A91A-900C61473B85_600x.webp"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Local Image Presets:</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl('/images/women tarditional dress/1183653B-EA4C-4D27-A91A-900C61473B85_600x.webp')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                  >
                    Traditional Anarkali
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('/images/men formal/-473Wx593H-469514972-black-MODEL.avif')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                  >
                    Men Formal Tuxedo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('/images/summer women dress/1_d7ebe92d-271b-4782-9d23-fad006aebe0d.webp')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                  >
                    Summer Wrap Dress
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tailored silk festive attire with embellished craftsmanship..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Apparel Item to Catalog &amp; Storefront</span>
              </button>

            </form>
          </div>
        )}

        {/* TAB 2: CATALOG LIST */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-slate-900">Current Catalog Items</h3>
                <p className="text-xs text-slate-500">Live products available on customer storefront</p>
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
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-12 rounded-xl object-cover object-top border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {p.id}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">{p.categoryName || p.category}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-600">{p.gender}</td>
                      <td className="py-3.5 px-4 font-bold font-mono">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {p.tag || 'Standard'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          p.inStock < 10 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.inStock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Live
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS TABLE */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-slate-900">Recent Customer Orders</h3>
                <p className="text-xs text-slate-500">Manage order statuses and fulfillment tracking</p>
              </div>
              <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full">
                {orders.length} Orders Logged
              </span>
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
                    <tr key={o.orderId} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-mono font-bold text-amber-600">
                        {o.orderId}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{o.customer?.name}</p>
                        <p className="text-[10px] text-slate-400">{o.customer?.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{o.items?.length} Items</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {o.items?.map((i) => `${i.name} (${i.selectedSize})`).join(', ')}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{o.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <select
                          value={o.status || 'Placed'}
                          onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                          className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:outline-none ${
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

      </main>
    </div>
  );
};
