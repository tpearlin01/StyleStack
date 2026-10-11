import React, { useState } from 'react';
import './CompleteOrderButton.css';

export default function CompleteOrderButton({
  onComplete,
  onAnimationComplete,
  onClick,
  disabled = false,
}) {
  const [stage, setStage] = useState('idle'); // 'idle' | 'driving' | 'done'

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (stage !== 'idle' || disabled) return;

    if (onClick) {
      try {
        const canProceed = await onClick(e);
        if (canProceed === false) return;
      } catch (err) {
        console.error('CompleteOrderButton click error:', err);
        return;
      }
    }

    setStage('driving');

    // 1. Truck loads, drives across, turns green "Order Placed"
    setTimeout(() => {
      setStage('done');

      // 2. Wait 1.2s so user clearly sees "Order Placed", then open Receipt modal
      setTimeout(() => {
        const completion = onComplete || onAnimationComplete;
        if (completion) completion();
      }, 1200);
    }, 4200);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={stage !== 'idle' || disabled}
      className={`order-truck-btn ${stage}`}
    >
      {/* 1. Default text */}
      <span className="btn-text default-text">Complete Order</span>

      {/* 2. Interactive Road & Truck Scene */}
      <div className="track-container" aria-hidden="true">
        <div className="road-stripes"></div>
        <div className="drop-parcel"></div>
        <div className="moving-truck">
          <div className="truck-cargo"></div>
          <div className="truck-cab">
            <div className="cab-window"></div>
            <div className="cab-light"></div>
          </div>
          <div className="wheel wheel-left"></div>
          <div className="wheel wheel-right"></div>
        </div>
      </div>

      {/* 3. Success State */}
      <span className="btn-text success-text">
        Order Placed
        <svg viewBox="0 0 16 16" className="success-icon" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8.5l3.5 3.5L13 4"
          />
        </svg>
      </span>
    </button>
  );
}
