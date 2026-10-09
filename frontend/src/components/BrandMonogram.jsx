import React from 'react';

export const BrandMonogram = ({ className = 'h-12 w-auto', color = 'currentColor' }) => {
  return (
    <svg
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Luxury Warm Gold / Ivory Gradient */}
        <linearGradient id="phrGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE68A" />
          <stop offset="40%" stop-color="#F59E0B" />
          <stop offset="80%" stop-color="#D97706" />
          <stop offset="100%" stop-color="#B45309" />
        </linearGradient>

        <linearGradient id="phrIvoryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="50%" stop-color="#F3F4F6" />
          <stop offset="100%" stop-color="#E5E7EB" />
        </linearGradient>
      </defs>

      <g fill="url(#phrGoldGradient)">
        {/* ======================= LETTER 'P' ======================= */}
        {/* 'P' Main Vertical Serifed Stem */}
        <path d="M 80 85 L 115 85 L 115 95 L 102 95 L 102 245 L 115 245 L 115 255 L 75 255 L 75 245 L 88 245 L 88 95 L 75 95 Z" />

        {/* 'P' Upper Outer Flourish Loop (Sweeping up, left, around and meeting the stem) */}
        <path d="M 95 88 C 60 40, 25 70, 30 115 C 33 145, 60 165, 88 155 C 89 150, 89 146, 88 142 C 68 148, 48 132, 45 110 C 42 80, 70 55, 95 72 Z" />

        {/* 'P' Right Bowl & Top Arch (Curves gracefully into the upper right) */}
        <path d="M 98 85 C 135 30, 185 45, 185 105 C 185 145, 150 170, 115 175 L 115 160 C 140 155, 165 135, 165 105 C 165 65, 130 55, 98 85 Z" />

        {/* ======================= LETTER 'h' (Center Arch & Stem) ======================= */}
        {/* 'h' Left Arc connected to P & Left Vertical Stem */}
        <path d="M 115 220 C 120 185, 140 160, 165 155 L 165 245 L 180 245 L 180 255 L 150 255 L 150 245 L 160 245 L 160 168 C 140 172, 126 192, 122 220 Z" />

        {/* 'h' High Arch Bridging over to the Right Stem */}
        <path d="M 165 155 C 190 150, 235 150, 245 180 L 235 183 C 225 160, 190 160, 165 165 Z" />

        {/* 'h' Right Vertical Stem */}
        <path d="M 235 180 L 250 180 L 250 245 L 262 245 L 262 255 L 225 255 L 225 245 L 235 245 Z" />

        {/* ======================= LETTER 'R' ======================= */}
        {/* 'R' Vertical Serifed Stem */}
        <path d="M 290 105 L 325 105 L 325 115 L 312 115 L 312 265 L 325 265 L 325 275 L 285 275 L 285 265 L 298 265 L 298 115 L 285 115 Z" />

        {/* 'R' Large Upper Left Calligraphic Flourish (Loops high over left of R) */}
        <path d="M 305 108 C 275 60, 240 90, 245 135 C 248 165, 275 185, 303 175 C 304 170, 304 166, 303 162 C 283 168, 263 152, 260 130 C 257 100, 285 75, 305 92 Z" />

        {/* 'R' Upper Right Bowl */}
        <path d="M 308 105 C 345 50, 395 65, 395 125 C 395 165, 360 190, 325 195 L 325 180 C 350 175, 375 155, 375 125 C 375 85, 340 75, 308 105 Z" />

        {/* 'R' Elegant Sweeping Leg & Dynamic Tapered Tail */}
        <path d="M 330 185 C 350 190, 370 205, 375 235 C 382 270, 410 295, 455 295 C 470 295, 480 290, 490 285 C 475 298, 455 305, 435 302 C 395 298, 365 270, 358 235 C 354 210, 340 195, 325 190 Z" />

        {/* Small Crescent Accent Dot below the R flourish */}
        <path d="M 438 315 C 445 325, 442 335, 432 340 C 438 335, 440 325, 435 315 Z" />

        {/* ======================= UNDERNEATH SWEEPING CALLIGRAPHIC SWASH ======================= */}
        {/* Fluid flourish curving underneath P, h, and cradling the base */}
        <path d="M 110 248 C 115 285, 160 325, 230 325 C 310 325, 370 275, 430 270 C 455 268, 475 272, 485 276 C 470 268, 445 262, 420 264 C 360 270, 305 315, 230 315 C 165 315, 125 280, 120 248 Z" />
      </g>
    </svg>
  );
};
