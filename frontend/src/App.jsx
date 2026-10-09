import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductFilter } from './components/ProductFilter';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutInvoiceModal } from './components/CheckoutInvoiceModal';
import { Footer } from './components/Footer';
import { ToastNotification } from './components/ToastNotification';
import { apiService } from './services/api';
import { Sparkles, ShoppingBag, SearchX, Filter } from 'lucide-react';

function CatalogContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  // Load products when filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiService
      .getProducts({
        category: selectedCategory,
        size: selectedSize,
        searchQuery,
        sortBy,
        minPrice,
        maxPrice,
      })
      .then((res) => {
        if (isMounted && res.success) {
          setProducts(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedSize, searchQuery, sortBy, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSearchQuery('');
    setSortBy('featured');
    setMinPrice(0);
    setMaxPrice(10000);
  };

  const handleShopNowClick = () => {
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero Section */}
      <HeroBanner onShopNow={handleShopNowClick} />

      {/* Main Catalog Container */}
      <main id="catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Catalog Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
              Curated Style Stack
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Explore Our Signature Collection
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Filter by luxury category, apparel sizes (S, M, L, XL), or search for specific items.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <ProductFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          sortBy={sortBy}
          onSelectSort={setSortBy}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }}
          onResetFilters={handleResetFilters}
          totalResults={products.length}
        />

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-slate-900">No Matching Items Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any products matching your current category or size filters. Try resetting your search filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <AuthModal />

      <CartDrawer
        onCheckoutSuccess={(invoice) => setInvoiceData(invoice)}
      />

      <CheckoutInvoiceModal
        invoice={invoiceData}
        onClose={() => setInvoiceData(null)}
      />

      <ToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CatalogContent />
      </CartProvider>
    </AuthProvider>
  );
}
