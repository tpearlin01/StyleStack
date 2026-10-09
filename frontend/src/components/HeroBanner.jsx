import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

export const HeroBanner = ({ onShopNow }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-12 lg:py-16 rounded-3xl my-6 mx-4 sm:mx-6 lg:mx-8 shadow-2xl border border-slate-900">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 rounded-full bg-slate-800/40 blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Text Content */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Curated Apparel &amp; Fashion Collections</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Elevate Your <br />
            <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400 bg-clip-text text-transparent italic">
              Fashion Style Stack
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Discover signature curations across hand-embroidered Anarkalis, bespoke formal suits, breathable summer dresses, and luxury accessories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onShopNow}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-base shadow-xl shadow-rose-600/25 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Shop Collection</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#catalog"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-base transition-all text-center"
            >
              Browse Categories
            </a>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Free Shipping &gt; ₹1,999</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>100% Authentic Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
              <span>7-Day Easy Returns</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card (Clean, centered, single image card without overlapping floating widgets) */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 group aspect-[3/4]">
            <img
              src="/images/women tarditional dress/1183653B-EA4C-4D27-A91A-900C61473B85_600x.webp"
              alt="Festive Traditional Ensemble"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-6">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                  Festive Edition • 20% OFF
                </span>
                <h4 className="font-serif-luxury text-xl font-bold text-white">The Royal Anarkali Set</h4>
                <p className="text-xs text-slate-300">Hand-embroidered zardozi silk blend</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
