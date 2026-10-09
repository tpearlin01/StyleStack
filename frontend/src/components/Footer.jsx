import React from 'react';
import { LayoutDashboard, Heart } from 'lucide-react';

export const Footer = ({ onToggleAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-serif-luxury font-bold italic text-lg">
                S
              </div>
              <span className="font-serif-luxury text-xl font-bold text-white tracking-tight">
                StyleStack
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Curated luxury fashion, silk dresses, Italian leather bags, and botanical cosmetics for modern style trendsetters.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#catalog" className="hover:text-white transition-colors">Silk &amp; Floral Dresses</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Leather Totes &amp; Bags</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Stiletto &amp; Chelsea Footwear</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Luminous Cosmetics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onToggleAdmin}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Dashboard Portal</span>
                </button>
              </li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Instant Invoice Generator</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Shipping &amp; Delivery Terms</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Easy 7-Day Returns</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Developer &amp; Team</h4>
            <p className="text-slate-400 text-xs mb-2">
              Frontend developed by <strong className="text-rose-400">Princel</strong> (React + Vite + Tailwind CSS). Decoupled API service layer with standalone mock data.
            </p>
            <p className="text-slate-400 text-xs">
              Backend architecture developed by <strong className="text-amber-400">Pearlin</strong>.
            </p>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} StyleStack Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for StyleStack E-Commerce</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
