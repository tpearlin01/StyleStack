import React, { useState } from 'react';
import './CompleteOrderButton.css';

export default function CompleteOrderButton({
  onComplete,
  onAnimationComplete,
  onClick,
  totalAmount,
  disabled = false,
  className = '',
  style = {},
}) {
  const [stage, setStage] = useState('idle'); // 'idle' | 'loading-box' | 'door-closing' | 'driving' | 'done'

  const handleStartOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (stage !== 'idle' || disabled) return;

    if (typeof onClick === 'function') {
      try {
        const canProceed = await onClick(e);
        if (canProceed === false) return;
      } catch (err) {
        console.error('CompleteOrderButton click error:', err);
        return;
      }
    }

    // Step 1: Shrink button to track, truck arrives, box drops into bed (0 - 1.2s)
    setStage('loading-box');

    // Step 2: Truck door closes & headlights turn on (1.2s - 2.0s)
    setTimeout(() => {
      setStage('door-closing');
    }, 1200);

    // Step 3: Truck accelerates from left to right along the road (2.0s - 4.5s)
    setTimeout(() => {
      setStage('driving');
    }, 2000);

    // Step 4: Button turns green and displays "Order Placed" (4.5s)
    setTimeout(() => {
      setStage('done');

      // Step 5: After user clearly sees the green confirmation, open receipt printer modal
      setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
        if (typeof onAnimationComplete === 'function') {
          onAnimationComplete();
        }
      }, 1400);
    }, 4500);
  };

  return (
    <button
      type="button"
      onClick={handleStartOrder}
      disabled={stage !== 'idle' || disabled}
      className={`truck-btn ${stage} ${className}`}
      style={style}
      aria-label={stage === 'done' ? 'Order Placed' : 'Complete Order'}
    >
      {/* 1. Default Text */}
      <span className="btn-text label-default">Complete Order</span>

      {/* 2. Self-Contained Truck & Roadway Track */}
      <div className="btn-track-scene" aria-hidden="true">
        <div className="road-dashed"></div>

        {/* Dropping Box */}
        <div className="truck-parcel"></div>

        {/* Truck Composite */}
        <div className="truck-wrapper">
          <div className="truck-body">
            <div className="truck-cargo-bed"></div>
            <div className="truck-tailgate"></div>
          </div>
          <div className="truck-cabin">
            <div className="truck-window"></div>
            <div className="truck-headlight"></div>
          </div>
          <div className="truck-wheel wheel-left"></div>
          <div className="truck-wheel wheel-right"></div>
        </div>
      </div>

      {/* 3. Success Green Pill Label */}
      <span className="btn-text label-success">
        Order Placed
        <svg
          viewBox="0 0 16 16"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3 8 7 12 13 4" />
        </svg>
      </span>
    </button>
  );
}
