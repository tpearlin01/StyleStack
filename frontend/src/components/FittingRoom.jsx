import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, ShoppingBag, X, Check, Shirt, Layers, ArrowRight, Zap, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TRYON_SHIRTS, TRYON_PANTS, TRYON_CAPS, ALL_TRYON_PRODUCTS } from '../services/tryOnCatalog';

export default function FittingRoom({ isOpen, onClose, initialItem, onAddToCart }) {
  const { addToCart } = useCart();

  const [equipped, setEquipped] = useState({
    head: null,
    top: null,
    bottom: null,
  });

  const [animKeys, setAnimKeys] = useState({
    head: 0,
    top: 0,
    bottom: 0,
  });

  const [activeSlotGlow, setActiveSlotGlow] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'top' | 'bottom' | 'head'

  const tryOnItems = {
    top: TRYON_SHIRTS,
    bottom: TRYON_PANTS,
    head: TRYON_CAPS,
  };

  // If opened with an initialItem from a ProductCard click, auto-equip it with fluid animation
  useEffect(() => {
    if (initialItem && initialItem.tryOnCategory) {
      const slot = initialItem.tryOnCategory;
      setEquipped((prev) => ({
        ...prev,
        [slot]: initialItem,
      }));
      setAnimKeys((prev) => ({
        ...prev,
        [slot]: Date.now(),
      }));
      setActiveSlotGlow(slot);
      setActiveTab(slot);
    }
  }, [initialItem]);

  // Set default stylish look on first opening if mannequin is bare
  useEffect(() => {
    if (isOpen && !equipped.head && !equipped.top && !equipped.bottom && !initialItem) {
      setEquipped({
        head: tryOnItems.head[0] || null,
        top: tryOnItems.top[0] || null,
        bottom: tryOnItems.bottom[0] || null,
      });
      const now = Date.now();
      setAnimKeys({ head: now, top: now + 50, bottom: now + 100 });
      setActiveSlotGlow('top');
    }
  }, [isOpen]);

  const handleEquip = (category, item) => {
    const isCurrentlyEquipped = equipped[category]?.id === item.id;
    if (isCurrentlyEquipped) {
      // Toggle off / remove piece
      setEquipped((prev) => ({
        ...prev,
        [category]: null,
      }));
      setActiveSlotGlow(null);
    } else {
      // Equip with smooth fluid slide-and-scale transition
      setEquipped((prev) => ({
        ...prev,
        [category]: item,
      }));
      setAnimKeys((prev) => ({
        ...prev,
        [category]: Date.now(),
      }));
      setActiveSlotGlow(category);
    }
  };

  const handleRemoveSlot = (category) => {
    setEquipped((prev) => ({
      ...prev,
      [category]: null,
    }));
    if (activeSlotGlow === category) {
      setActiveSlotGlow(null);
    }
  };

  const handleReset = () => {
    setEquipped({ head: null, top: null, bottom: null });
    setActiveSlotGlow(null);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/25 flex flex-col md:flex-row h-[94vh] max-h-[860px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-700/60 shadow-lg active:scale-95 cursor-pointer"
          title="Close Fitting Room"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT SIDE: High-Contrast Mannequin Silhouette Canvas Stage */}
        <div className="w-full md:w-[46%] bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 p-5 sm:p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 relative">
          
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800/70">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 fill-rose-500 animate-pulse" /> Virtual Fitting Room
              </span>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                Silhouette Canvas
              </span>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
              title="Reset Mannequin"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Mannequin</span>
            </button>
          </div>

          {/* Equipped Active Badges Row */}
          <div className="w-full flex items-center justify-center gap-2 py-2 flex-wrap min-h-[36px]">
            {equipped.head && (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-900 border border-rose-500/30 text-rose-200 px-2.5 py-1 rounded-full shadow-sm animate-in zoom-in-95 duration-150">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="font-medium truncate max-w-[100px]">{equipped.head.name}</span>
                <button
                  onClick={() => handleRemoveSlot('head')}
                  className="hover:text-white p-0.5 ml-0.5 cursor-pointer"
                  title="Remove cap"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {equipped.top && (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-900 border border-rose-500/30 text-rose-200 px-2.5 py-1 rounded-full shadow-sm animate-in zoom-in-95 duration-150">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="font-medium truncate max-w-[100px]">{equipped.top.name}</span>
                <button
                  onClick={() => handleRemoveSlot('top')}
                  className="hover:text-white p-0.5 ml-0.5 cursor-pointer"
                  title="Remove top"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {equipped.bottom && (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-zinc-900 border border-rose-500/30 text-rose-200 px-2.5 py-1 rounded-full shadow-sm animate-in zoom-in-95 duration-150">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="font-medium truncate max-w-[100px]">{equipped.bottom.name}</span>
                <button
                  onClick={() => handleRemoveSlot('bottom')}
                  className="hover:text-white p-0.5 ml-0.5 cursor-pointer"
                  title="Remove bottom"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {equippedCount === 0 && (
              <span className="text-xs text-zinc-500 italic">
                Mannequin is bare. Click pieces on the right to try on!
              </span>
            )}
          </div>

          {/* MANNEQUIN STAGE CONTAINER */}
          {/* Dark/slate backdrop stage: bg-zinc-900/90 rounded-2xl border border-zinc-800 */}
          <div className="w-full bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 relative flex items-center justify-center overflow-hidden h-[470px] sm:h-[500px] my-auto select-none shadow-inner">
            
            {/* Ambient Lighting & Glow */}
            <div className="absolute inset-x-8 top-12 h-64 bg-rose-600/10 blur-3xl rounded-full pointer-events-none" />

            {/* High-Contrast Neutral Mannequin Pedestal Canvas: Eliminates Solid White Boxes via Multiply Blending */}
            <div className="relative w-full max-w-[280px] h-[450px] bg-slate-100/95 rounded-2xl border border-slate-300/60 shadow-lg flex items-center justify-center overflow-hidden">
              
              {/* Subtle Body Contour Lighting */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-slate-100/90 to-slate-200/90 pointer-events-none" />

              {/* VECTOR MANNEQUIN SILHOUETTE BASE ANCHOR */}
              <svg
                className="w-52 h-full text-zinc-400 drop-shadow-sm relative z-0 pointer-events-none transition-all duration-300"
                viewBox="0 0 100 220"
                fill="currentColor"
              >
                {/* Head */}
                <circle cx="50" cy="22" r="13" fill="#52525b" />
                {/* Neck & Shoulders & Torso */}
                <path
                  d="M 45 35 L 55 35 L 55 42 L 75 50 L 78 112 L 71 112 L 67 65 L 62 65 L 62 120 L 38 120 L 38 65 L 33 65 L 29 112 L 22 112 L 25 50 L 45 42 Z"
                  fill="#71717a"
                />
                {/* Left Leg */}
                <path
                  d="M 38 120 L 48 120 L 46 205 L 35 205 Z"
                  fill="#71717a"
                />
                {/* Right Leg */}
                <path
                  d="M 52 120 L 62 120 L 65 205 L 54 205 Z"
                  fill="#71717a"
                />
                {/* Mannequin Stand Base */}
                <ellipse cx="50" cy="214" rx="28" ry="4" fill="#a1a1aa" opacity="0.7" />
              </svg>

              {/* Empty Slot Placeholder Guides */}
              {!equipped.head && (
                <div className="absolute top-6 text-[9px] text-zinc-600 font-bold uppercase tracking-wider border border-dashed border-zinc-400 px-2 py-0.5 rounded-full pointer-events-none z-10 bg-white/70">
                  Head Slot
                </div>
              )}
              {!equipped.top && (
                <div className="absolute top-20 text-[9px] text-zinc-600 font-bold uppercase tracking-wider border border-dashed border-zinc-400 px-2 py-0.5 rounded-full pointer-events-none z-10 bg-white/70">
                  Torso Slot
                </div>
              )}
              {!equipped.bottom && (
                <div className="absolute top-48 text-[9px] text-zinc-600 font-bold uppercase tracking-wider border border-dashed border-zinc-400 px-2 py-0.5 rounded-full pointer-events-none z-10 bg-white/70">
                  Legs Slot
                </div>
              )}

              {/* 1. HEAD / CAP LAYER */}
              {/* Exact Layer Positioning: top-6 w-28 z-30 */}
              {equipped.head && (
                <div
                  key={`head-slot-${equipped.head.id}-${animKeys.head}`}
                  className={`absolute top-6 w-28 flex items-center justify-center z-30 animate-fluid-attach pointer-events-none ${
                    activeSlotGlow === 'head' ? 'slot-glow-active rounded-xl' : ''
                  }`}
                >
                  <img
                    src={equipped.head.imageUrl || equipped.head.image}
                    alt={equipped.head.name}
                    className="w-full h-22 object-contain tryon-multiply-blend transition-transform duration-300"
                  />
                </div>
              )}

              {/* 2. TORSO / SHIRT LAYER */}
              {/* Exact Layer Positioning: top-20 w-44 z-20 */}
              {equipped.top && (
                <div
                  key={`top-slot-${equipped.top.id}-${animKeys.top}`}
                  className={`absolute top-20 w-44 flex items-center justify-center z-20 animate-fluid-attach pointer-events-none ${
                    activeSlotGlow === 'top' ? 'slot-glow-active rounded-xl' : ''
                  }`}
                >
                  <img
                    src={equipped.top.imageUrl || equipped.top.image}
                    alt={equipped.top.name}
                    className="w-full h-48 object-contain tryon-multiply-blend transition-transform duration-300"
                  />
                </div>
              )}

              {/* 3. LEGS / PANTS LAYER */}
              {/* Exact Layer Positioning: top-48 w-40 z-10 */}
              {equipped.bottom && (
                <div
                  key={`bottom-slot-${equipped.bottom.id}-${animKeys.bottom}`}
                  className={`absolute top-48 w-40 flex items-center justify-center z-10 animate-fluid-attach pointer-events-none ${
                    activeSlotGlow === 'bottom' ? 'slot-glow-active rounded-xl' : ''
                  }`}
                >
                  <img
                    src={equipped.bottom.imageUrl || equipped.bottom.image}
                    alt={equipped.bottom.name}
                    className="w-full h-48 object-contain tryon-multiply-blend transition-transform duration-300"
                  />
                </div>
              )}

              {/* Active Slot Glow Ring Indicator */}
              {activeSlotGlow && (
                <div className="absolute inset-0 pointer-events-none border-2 border-rose-500/25 rounded-2xl animate-pulse" />
              )}

            </div>
          </div>

          {/* Action Footer: Price + Add Look to Cart */}
          <div className="w-full pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col items-start w-full sm:w-auto">
              <span className="text-[11px] text-zinc-400">
                {equippedCount} piece{equippedCount === 1 ? '' : 's'} styled
              </span>
              <span className="text-xl font-black text-white">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={equippedCount === 0}
              className="w-full sm:w-auto flex-1 py-3 px-5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Look to Cart</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Dynamic Wardrobe Catalog (ALL 42 Items) */}
        <div className="w-full md:w-[54%] p-5 sm:p-6 flex flex-col bg-zinc-950 overflow-hidden">
          
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Wardrobe Catalog</span>
                <span className="text-xs bg-rose-500/20 text-rose-300 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  {ALL_TRYON_PRODUCTS.length} Styles
                </span>
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Click any piece to smoothly animate it onto the mannequin stage.
            </p>
          </div>

          {/* DYNAMIC CATEGORY TABS */}
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-800/80 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white border border-zinc-800'
              }`}
            >
              All Pieces ({ALL_TRYON_PRODUCTS.length})
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'top'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white border border-zinc-800'
              }`}
            >
              Shirts &amp; Tops ({tryOnItems.top.length})
            </button>
            <button
              onClick={() => setActiveTab('bottom')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'bottom'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white border border-zinc-800'
              }`}
            >
              Pants &amp; Bottoms ({tryOnItems.bottom.length})
            </button>
            <button
              onClick={() => setActiveTab('head')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'head'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white border border-zinc-800'
              }`}
            >
              Caps &amp; Hats ({tryOnItems.head.length})
            </button>
          </div>

          {/* SCROLLABLE WARDROBE ITEMS */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            
            {/* 1. Shirts & Tops Section */}
            {(activeTab === 'all' || activeTab === 'top') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-rose-500" />
                    <span>Shirts &amp; Tops ({tryOnItems.top.length})</span>
                  </h4>
                  {equipped.top && (
                    <button
                      onClick={() => handleRemoveSlot('top')}
                      className="text-[11px] text-zinc-400 hover:text-rose-400 cursor-pointer"
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
                        className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-95 ${
                          isEquipped
                            ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/40'
                            : 'border-zinc-800/90 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        {isEquipped ? (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                            <Check className="w-2.5 h-2.5" /> Equipped
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2 text-zinc-500 group-hover:text-rose-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
                            <Zap className="w-2.5 h-2.5 fill-current" /> Try On
                          </span>
                        )}

                        <div className="h-24 w-full flex items-center justify-center p-1 bg-white/90 rounded-xl mb-2 overflow-hidden shadow-inner">
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-extrabold text-rose-400">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-zinc-500">Torso</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Pants & Bottoms Section */}
            {(activeTab === 'all' || activeTab === 'bottom') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-rose-500" />
                    <span>Pants &amp; Bottoms ({tryOnItems.bottom.length})</span>
                  </h4>
                  {equipped.bottom && (
                    <button
                      onClick={() => handleRemoveSlot('bottom')}
                      className="text-[11px] text-zinc-400 hover:text-rose-400 cursor-pointer"
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
                        className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-95 ${
                          isEquipped
                            ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/40'
                            : 'border-zinc-800/90 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        {isEquipped ? (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                            <Check className="w-2.5 h-2.5" /> Equipped
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2 text-zinc-500 group-hover:text-rose-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
                            <Zap className="w-2.5 h-2.5 fill-current" /> Try On
                          </span>
                        )}

                        <div className="h-24 w-full flex items-center justify-center p-1 bg-white/90 rounded-xl mb-2 overflow-hidden shadow-inner">
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-extrabold text-rose-400">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-zinc-500">Legs</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Caps & Hats Section */}
            {(activeTab === 'all' || activeTab === 'head') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Caps &amp; Hats ({tryOnItems.head.length})</span>
                  </h4>
                  {equipped.head && (
                    <button
                      onClick={() => handleRemoveSlot('head')}
                      className="text-[11px] text-zinc-400 hover:text-rose-400 cursor-pointer"
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
                        className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-95 ${
                          isEquipped
                            ? 'border-rose-500 bg-rose-500/15 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/40'
                            : 'border-zinc-800/90 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        {isEquipped ? (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                            <Check className="w-2.5 h-2.5" /> Equipped
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2 text-zinc-500 group-hover:text-rose-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
                            <Zap className="w-2.5 h-2.5 fill-current" /> Try On
                          </span>
                        )}

                        <div className="h-24 w-full flex items-center justify-center p-1 bg-white/90 rounded-xl mb-2 overflow-hidden shadow-inner">
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-extrabold text-rose-400">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-zinc-500">Head</span>
                          </div>
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
