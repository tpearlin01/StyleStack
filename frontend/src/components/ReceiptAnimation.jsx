import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import './ReceiptAnimation.css';

export const ReceiptAnimation = ({ orderDetails, onAnimationComplete }) => {
  const [isPrinting, setIsPrinting] = useState(true);
  const [isTearing, setIsTearing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPrinting(false);
      setIsTearing(true);
      setTimeout(() => {
        setIsTearing(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 1500);
    }, 2400);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!orderDetails) return null;

  const paymentMethod =
    orderDetails?.customer?.paymentMethod ||
    orderDetails?.paymentMethod ||
    '';
  const isCod =
    paymentMethod.toLowerCase().includes('cash') ||
    paymentMethod.toLowerCase() === 'cod';
  const isPaidOnline = !isCod;

  const orderId = orderDetails.orderId || orderDetails.id || 'SS-ORD';
  const formattedDate = orderDetails.createdAt
    ? new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : orderDetails.date || 'Today';

  const items = orderDetails.items || [];
  const totalAmount =
    orderDetails.totalAmount !== undefined
      ? orderDetails.totalAmount
      : orderDetails.total !== undefined
      ? orderDetails.total
      : 0;

  return (
    <div className="receipt-overlay">
      <div className="receipt-content-wrapper">
        
        {/* 1. GREEN PAYMENT CONFIRMATION BOX (Only for Online Payments) */}
        {isPaidOnline && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center justify-center mb-6 text-xs font-semibold shadow-lg text-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Payment Received Successfully! Thank you for your payment.</span>
          </div>
        )}

        {/* 2. PRINTER DISPENSER HOUSING (White dabba with paper slot) */}
        <div className="printer-housing">
          <div className="printer-slot"></div>
        </div>

        {/* 3. WHITE THERMAL RECEIPT SLIDING OUT OF PRINTER */}
        <div
          className={`receipt-paper ${isPrinting ? 'printing' : ''} ${
            isTearing ? 'tearing' : ''
          }`}
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-zinc-400 pb-2.5 mb-2.5">
            <h3 className="font-black text-base tracking-widest text-black uppercase">
              STYLESTACK
            </h3>
            <p className="text-[10px] uppercase text-zinc-600 font-bold tracking-wider">
              Official Receipt
            </p>
          </div>

          {/* Details */}
          <div className="text-[11px] leading-tight space-y-1 border-b border-dashed border-zinc-400 pb-2.5 mb-2.5 text-zinc-800">
            <div className="flex justify-between">
              <span className="text-zinc-600">Order ID:</span>
              <span className="font-bold text-black font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Date:</span>
              <span className="font-semibold text-black">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Payment:</span>
              <span className="font-bold text-black uppercase">
                {isPaidOnline ? 'Online Verified' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Status:</span>
              <span className="font-black text-black">
                {isPaidOnline ? 'PAID' : 'PENDING'}
              </span>
            </div>
          </div>

          {/* Itemized list (No pictures, clean text only as requested) */}
          <div className="text-[11px] space-y-1.5 border-b border-dashed border-zinc-400 pb-2.5 mb-2.5">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-zinc-900">
                <span className="truncate max-w-[140px] font-medium text-left">
                  {item.name} <span className="text-zinc-500 font-bold">x{item.quantity}</span>
                </span>
                <span className="font-bold font-mono">
                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="text-[11px] space-y-1">
            {orderDetails.subtotal !== undefined && (
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{orderDetails.subtotal.toLocaleString('en-IN')}</span>
              </div>
            )}
            {orderDetails.gstAmount !== undefined && (
              <div className="flex justify-between text-zinc-600">
                <span>GST (5%):</span>
                <span className="font-mono">₹{orderDetails.gstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-black text-black pt-1.5 border-t border-zinc-300">
              <span>{isPaidOnline ? 'Total Paid:' : 'Total Payable:'}</span>
              <span className="font-mono text-sm">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Tear Line Decorator */}
          <div className="tear-line"></div>
        </div>

        {/* Subtle Skip / Continue Action */}
        <button
          type="button"
          onClick={onAnimationComplete}
          className="mt-6 text-[11px] text-zinc-400 hover:text-white underline underline-offset-4 transition cursor-pointer"
        >
          Skip &amp; View Digital Invoice →
        </button>

      </div>
    </div>
  );
};

export default ReceiptAnimation;
