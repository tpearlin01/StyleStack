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
import { SearchX, RotateCcw, X, Sparkles } from 'lucide-react';
import FittingRoom from './components/FittingRoom';

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
  const [isFittingRoomOpen, setIsFittingRoomOpen] = useState(false);
  const [tryOnInitialItem, setTryOnInitialItem] = useState(null);

  const handleOpenTryOn = (item = null) => {
    setTryOnInitialItem(item);
    setIsFittingRoomOpen(true);
  };

  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  const loadProducts = async () => {
    // Only display full skeleton placeholders on initial mount, preventing violent flash on keystrokes
    if (!hasLoadedInitial) {
      setLoading(true);
    }
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
      setHasLoadedInitial(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'customer') {
      loadProducts();
    }
  }, [isAuthenticated, role, selectedCategory, selectedQuickFilter, selectedSize, searchQuery, sortBy, minPrice, maxPrice]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    
    // Smooth scroll to catalog grid when typing in Navbar if user is at the top/hero section
    if (query.trim().length > 0) {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        const rect = catalogEl.getBoundingClientRect();
        if (rect.top > 300 || window.scrollY < 200) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedQuickFilter('all');
        }}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        onSearchChange={handleSearchChange}
        onOpenFittingRoom={() => handleOpenTryOn(null)}
      />

      {/* Hero Section */}
      <HeroBanner onShopNow={handleShopNowClick} />

      {/* AI Virtual Try-On Fitting Room Teaser Bar */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-y border-zinc-800/80 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Sparkles className="w-5 h-5 fill-rose-500 text-rose-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                <span>AI Virtual Fitting Room Experience</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full uppercase border border-rose-500/30">
                  Interactive
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Mix &amp; match shirts, tailored trousers, and snapbacks in live multi-slot silhouette before buying.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenTryOn(null)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>Launch Fitting Room</span>
          </button>
        </div>
      </div>

      {/* Main Catalog Container */}
      <main id="catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Catalog Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-600 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>StyleStack Real-Time Catalog</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-slate-900">
              Curated Dress &amp; Clothing Collections
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore festive traditional wear, tailored formals, summer dresses, winter coats, and luxury accessories.
            </p>
          </div>

          {searchQuery && (
            <div className="text-xs text-slate-700 font-medium bg-rose-50/80 border border-rose-200 px-3.5 py-2 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-500">Search results for:</span>
                <strong className="text-slate-950 font-bold font-mono">"{searchQuery}"</strong>
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                  {products.length} {products.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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

        {/* Product Grid / Dynamic States */}
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
          /* Elegant Dark-Themed Empty State */
          <div className="bg-slate-950 text-white rounded-3xl p-10 sm:p-14 border border-slate-800 text-center max-w-lg mx-auto my-12 space-y-5 shadow-2xl shadow-slate-950/40 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
              <SearchX className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif-luxury text-2xl font-bold text-white">
                {searchQuery ? `No styles found for "${searchQuery}"` : 'No products found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `We couldn't find any fashion items matching "${searchQuery}". Try searching for categories like "summer", "winter", "formal", "kurta", "lehenga", or "dress".`
                  : 'We couldn’t find any fashion apparel matching your current combination of filters. Try resetting your filters to explore our full collection.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Search &amp; Reset Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
                onTryOn={(p) => handleOpenTryOn(p)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Floating AI Try-On Widget Button */}
      <button
        onClick={() => handleOpenTryOn(null)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-full shadow-2xl shadow-rose-950/60 border border-rose-400/40 flex items-center gap-2.5 font-bold text-xs cursor-pointer active:scale-95 transition-all group hover:shadow-rose-600/40 hover:-translate-y-0.5"
        title="Open AI Virtual Try-On Fitting Room"
      >
        <Sparkles className="w-4 h-4 text-white fill-white animate-pulse" />
        <span className="hidden sm:inline">AI Virtual Try-On</span>
        <span className="sm:hidden font-extrabold">⚡ Try-On</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold hidden md:inline">
          Fitting Room
        </span>
      </button>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <FittingRoom
        isOpen={isFittingRoomOpen}
        onClose={() => {
          setIsFittingRoomOpen(false);
          setTryOnInitialItem(null);
        }}
        initialItem={tryOnInitialItem}
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
