import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onOpenCheckoutModal }) => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    gstAmount,
    shippingFee,
    totalAmount,
    totalItemCount,
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    closeCart();
    onOpenCheckoutModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 max-h-[100dvh] overscroll-contain">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-none">Your Shopping Stack</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List with Native Momentum Scrolling */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-base">Your cart is currently empty</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Explore our luxury festive wear, tailored formals, and summer dresses to build your stack!
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-6 py-3 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-500 transition-colors cursor-pointer min-h-[44px]"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${index}`}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-20 h-24 aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={item.imageUrl || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                          title="Remove Item"
                          aria-label="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>Size: <strong className="text-slate-800">{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span className="text-rose-600 font-semibold">{item.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Scaled Quantity Selector */}
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                          className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs sm:text-sm text-slate-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                          className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] min-h-[32px] rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Breakdown Footer - Prevents Button Clipping */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3.5 sm:space-y-4 shrink-0 pb-6">
              
              {/* Cost Calculations */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (5%)</span>
                  <span className="font-bold text-slate-900 font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900 font-mono">₹{shippingFee}</span>
                    )}
                  </span>
                </div>
                {subtotal > 0 && subtotal < 799 && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Add ₹{(799 - subtotal).toLocaleString('en-IN')} more to unlock FREE Express Shipping!
                  </p>
                )}
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline text-base font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-rose-600 font-mono">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Instant Checkout Button - Min 48px Touch Target */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full min-h-[48px] py-3.5 sm:py-4 px-6 rounded-2xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-sm shadow-xl shadow-slate-900/10 hover:shadow-rose-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant Digital Invoice Generated Upon Order Confirmation</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
