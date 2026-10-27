import React from 'react';
import { BrandMonogram } from './BrandMonogram';

export const BrandLogo = ({ size = 'md', showText = true, subtitle = 'DRESS & CLOTHING HUB' }) => {
  const sizeClasses = {
    sm: {
      monogram: 'h-8 md:h-9 w-auto',
      title: 'text-xl font-bold',
      sub: 'text-[9px] tracking-[0.2em]',
    },
    md: {
      monogram: 'h-10 md:h-12 w-auto',
      title: 'text-2xl font-bold',
      sub: 'text-[10px] tracking-[0.25em]',
    },
    lg: {
      monogram: 'h-16 md:h-20 w-auto',
      title: 'text-3xl md:text-4xl font-extrabold',
      sub: 'text-xs tracking-[0.3em]',
    },
    xl: {
      monogram: 'h-24 md:h-32 w-auto',
      title: 'text-4xl md:text-5xl font-extrabold',
      sub: 'text-sm tracking-[0.35em]',
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="inline-flex items-center gap-3.5 select-none group">
      {/* Freestanding Monogram (NO circular medallion or border) */}
      <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
        <BrandMonogram className={currentSize.monogram} />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-sans font-extrabold ${currentSize.title} tracking-tight text-[#F3F4F6] leading-none transition-colors group-hover:text-amber-300`}
          >
            StyleStack
          </span>
          {subtitle && (
            <span
              className={`font-sans uppercase font-bold text-amber-400/90 ${currentSize.sub} mt-1`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
