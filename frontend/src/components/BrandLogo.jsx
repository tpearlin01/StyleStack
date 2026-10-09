import React from 'react';

export const BrandLogo = ({ size = 'md', showText = true, subtitle = 'DRESS & CLOTHING HUB' }) => {
  // Size variants for the emblem
  const sizeClasses = {
    sm: {
      emblem: 'w-9 h-9 text-sm',
      title: 'text-lg',
      sub: 'text-[9px]',
    },
    md: {
      emblem: 'w-11 h-11 text-base',
      title: 'text-2xl',
      sub: 'text-[10px]',
    },
    lg: {
      emblem: 'w-16 h-16 text-2xl',
      title: 'text-3xl',
      sub: 'text-xs',
    },
    xl: {
      emblem: 'w-24 h-24 text-4xl',
      title: 'text-4xl',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Code-Based Pure HTML/CSS PHR Monogram Emblem */}
      <div
        className={`relative ${currentSize.emblem} rounded-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-neutral-900 border border-amber-300/40 shadow-[0_0_15px_rgba(217,119,6,0.15)] ring-1 ring-white/10 shrink-0 group`}
      >
        {/* Fine ornamental inner ring */}
        <div className="absolute inset-1 rounded-full border border-dashed border-amber-200/30 opacity-70 pointer-events-none" />

        {/* Ornate Serif Interlaced "PHR" Monogram */}
        <span
          className="font-serif italic font-bold tracking-tight bg-gradient-to-r from-amber-100 via-neutral-100 to-amber-200 bg-clip-text text-transparent transform translate-y-[-0.5px]"
          style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
        >
          P<span className="text-amber-400 font-normal not-italic mx-[-1px] text-[0.85em]">H</span>R
        </span>

        {/* Subtle Luxury Corner Glint */}
        <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-amber-200/80 rounded-full blur-[1px]" />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-sans font-bold ${currentSize.title} tracking-tight text-neutral-100 leading-none`}
          >
            StyleStack
          </span>
          {subtitle && (
            <span
              className={`font-sans uppercase tracking-[0.2em] font-semibold text-rose-400/90 ${currentSize.sub} mt-1`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
