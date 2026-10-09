import React from 'react';
import { SlidersHorizontal, RotateCcw, Sparkles, Flame, Tag } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_SIZES, MOCK_QUICK_FILTERS } from '../services/mockData';

export const ProductFilter = ({
  selectedCategory,
  onSelectCategory,
  selectedQuickFilter,
  onSelectQuickFilter,
  selectedSize,
  onSelectSize,
  sortBy,
  onSelectSort,
  onResetFilters,
  totalResults,
}) => {
  const isFilterActive =
    selectedCategory !== 'all' ||
    selectedQuickFilter !== 'all' ||
    selectedSize !== 'all' ||
    sortBy !== 'featured';

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-8 space-y-5">
      {/* Top Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          Quick Filters:
        </span>
        {MOCK_QUICK_FILTERS.map((qf) => {
          const isActive = selectedQuickFilter === qf.id;
          return (
            <button
              key={qf.id}
              onClick={() => onSelectQuickFilter(qf.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-950 text-amber-300 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {qf.id === 'festive-offers' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              {qf.id === 'on-sale' && <Flame className="w-3.5 h-3.5 text-rose-500" />}
              <span>{qf.label}</span>
            </button>
          );
        })}
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-base">Collections &amp; Categories</h3>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
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
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="featured">Featured &amp; Trending</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories & Sizes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        {/* Category Pills */}
        <div className="md:col-span-8">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Collection Type
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
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selector */}
        <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Size Filter
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
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
                  className={`px-2.5 h-8 rounded-lg text-xs font-bold border transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
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
