import React, { useState, useEffect } from 'react';
import './CompleteOrderButton.css';

export default function CompleteOrderButton({
  onComplete,
  onClick,
  totalAmount,
  disabled = false,
  className = '',
  style = {},
}) {
  const [stage, setStage] = useState('idle'); // 'idle' | 'running' | 'done'

  useEffect(() => {
    setStage('idle');
  }, [totalAmount]);

  const handleClick = async (e) => {
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

    setStage('running');

    // 1. Full animation sequence duration (3.6s)
    setTimeout(() => {
      setStage('done');

      // 2. Allow user to see "Order Placed" before receipt opens
      setTimeout(() => {
        if (typeof onComplete === 'function') onComplete();
      }, 1200);
    }, 3600);
  };

  return (
    <div className={`truck-btn-wrapper ${className}`} style={style}>
      <button
        type="button"
        onClick={handleClick}
        disabled={stage !== 'idle' || disabled}
        className={`order-truck-button ${stage}`}
        aria-label={stage === 'done' ? 'Order Placed' : 'Complete Order'}
      >
        <span className="btn-label-text default-label">Complete Order</span>

        {/* Viewport scene */}
        <div className="truck-viewport" aria-hidden="true">
          <div className="road-stripes"></div>

          {/* Truck Assembly */}
          <div className="truck-assembly">
            <div className="truck-bed-container">
              {/* Parcel box drops directly into this bed */}
              <div className="truck-box"></div>
              <div className="bed-wall-floor"></div>
              <div className="bed-door-tailgate"></div>
            </div>

            <div className="truck-cab-unit">
              <div className="cab-windshield"></div>
              <div className="cab-headlamp"></div>
            </div>

            <div className="truck-tire tire-rear"></div>
            <div className="truck-tire tire-front"></div>
          </div>
        </div>

        <span className="btn-label-text success-label">
          Order Placed
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M3 8.5l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}
