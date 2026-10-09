import React, { useState } from 'react';
import { ShoppingBag, Search, LogOut, Sparkles, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_CATEGORIES } from '../services/mockData';
import { BrandLogo } from './BrandLogo';

export const Navbar = ({ selectedCategory, onSelectCategory, searchQuery, setSearchQuery }) => {
  const { totalItemCount, openCart } = useCart();
  const { user, role, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md transition-all duration-200">
      {/* Top Announcement Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Festive Fashion Edition — Enjoy 20% OFF on Traditional Wear + Free Shipping &gt; ₹1,999!</span>
        <span className="hidden sm:inline-block bg-amber-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-2">
          Code: FESTIVE20
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Monogram */}
          <div className="flex items-center gap-6">
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
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Real-Time Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className={`relative flex items-center transition-all ${isSearchFocused ? 'ring-2 ring-amber-400/40' : ''}`}>
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search Kurta, Lehenga, Blazer, Dress, T-shirt..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-slate-900 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Account Controls */}
          <div className="flex items-center gap-3">
            
            {/* User Account Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-900 border border-slate-800 transition-all"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/40"
                />
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
                    <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase border border-amber-500/30">
                      {role || 'Customer'}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out to Portal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center p-2.5 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20 group font-bold"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
