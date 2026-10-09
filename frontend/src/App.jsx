import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LandingLoginPortal } from './components/LandingLoginPortal';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductFilter } from './components/ProductFilter';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { ToastNotification } from './components/ToastNotification';
import { apiService } from './services/api';
import { SearchX, RotateCcw } from 'lucide-react';

function MainAppFlow() {
  const { session, isAuthenticated, role } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  // Modals State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProducts({
        category: selectedCategory,
        quickFilter: selectedQuickFilter,
        size: selectedSize,
        searchQuery,
        sortBy,
        minPrice,
        maxPrice,
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (e) {
      console.error('Error fetching products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'customer') {
      loadProducts();
    }
  }, [isAuthenticated, role, selectedCategory, selectedQuickFilter, selectedSize, searchQuery, sortBy, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedQuickFilter('all');
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

  // 1. UNAUTHENTICATED: Show Landing Login Portal
  if (!isAuthenticated || !session) {
    return <LandingLoginPortal onLoginSuccess={() => loadProducts()} />;
  }

  // 2. ADMIN ROLE: Show Admin Dashboard Portal
  if (role === 'admin') {
    return <AdminDashboard onProductAdded={() => loadProducts()} />;
  }

  // 3. CUSTOMER ROLE: Show Customer Storefront
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedQuickFilter('all');
        }}
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
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              StyleStack Apparel Catalog
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Curated Dress &amp; Clothing Collections
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore festive traditional ensembles, sharp formals, breathable summer wear, and handcrafted accessories.
            </p>
          </div>

          {searchQuery && (
            <div className="text-xs text-slate-600 font-medium bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span>Filtering search results for:</span>
              <strong className="text-slate-950 font-bold">"{searchQuery}"</strong>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <ProductFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedQuickFilter('all');
          }}
          selectedQuickFilter={selectedQuickFilter}
          onSelectQuickFilter={(qf) => {
            setSelectedQuickFilter(qf);
            if (qf === 'men' || qf === 'women') {
              setSelectedCategory(qf);
            }
          }}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          sortBy={sortBy}
          onSelectSort={setSortBy}
          onResetFilters={handleResetFilters}
          totalResults={products.length}
        />

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
              No Products Found
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? `No fashion items matched your search query "${searchQuery}". Try searching with different keywords.`
                : 'We couldn’t find any fashion items matching your current filters. Try resetting your filters to explore our full collection.'}
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-colors shadow-md flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
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

      <CartDrawer
        onOpenCheckoutModal={() => setIsCheckoutModalOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderConfirmed={() => {
          loadProducts();
        }}
      />

      <ToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppFlow />
      </CartProvider>
    </AuthProvider>
  );
}
