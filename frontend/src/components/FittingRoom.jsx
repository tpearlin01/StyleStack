import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, ShoppingBag, X, Check, Shirt, Layers, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../services/mockData';

export default function FittingRoom({ isOpen, onClose, initialItem, onAddToCart }) {
  const { addToCart } = useCart();

  const [equipped, setEquipped] = useState({
    head: null,
    top: null,
    bottom: null,
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'top' | 'bottom' | 'head'

  // Load try-on items from MOCK_PRODUCTS
  const tryOnItems = {
    top: MOCK_PRODUCTS.filter((p) => p.isTryOnEligible && p.tryOnCategory === 'top'),
    bottom: MOCK_PRODUCTS.filter((p) => p.isTryOnEligible && p.tryOnCategory === 'bottom'),
    head: MOCK_PRODUCTS.filter((p) => p.isTryOnEligible && p.tryOnCategory === 'head'),
  };

  // If opened with an initialItem from a ProductCard click, auto-equip it
  useEffect(() => {
    if (initialItem && initialItem.tryOnCategory) {
      setEquipped((prev) => ({
        ...prev,
        [initialItem.tryOnCategory]: initialItem,
      }));
      // Also switch active tab to match
      setActiveTab(initialItem.tryOnCategory);
    }
  }, [initialItem]);

  // Set default initial look if everything is empty on first opening
  useEffect(() => {
    if (isOpen && !equipped.head && !equipped.top && !equipped.bottom && !initialItem) {
      if (tryOnItems.top.length > 0) {
        setEquipped((prev) => ({
          ...prev,
          top: tryOnItems.top[0],
          bottom: tryOnItems.bottom[0] || null,
          head: tryOnItems.head[0] || null,
        }));
      }
    }
  }, [isOpen]);

  const handleEquip = (category, item) => {
    setEquipped((prev) => ({
      ...prev,
      [category]: prev[category]?.id === item.id ? null : item,
    }));
  };

  const handleRemoveSlot = (category) => {
    setEquipped((prev) => ({
      ...prev,
      [category]: null,
    }));
  };

  const handleReset = () => {
    setEquipped({ head: null, top: null, bottom: null });
  };

  const equippedCount = Object.values(equipped).filter(Boolean).length;
  const totalPrice = Object.values(equipped)
    .filter(Boolean)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const handleAddAllToCart = () => {
    const itemsToAdd = Object.values(equipped).filter(Boolean);
    if (itemsToAdd.length === 0) return;

    itemsToAdd.forEach((item) => {
      if (onAddToCart) {
        onAddToCart(item);
      } else {
        const size = item.sizes && item.sizes.length > 0 ? item.sizes[0] : 'M';
        addToCart(item, size, 1);
      }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/20 flex flex-col md:flex-row h-[94vh] max-h-[820px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-700/60 shadow-lg active:scale-95"
          title="Close Fitting Room"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT SIDE: Interactive Mannequin Canvas */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-zinc-950 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 relative">
          
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 fill-rose-500" /> AI Virtual Try-On
              </span>
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Real-Time 3-Slot Silhouette
              </span>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-900 transition-all"
              title="Clear all equipped clothes"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Look</span>
            </button>
          </div>

          {/* Equipped Active Slots Pill Row */}
          <div className="w-full flex items-center justify-center gap-2 py-2 flex-wrap min-h-[36px]">
            {equipped.head && (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-900/90 border border-rose-500/30 text-rose-200 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="truncate max-w-[100px]">{equipped.head.name}</span>
                <button
                  onClick={() => handleRemoveSlot('head')}
                  className="hover:text-white p-0.5"
                  title="Remove cap"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {equipped.top && (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-900/90 border border-rose-500/30 text-rose-200 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="truncate max-w-[100px]">{equipped.top.name}</span>
                <button
                  onClick={() => handleRemoveSlot('top')}
                  className="hover:text-white p-0.5"
                  title="Remove shirt"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {equipped.bottom && (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-900/90 border border-rose-500/30 text-rose-200 px-2.5 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="truncate max-w-[100px]">{equipped.bottom.name}</span>
                <button
                  onClick={() => handleRemoveSlot('bottom')}
                  className="hover:text-white p-0.5"
                  title="Remove pants"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {equippedCount === 0 && (
              <span className="text-xs text-zinc-500 italic">
                No items equipped. Click an item from the wardrobe to try it on!
              </span>
            )}
          </div>

          {/* Mannequin Stage */}
          <div className="relative w-full h-[430px] sm:h-[460px] flex items-center justify-center overflow-hidden my-auto select-none">
            {/* Ambient Stage Lighting */}
            <div className="absolute inset-x-12 top-10 h-64 bg-rose-600/10 blur-3xl rounded-full pointer-events-none" />

            {/* Base Mannequin Silhouette SVG */}
            <svg
              className="w-56 h-full text-zinc-800 drop-shadow-2xl transition-all duration-300"
              viewBox="0 0 100 220"
              fill="currentColor"
            >
              {/* Head Silhouette */}
              <circle cx="50" cy="22" r="14" fill="#27272a" />
              {/* Neck & Shoulders & Torso */}
              <path
                d="M 44 36 L 56 36 L 56 44 L 75 52 L 80 110 L 72 110 L 68 64 L 62 64 L 62 120 L 38 120 L 38 64 L 32 64 L 28 110 L 20 110 L 25 52 L 44 44 Z"
                fill="#27272a"
              />
              {/* Left Leg */}
              <path
                d="M 38 120 L 48 120 L 46 205 L 35 205 Z"
                fill="#27272a"
              />
              {/* Right Leg */}
              <path
                d="M 52 120 L 62 120 L 65 205 L 54 205 Z"
                fill="#27272a"
              />
            </svg>

            {/* Slot Guide Labels when empty */}
            {!equipped.head && (
              <div className="absolute top-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest border border-dashed border-zinc-700/60 px-2 py-0.5 rounded pointer-events-none">
                Head Slot
              </div>
            )}
            {!equipped.top && (
              <div className="absolute top-28 text-[10px] text-zinc-600 font-bold uppercase tracking-widest border border-dashed border-zinc-700/60 px-2 py-0.5 rounded pointer-events-none">
                Torso Slot
              </div>
            )}
            {!equipped.bottom && (
              <div className="absolute top-56 text-[10px] text-zinc-600 font-bold uppercase tracking-widest border border-dashed border-zinc-700/60 px-2 py-0.5 rounded pointer-events-none">
                Legs Slot
              </div>
            )}

            {/* Head Layer (Caps & Hats) */}
            {equipped.head && (
              <img
                key={`head-${equipped.head.id}`}
                src={equipped.head.imageUrl || equipped.head.image}
                alt={equipped.head.name}
                className="absolute top-4 sm:top-5 w-24 sm:w-28 h-24 object-contain animate-fadeIn z-30 transition-all duration-300 drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
              />
            )}

            {/* Torso Layer (Shirts & Tops) */}
            {equipped.top && (
              <img
                key={`top-${equipped.top.id}`}
                src={equipped.top.imageUrl || equipped.top.image}
                alt={equipped.top.name}
                className="absolute top-14 sm:top-16 w-44 sm:w-48 h-48 object-contain animate-fadeIn z-20 transition-all duration-300 drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]"
              />
            )}

            {/* Legs Layer (Pants & Bottoms) */}
            {equipped.bottom && (
              <img
                key={`bottom-${equipped.bottom.id}`}
                src={equipped.bottom.imageUrl || equipped.bottom.image}
                alt={equipped.bottom.name}
                className="absolute top-48 sm:top-52 w-36 sm:w-40 h-52 object-contain animate-fadeIn z-10 transition-all duration-300 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
              />
            )}
          </div>

          {/* Action Footer: Price + Add Look to Cart */}
          <div className="w-full pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col items-start w-full sm:w-auto">
              <span className="text-[11px] text-zinc-400">
                {equippedCount} piece{equippedCount === 1 ? '' : 's'} equipped
              </span>
              <span className="text-xl font-black text-white">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={equippedCount === 0}
              className="w-full sm:w-auto flex-1 py-3 px-5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Look to Cart</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Try-On Wardrobe Selector */}
        <div className="w-full md:w-1/2 p-6 flex flex-col bg-zinc-950 overflow-hidden">
          
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Wardrobe Fitting</span>
              <span className="text-xs bg-zinc-800 text-rose-400 font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                AI Ready
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select shirts, trousers, or caps to preview how they pair on the mannequin.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-800/80 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              All Pieces
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'top'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              Shirts &amp; Tops ({tryOnItems.top.length})
            </button>
            <button
              onClick={() => setActiveTab('bottom')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'bottom'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              Pants &amp; Bottoms ({tryOnItems.bottom.length})
            </button>
            <button
              onClick={() => setActiveTab('head')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'head'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              Caps &amp; Hats ({tryOnItems.head.length})
            </button>
          </div>

          {/* Scrollable Wardrobe Items */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            
            {/* 1. Shirts & Tops */}
            {(activeTab === 'all' || activeTab === 'top') && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-rose-500" />
                    <span>Shirts &amp; Tops (Torso)</span>
                  </h4>
                  {equipped.top && (
                    <button
                      onClick={() => handleRemoveSlot('top')}
                      className="text-[11px] text-zinc-400 hover:text-rose-400"
                    >
                      Remove Top
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tryOnItems.top.map((item) => {
                    const isEquipped = equipped.top?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleEquip('top', item)}
                        className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                          isEquipped
                            ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/40'
                            : 'border-zinc-800/90 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        {isEquipped && (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Check className="w-2.5 h-2.5" /> Equipped
                          </span>
                        )}

                        <div className="h-24 w-full flex items-center justify-center p-1 bg-zinc-950/40 rounded-xl mb-2 overflow-hidden">
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-xs font-extrabold text-rose-400 mt-0.5">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Pants & Bottoms */}
            {(activeTab === 'all' || activeTab === 'bottom') && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-rose-500" />
                    <span>Pants &amp; Bottoms (Legs)</span>
                  </h4>
                  {equipped.bottom && (
                    <button
                      onClick={() => handleRemoveSlot('bottom')}
                      className="text-[11px] text-zinc-400 hover:text-rose-400"
                    >
                      Remove Bottom
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tryOnItems.bottom.map((item) => {
                    const isEquipped = equipped.bottom?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleEquip('bottom', item)}
                        className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                          isEquipped
                            ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/40'
                            : 'border-zinc-800/90 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        {isEquipped && (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Check className="w-2.5 h-2.5" /> Equipped
                          </span>
                        )}

                        <div className="h-24 w-full flex items-center justify-center p-1 bg-zinc-950/40 rounded-xl mb-2 overflow-hidden">
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-xs font-extrabold text-rose-400 mt-0.5">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Caps & Hats */}
            {(activeTab === 'all' || activeTab === 'head') && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Caps &amp; Accessories (Head)</span>
                  </h4>
                  {equipped.head && (
                    <button
                      onClick={() => handleRemoveSlot('head')}
                      className="text-[11px] text-zinc-400 hover:text-rose-400"
                    >
                      Remove Cap
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tryOnItems.head.map((item) => {
                    const isEquipped = equipped.head?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleEquip('head', item)}
                        className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                          isEquipped
                            ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/40'
                            : 'border-zinc-800/90 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        {isEquipped && (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Check className="w-2.5 h-2.5" /> Equipped
                          </span>
                        )}

                        <div className="h-24 w-full flex items-center justify-center p-1 bg-zinc-950/40 rounded-xl mb-2 overflow-hidden">
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-xs font-extrabold text-rose-400 mt-0.5">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
