import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, LogOut, Sparkles, X, ChevronDown, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_CATEGORIES } from '../services/mockData';
import { BrandLogo } from './BrandLogo';

const QUICK_SEARCH_TAGS = [
  'Summer',
  'Winter',
  'Formals',
  'Traditional',
  'Men',
  'Women',
  'Accessories',
];

export const Navbar = ({
  selectedCategory,
  onSelectCategory,
  searchQuery = '',
  setSearchQuery,
  onSearchChange,
}) => {
  const { totalItemCount, setIsCartOpen, openCart } = useCart();
  const { user, role, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync local input with incoming prop (e.g. on filter resets)
  useEffect(() => {
    setLocalSearchTerm(searchQuery);
  }, [searchQuery]);

  // Focus input automatically when dropdown opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Click outside and ESC key handlers to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  // Unify query updater support for either setSearchQuery or onSearchChange prop
  const updateQuery = (val) => {
    if (setSearchQuery) {
      setSearchQuery(val);
    } else if (onSearchChange) {
      onSearchChange(val);
    }
  };

  // Debounce search update (180ms) to prevent micro-keystroke image flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchQuery) {
        updateQuery(localSearchTerm);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  const handleInputFocus = () => {
    // Smoothly scroll down to catalog if user searches
    const catalogEl = document.getElementById('catalog');
    if (catalogEl && (window.scrollY < 200 || catalogEl.getBoundingClientRect().top > 250)) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalSearchTerm(val);
    if (val.trim().length > 0) {
      handleInputFocus();
    }
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    updateQuery('');
    searchInputRef.current?.focus();
  };

  const handleSelectTag = (tag) => {
    setLocalSearchTerm(tag);
    updateQuery(tag);
    handleInputFocus();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md transition-all duration-200">
      {/* Top Announcement Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800">
        <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        <span>Festive Fashion Edition — Enjoy 20% OFF on Traditional Wear + Free Shipping &gt; ₹1,999!</span>
        <span className="hidden sm:inline-block bg-rose-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">
          Code: FESTIVE20
        </span>
      </div>

      <div ref={searchContainerRef} className="w-full max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Brand Logo & Monogram */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <a href="#" className="flex items-center group text-left">
              <BrandLogo size="sm" subtitle="DRESS & CLOTHING HUB" />
            </a>

            {/* Category Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {MOCK_CATEGORIES.slice(0, 6).map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right-hand Action Bar: [Search Toggle Button] [Cart Icon Button] [Profile Dropdown] */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Interactive Search Button Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 rounded-full transition-all relative flex items-center justify-center cursor-pointer shadow-sm group ${
                isSearchOpen
                  ? 'bg-rose-600 text-white shadow-rose-900/30 ring-2 ring-rose-500/40'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 text-white'
              }`}
              aria-label="Toggle Search"
              title="Search catalog"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {searchQuery && !isSearchOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => (setIsCartOpen ? setIsCartOpen(true) : openCart())}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition relative flex items-center justify-center cursor-pointer shadow-sm group"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm pointer-events-none">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 sm:pr-3 rounded-full hover:bg-slate-900 border border-slate-800 transition-all cursor-pointer"
              >
                {/* Gender-neutral user silhouette icon */}
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 ring-2 ring-rose-500/30 shrink-0">
                  <User className="w-4 h-4 text-zinc-300" />
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-slate-200 max-w-[100px] truncate">
                  {user?.name || 'Customer'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Logged in as</p>
                    <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                    {user?.phone && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">📞 {user.phone}</p>
                    )}
                  </div>
                  <div className="px-4 py-2 text-xs text-slate-400 font-medium flex items-center justify-between">
                    <span>Role Session</span>
                    <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase border border-rose-500/30">
                      {role || 'Customer'}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out to Portal
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* RICH SEARCH DROPDOWN OVERLAY (WHEN OPEN) */}
        {isSearchOpen && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 w-80 sm:w-96 z-50 absolute right-16 top-16 animate-in fade-in zoom-in-95 duration-150 text-white">
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-zinc-200">Catalog Search</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close search dropdown"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Real Text Input */}
            <div className="relative flex items-center w-full bg-zinc-950 border border-zinc-700 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 rounded-xl px-3.5 py-2.5 transition-all shadow-inner">
              <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                value={localSearchTerm}
                onChange={handleInputChange}
                placeholder="Type to search (kurta, dress, blazer, shoes...)"
                className="w-full bg-transparent text-white placeholder-zinc-500 text-xs sm:text-sm font-medium outline-none focus:outline-none border-none p-0 cursor-text"
              />
              {localSearchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-2 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Category / Tag Chips */}
            <div className="mt-3.5 pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Quick Filter Tags
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SEARCH_TAGS.map((tag) => {
                  const isSelected = localSearchTerm.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                          : 'bg-zinc-800/90 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-700/80 hover:border-rose-500'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
