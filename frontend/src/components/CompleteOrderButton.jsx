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
  const [stage, setStage] = useState('idle'); // 'idle' | 'loading' | 'closing' | 'driving' | 'done'

  // Reset stage if modal reopens or totalAmount changes
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

    setStage('loading');

    // Box drops into truck (0s - 1.0s)
    setTimeout(() => {
      setStage('closing');
    }, 1000);

    // Door closes & truck drives away (1.0s - 1.8s)
    setTimeout(() => {
      setStage('driving');
    }, 1800);

    // "Order Placed" state (1.8s - 4.2s)
    setTimeout(() => {
      setStage('done');

      // Transition to thermal receipt (1.2s after done)
      setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 1200);
    }, 4200);
  };

  return (
    <div className={`truck-btn-wrapper ${className}`} style={style}>
      <button
        type="button"
        onClick={handleClick}
        disabled={stage !== 'idle' || disabled}
        className={`truck-btn ${stage}`}
        aria-label={stage === 'done' ? 'Order Placed' : 'Complete Order'}
      >
        <span className="btn-label default-label">Complete Order</span>

        {/* Animation stage contained strictly within button */}
        <div className="truck-stage" aria-hidden="true">
          <div className="road-line"></div>
          <div className="box-parcel"></div>

          <div className="truck-unit">
            <div className="truck-bed">
              <div className="tailgate"></div>
            </div>
            <div className="truck-cabin">
              <div className="cab-window"></div>
              <div className="headlight"></div>
            </div>
            <div className="wheel wheel-front"></div>
            <div className="wheel wheel-back"></div>
          </div>
        </div>

        <span className="btn-label success-label">
          Order Placed
          <svg className="check-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M3 8.5l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}
