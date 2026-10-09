import React, { useState } from 'react';
import { ShoppingBag, Star, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M'
  );
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedSize, 1);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Tag Badge */}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            {product.tag}
          </span>
        )}

        {/* Quick View Button Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className={`absolute inset-x-4 bottom-4 py-2.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold rounded-xl shadow-lg border border-slate-200 flex items-center justify-center gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          } hover:bg-slate-900 hover:text-white`}
        >
          <Eye className="w-4 h-4" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Category Tag & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span className="uppercase tracking-wider font-semibold text-rose-600">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-slate-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="font-bold text-[11px]">{product.rating}</span>
              <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h4
            onClick={() => onQuickView(product)}
            className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors cursor-pointer"
          >
            {product.name}
          </h4>

          {/* Price Breakdown */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.originalPrice && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Size Badge Options */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
              <span>Select Size:</span>
              <span className="font-bold text-slate-800">{selectedSize}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`text-[11px] font-bold py-1 px-2.5 rounded-md border transition-all ${
                    selectedSize === sz
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart CTA Button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-slate-900/10 hover:shadow-rose-600/20 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingBag className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span>Add to Cart</span>
        </button>

      </div>
    </div>
  );
};
