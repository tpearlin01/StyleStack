import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './AddToCart.css';

const AddToCartButton = ({
  product,
  selectedSize = 'M',
  quantity = 1,
  className = '',
  fullWidth = false,
  label = 'Add to cart',
  onComplete,
}) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = (e) => {
    e?.stopPropagation?.();
    if (isAdding || isSuccess || !product) return;

    // Immediately trigger cart state addition
    addToCart(product, selectedSize || 'M', quantity || 1);

    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onComplete) {
          onComplete();
        }
      }, 2000);
    }, 1500);
  };

  const imageSrc = product?.imageUrl || product?.image || '';

  return (
    <button
      className={`add-to-cart-btn ${fullWidth ? 'full-width' : ''} ${isAdding ? 'animating' : ''} ${isSuccess ? 'success' : ''} ${className}`}
      onClick={handleClick}
      disabled={isAdding || isSuccess}
      type="button"
    >
      {isSuccess ? (
        <Check size={20} color="white" />
      ) : isAdding ? (
        <div className="cart-icon-wrapper">
          <ShoppingCart size={20} color="white" />
          {imageSrc && (
            <img src={imageSrc} alt={product.name || product.title} className="flying-image" />
          )}
        </div>
      ) : (
        label
      )}
    </button>
  );
};

export default AddToCartButton;
