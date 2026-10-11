import React, { useState, useRef, useEffect } from 'react';
import './CompleteOrderButton.css';

/**
 * CompleteOrderButton
 * 
 * Interactive checkout button featuring:
 * - Initial state: Sleek dark button with "Complete Order"
 * - Click sequence: Shrinks into an oval/circle -> parcel box drops into truck ->
 *   truck drives off with speed lines -> expands into green pill with "Order Placed" + checkmark
 * - Completion: Calls onAnimationComplete() to trigger receipt printing
 */
const CompleteOrderButton = ({
  onAnimationComplete,
  onClick,
  disabled = false,
  className = '',
  style = {},
  type = 'button',
  defaultText = 'Complete Order',
  successText = 'Order Placed',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Keep references to timers to prevent leaks if unmounted
  const timer1Ref = useRef(null);
  const timer2Ref = useRef(null);

  useEffect(() => {
    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, []);

  const handleClick = async (e) => {
    if (disabled || isAnimating || isSuccess) return;

    // If an external onClick handler is provided (e.g. form validation or async checkout)
    if (onClick) {
      try {
        const proceed = await onClick(e);
        // If handler explicitly returned false, abort starting animation
        if (proceed === false) {
          return;
        }
      } catch (err) {
        console.error('CompleteOrderButton click error:', err);
        return;
      }
    }

    setIsAnimating(true);

    // Phase 1: 4500ms total truck driving & box drop animation
    timer1Ref.current = setTimeout(() => {
      setIsAnimating(false);
      setIsSuccess(true);

      // Phase 2: Green "Order Placed" state displays for 1000ms, then invokes receipt printer
      timer2Ref.current = setTimeout(() => {
        if (typeof onAnimationComplete === 'function') {
          onAnimationComplete();
        }
      }, 1000);
    }, 4500);
  };

  return (
    <button
      type={type}
      className={`order-button ${isAnimating ? 'active' : ''} ${isSuccess ? 'success' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || isAnimating || isSuccess}
      style={style}
      aria-label={isSuccess ? successText : defaultText}
    >
      <span className="default">{defaultText}</span>
      <span className="success">
        {successText}
        <svg viewBox="0 0 12 10" aria-hidden="true">
          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
        </svg>
      </span>
      <div className="truck" aria-hidden="true">
        <div className="back"></div>
        <div className="front">
          <div className="window"></div>
        </div>
        <div className="light top"></div>
        <div className="light bottom"></div>
        <div className="box"></div>
      </div>
      <div className="lines" aria-hidden="true"></div>
    </button>
  );
};

export default CompleteOrderButton;
