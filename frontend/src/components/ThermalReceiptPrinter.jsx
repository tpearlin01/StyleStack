import React, { useState } from 'react';
import {
  Printer,
  Scissors,
  RotateCcw,
  Home,
  CheckCircle2,
  Download,
} from 'lucide-react';
import './ThermalReceiptPrinter.css';

export const ThermalReceiptPrinter = ({ invoice, onClose }) => {
  // paperState: 'idle' | 'printing' | 'printed' | 'teared'
  const [paperState, setPaperState] = useState('idle');

  if (!invoice) return null;

  const paymentMethod =
    invoice?.customer?.paymentMethod ||
    invoice?.paymentMethod ||
    '';
  const isCod =
    paymentMethod.toLowerCase().includes('cash') ||
    paymentMethod.toLowerCase() === 'cod';
  const isPaidOnline = !isCod;

  const orderId = invoice.orderId || invoice.id || 'SS-ORD';
  const formattedDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : invoice.date || 'Today';

  const formattedTime = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const items = invoice.items || [];
  const totalAmount =
    invoice.totalAmount !== undefined
      ? invoice.totalAmount
      : invoice.total !== undefined
      ? invoice.total
      : 0;

  // Handle PRINT RECEIPT click
  const handlePrint = () => {
    if (paperState === 'printing') return;
    setPaperState('printing');
    setTimeout(() => {
      setPaperState('printed');
    }, 2500);
  };

  // Handle TEAR click
  const handleTear = () => {
    if (paperState !== 'printed') return;
    setPaperState('teared');
  };

  // Handle RESET click
  const handleReset = () => {
    setPaperState('idle');
  };

  // Handle native window print option if user wants a physical sheet
  const handleSystemPrint = () => {
    window.print();
  };

  return (
    <div className="printer-overlay">
      <div className="printer-stage">
        
        {/* 1. GREEN PAYMENT CONFIRMATION PILL (Only for Online Payments) */}
        {isPaidOnline && (
          <div className="payment-confirmation-pill">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Payment Received Successfully! Thank you for your payment.</span>
          </div>
        )}

        {/* 2. SLEEK POS THERMAL PRINTER HARDWARE FIXTURE */}
        <div className="printer-hardware">
          <div className="printer-hardware-header">
            <span className="printer-brand">STYLESTACK POS-80T</span>
            <div className="printer-status-led">
              <span className={`led-dot ${paperState === 'printing' ? 'busy' : ''}`}></span>
              <span>{paperState === 'printing' ? 'FEEDING' : 'READY'}</span>
            </div>
          </div>

          {/* Dark feeder slit with metallic cutter lip */}
          <div className="printer-feeder-slot">
            <div className="cutter-blade-lip"></div>
          </div>
        </div>

        {/* 3. THERMAL PAPER FEED CONTAINER & ROLL ANIMATION */}
        <div className={`paper-feed-container state-${paperState}`}>
          <div className={`thermal-receipt-sheet ${paperState === 'teared' ? 'is-teared' : ''}`}>
            
            {/* StyleStack Monospace Header */}
            <div className="text-center pb-2 mb-2 border-b border-dashed border-zinc-400">
              <p className="tracking-tighter font-extrabold text-[10px] text-zinc-500">
                ================================
              </p>
              <h3 className="text-base font-black tracking-widest text-black my-0.5 uppercase">
                STYLESTACK
              </h3>
              <p className="text-[9px] font-bold tracking-wider text-zinc-600 uppercase">
                EST. 2024 • LUXURY APPAREL
              </p>
              <p className="text-[8px] text-zinc-500">
                OFFICIAL DIGITAL SALES RECEIPT
              </p>
              <p className="tracking-tighter font-extrabold text-[10px] text-zinc-500">
                ================================
              </p>
            </div>

            {/* Receipt Metadata */}
            <div className="text-[10px] space-y-0.5 pb-2 mb-2 border-b border-dashed border-zinc-400 text-zinc-800">
              <div className="flex justify-between">
                <span>ORDER ID:</span>
                <span className="font-black font-mono text-black">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span className="font-semibold text-black">{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT:</span>
                <span className="font-bold text-black uppercase">
                  {isPaidOnline ? 'ONLINE VERIFIED' : 'CASH ON DELIVERY'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="font-black text-black">
                  {isPaidOnline ? 'PAID / CONFIRMED' : 'PENDING ON ARRIVAL'}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="pb-2 mb-2 border-b border-dashed border-zinc-400">
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 pb-1 uppercase">
                <span>ITEM &amp; QTY</span>
                <span>PRICE</span>
              </div>
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] text-zinc-900 leading-tight">
                    <span className="truncate max-w-[155px]">
                      {item.name} <strong className="text-zinc-600 font-mono">x{item.quantity}</strong>
                    </span>
                    <span className="font-bold font-mono text-black">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="text-[10px] space-y-0.5 pb-2 mb-2 border-b border-dashed border-zinc-400 text-zinc-700">
              {invoice.subtotal !== undefined && (
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span className="font-mono">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              {invoice.gstAmount !== undefined && (
                <div className="flex justify-between">
                  <span>GST (5%):</span>
                  <span className="font-mono">₹{invoice.gstAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>SHIPPING:</span>
                <span className="font-mono">
                  {invoice.shippingFee === 0 ? 'FREE' : `₹${invoice.shippingFee || 0}`}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="text-xs font-black text-black flex justify-between items-baseline py-1 border-b border-dashed border-zinc-400">
              <span>{isPaidOnline ? 'GRAND TOTAL PAID:' : 'TOTAL PAYABLE:'}</span>
              <span className="font-mono text-sm font-black">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Stylized Simulated Barcode */}
            <div className="pt-3 pb-1 text-center">
              <div className="flex justify-center items-center gap-[2px] h-6 px-4 mb-1 opacity-80">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3].map((w, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${w}px` }}></div>
                ))}
              </div>
              <p className="text-[8px] font-mono tracking-widest text-zinc-600">
                *{orderId}*
              </p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 mt-1">
                THANK YOU FOR SHOPPING!
              </p>
            </div>

            {/* Razor-sharp Serrated / Jagged Bottom Edge */}
            <div className="serrated-tear-edge">
              <svg viewBox="0 0 260 12" className="w-full h-3 fill-white block" preserveAspectRatio="none">
                <polygon points="0,0 10,12 20,0 30,12 40,0 50,12 60,0 70,12 80,0 90,12 100,0 110,12 120,0 130,12 140,0 150,12 160,0 170,12 180,0 190,12 200,0 210,12 220,0 230,12 240,0 250,12 260,0" />
              </svg>
            </div>

          </div>
        </div>

        {/* 4. MANUAL INTERACTIVE CONTROL ACTION DOCK (NO AUTO-DISAPPEAR) */}
        <div className="printer-control-dock">
          {/* Print Receipt Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={paperState === 'printing' || paperState === 'printed' || paperState === 'teared'}
            className="control-btn control-btn-primary"
            title="Roll out paper receipt"
          >
            <Printer className="w-4 h-4" />
            <span>
              {paperState === 'printing'
                ? 'PRINTING...'
                : paperState === 'printed' || paperState === 'teared'
                ? 'PRINTED'
                : 'PRINT RECEIPT'}
            </span>
          </button>

          {/* Tear Button */}
          <button
            type="button"
            onClick={handleTear}
            disabled={paperState !== 'printed'}
            className="control-btn control-btn-secondary"
            title="Detach receipt from cutter"
          >
            <Scissors className="w-4 h-4" />
            <span>{paperState === 'teared' ? 'TEARED' : 'TEAR'}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            disabled={paperState === 'printing' || paperState === 'idle'}
            className="control-btn control-btn-secondary"
            title="Roll back into slot"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>

          {/* Back to Home Button */}
          <button
            type="button"
            onClick={onClose}
            className="control-btn control-btn-secondary"
            title="Close modal and return to store"
          >
            <Home className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </button>
        </div>

        {/* Optional browser print helper if paper is out */}
        {(paperState === 'printed' || paperState === 'teared') && (
          <button
            type="button"
            onClick={handleSystemPrint}
            className="mt-3 text-[11px] text-zinc-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print PDF via Browser</span>
          </button>
        )}

      </div>
    </div>
  );
};

export default ThermalReceiptPrinter;
