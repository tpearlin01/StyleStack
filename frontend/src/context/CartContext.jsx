import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { currentUser, user } = useAuth();
  const activeUser = currentUser || user;
  const userEmail = activeUser?.email ? activeUser.email.toLowerCase().trim() : null;

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Tracks the email whose cart has been loaded into state to prevent overwriting
  const loadedEmailRef = useRef(null);

  // Effect 1: Load cart when active user changes or purge on logout
  useEffect(() => {
    if (userEmail) {
      const cartKey = `stylestack_cart_${userEmail}`;
      try {
        const saved = localStorage.getItem(cartKey);
        const parsed = saved ? JSON.parse(saved) : [];
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Error loading per-user cart', e);
        setCartItems([]);
      }
      loadedEmailRef.current = userEmail;
    } else {
      // Immediate purge of in-memory cart on logout / unauthenticated session
      loadedEmailRef.current = null;
      setCartItems([]);
    }
  }, [userEmail]);

  // Effect 2: Persist cart changes strictly under active user's key
  useEffect(() => {
    if (userEmail && loadedEmailRef.current === userEmail) {
      const cartKey = `stylestack_cart_${userEmail}`;
      try {
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
      } catch (e) {
        console.error('Error saving per-user cart to localStorage', e);
      }
    }
  }, [cartItems, userEmail]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, selectedSize = null, quantity = 1) => {
    const size = selectedSize || (product.sizes && product.sizes[0]) || 'M';

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            category: product.categoryName || product.category,
            price: product.price,
            originalPrice: product.originalPrice,
            imageUrl: product.imageUrl,
            selectedSize: size,
            quantity: quantity,
          },
        ];
      }
    });

    showToast(`Added "${product.name}" (${size}) to cart!`);
  };

  const removeFromCart = (productId, selectedSize) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.selectedSize === selectedSize)
      )
    );
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, selectedSize, delta) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === productId && item.selectedSize === selectedSize) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (userEmail) {
      const cartKey = `stylestack_cart_${userEmail}`;
      try {
        localStorage.removeItem(cartKey);
      } catch (e) {
        console.error('Error clearing per-user cart', e);
      }
    }
  };

  // Calculations
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const shippingFee = subtotal > 0 && subtotal < 1999 ? 99 : 0; // Free shipping over 1999
  const totalAmount = subtotal + gstAmount + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        notification,
        totalItemCount,
        subtotal,
        gstAmount,
        shippingFee,
        totalAmount,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

