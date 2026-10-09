import React from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_SIZES } from '../services/mockData';

export const ProductFilter = ({
  selectedCategory,
  onSelectCategory,
  selectedSize,
  onSelectSize,
  sortBy,
  onSelectSort,
  minPrice,
  maxPrice,
  onPriceChange,
  onResetFilters,
  totalResults,
}) => {
  const isFilterActive = selectedCategory !== 'all' || selectedSize !== 'all' || sortBy !== 'featured' || maxPrice < 10000;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 text-lg">Catalog &amp; Filters</h3>
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {totalResults} Items
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {isFilterActive && (
            <button
              onClick={onResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:inline-block">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="featured">Featured &amp; Trending</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills & Size Chips */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Category Pills (Col 8) */}
        <div className="md:col-span-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {MOCK_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selector Sidebar (Col 4) */}
        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Size Filter
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectSize('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedSize === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {MOCK_SIZES.map((sz) => {
              const isActive = selectedSize === sz;
              return (
                <button
                  key={sz}
                  onClick={() => onSelectSize(sz)}
                  className={`w-9 h-8 rounded-lg text-xs font-bold border transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
