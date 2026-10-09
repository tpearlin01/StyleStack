import React from 'react';
import { Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-12 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          <div className="space-y-3">
            <BrandLogo size="sm" subtitle="DRESS & CLOTHING HUB" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Curated fashion apparel, festive ethnic wear, bespoke suits, Italian leather bags, and designer footwear.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#catalog" className="hover:text-white transition-colors">Festive &amp; Traditional Wear</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Executive Formals &amp; Suits</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Casual &amp; Summer Dresses</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Bags, Footwear &amp; Accessories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><a href="#catalog" className="hover:text-white transition-colors">Instant Invoice Generator</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Shipping &amp; Delivery Terms</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Easy 7-Day Returns</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Size Guide &amp; Fitting</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Developer &amp; Team</h4>
            <p className="text-slate-400 text-xs mb-2">
              Frontend developed by <strong className="text-rose-400">Princel</strong> (React + Vite + Tailwind CSS). Decoupled API service layer with standalone mock data.
            </p>
            <p className="text-slate-400 text-xs">
              Backend architecture developed by <strong className="text-slate-300">Pearlin</strong>.
            </p>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} StyleStack. All rights reserved.</p>
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
