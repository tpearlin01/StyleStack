import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

export const HeroBanner = ({ onShopNow }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-12 lg:py-20 rounded-3xl my-6 mx-4 sm:mx-6 lg:mx-8 shadow-2xl border border-slate-900">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Text Content */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Festive Traditional &amp; Contemporary Wear 2026</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Elevate Your <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent italic">
              Fashion Style Stack
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Discover signature curations across hand-embroidered Anarkalis, bespoke formal suits, breathable summer dresses, and luxury accessories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onShopNow}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
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
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Free Shipping &gt; ₹1,999</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Authentic Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>7-Day Easy Returns</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Collage */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            {/* Main Featured Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/80 group aspect-[3/4]">
              <img
                src="/images/women tarditional dress/1183653B-EA4C-4D27-A91A-900C61473B85_600x.webp"
                alt="Festive Traditional Ensemble"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-6">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Festive Edition • 20% OFF
                  </span>
                  <h4 className="font-serif-luxury text-xl font-bold text-white">The Royal Anarkali Set</h4>
                  <p className="text-xs text-slate-300">Hand-embroidered zardozi silk blend</p>
                </div>
              </div>
            </div>

            {/* Floating Accent Card */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-800 hidden sm:flex items-center gap-3 text-white">
              <img
                src="/images/men formal/-473Wx593H-469514972-black-MODEL.avif"
                alt="Tuxedo Suit"
                className="w-12 h-14 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <p className="text-xs font-bold text-slate-200">Slim-Fit Tuxedo Jacket</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-extrabold text-amber-400">₹5,499</span>
                  <span className="text-[10px] text-slate-400 line-through">₹7,299</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
