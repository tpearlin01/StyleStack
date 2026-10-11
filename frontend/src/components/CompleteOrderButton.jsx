import React, { useState, useRef, useEffect } from 'react';
import './CompleteOrderButton.css';

/**
 * CompleteOrderButton
 * 
 * Interactive truck delivery animation button for checkout:
 * - Idle: Sleek dark button with "Complete Order"
 * - Animating:
 *   1. (0.0s - 1.2s): Parcel box drops into the delivery truck bed
 *   2. (1.2s - 2.0s): Truck back closes, headlights beam on with roadway dash lines
 *   3. (2.0s - 3.8s): Truck accelerates and drives out to the right offscreen
 * - Success (3.8s - 5.0s):
 *   4. Button expands into green pill displaying "Order Placed" with checkmark
 * - Transition:
 *   Calls onComplete() / onAnimationComplete() to trigger the thermal receipt printer
 */
export default function CompleteOrderButton({
  onComplete,
  onAnimationComplete,
  onClick,
  onStart,
  disabled = false,
  totalAmount,
  className = '',
  style = {},
  defaultText = 'Complete Order',
  successText = 'Order Placed',
}) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'animating' | 'success'

  const timer1Ref = useRef(null);
  const timer2Ref = useRef(null);

  useEffect(() => {
    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, []);

  const handleStartOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (status !== 'idle' || disabled) return;

    // Check external onClick / onStart handler (e.g. for delivery validation)
    const clickHandler = onClick || onStart;
    if (clickHandler) {
      try {
        const canProceed = await clickHandler(e);
        if (canProceed === false) {
          return;
        }
      } catch (err) {
        console.error('CompleteOrderButton click error:', err);
        return;
      }
    }

    setStatus('animating');

    // 4000ms: Truck finishes parcel load, door close, headlights on, and drive-out
    timer1Ref.current = setTimeout(() => {
      setStatus('success');

      // 1200ms: Green "Order Placed" state displays, then triggers transition to thermal receipt printer
      timer2Ref.current = setTimeout(() => {
        const completionHandler = onComplete || onAnimationComplete;
        if (typeof completionHandler === 'function') {
          completionHandler();
        }
      }, 1200);
    }, 4000);
  };

  return (
    <button
      type="button"
      onClick={handleStartOrder}
      disabled={status !== 'idle' || disabled}
      className={`truck-order-btn ${status} ${className}`}
      style={style}
      aria-label={status === 'success' ? successText : defaultText}
    >
      <span className="btn-label default-label">{defaultText}</span>

      <div className="truck-scene" aria-hidden="true">
        <div className="road-lines"></div>
        <div className="package-box"></div>
        <div className="delivery-truck">
          <div className="truck-body">
            <div className="truck-bed"></div>
            <div className="truck-door"></div>
          </div>
          <div className="truck-cabin">
            <div className="truck-window"></div>
            <div className="truck-headlight"></div>
          </div>
          <div className="truck-wheel wheel-back"></div>
          <div className="truck-wheel wheel-front"></div>
        </div>
      </div>

      <span className="btn-label success-label">
        {successText}
        <svg viewBox="0 0 16 16" className="w-4 h-4 fill-none stroke-current stroke-2">
          <polyline points="3 8 7 12 13 4" />
        </svg>
      </span>
    </button>
  );
}
