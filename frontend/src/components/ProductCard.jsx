import React, { useState } from 'react';
import { ShoppingBag, Star, Eye, Sparkles, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AddToCartButton from './AddToCartButton';

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
      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Product Image Container */}
      <div
        className="relative aspect-[3/4] bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.imageUrl || product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Highlight Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.tag && (
            <>
              {product.tag === 'Festive Offer' && (
                <span className="bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-white fill-white" />
                  <span>Festive Offer • 20% OFF</span>
                </span>
              )}
              {product.tag === 'Sale' && (
                <span className="bg-slate-950 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-slate-700">
                  <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>On Sale</span>
                </span>
              )}
              {product.tag === 'New Arrival' && (
                <span className="bg-slate-950/90 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md border border-slate-700">
                  New Arrival
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick View Overlay */}
        <div
          className={`absolute inset-x-4 bottom-4 flex gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2.5 bg-slate-950/90 backdrop-blur-md hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Tag & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span className="uppercase tracking-wider font-bold text-rose-600 text-[10px]">
              {product.categoryName || product.category} • {product.gender === 'men' ? 'Men' : 'Women'}
            </span>
            <div className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-bold text-[11px]">{product.rating}</span>
              <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h4
            onClick={() => onQuickView(product)}
            className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors cursor-pointer"
            title={product.name}
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
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Size Badge Options */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
              <span>Size:</span>
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
                  className={`text-[10px] font-bold py-1 px-2.5 rounded-md border transition-all ${
                    selectedSize === sz
                      ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="w-full flex justify-center">
          <AddToCartButton
            product={product}
            selectedSize={selectedSize}
            quantity={1}
            fullWidth
            label="Add to Cart"
          />
        </div>
      </div>
    </div>
  );
};
