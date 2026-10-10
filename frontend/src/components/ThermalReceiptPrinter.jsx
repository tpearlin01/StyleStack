import React, { useState, Component } from 'react';
import {
  Printer,
  Scissors,
  RotateCcw,
  Home,
  CheckCircle2,
  Download,
  X,
} from 'lucide-react';
import './ThermalReceiptPrinter.css';

// 1. ERROR BOUNDARY WRAPPER FOR SAFE FALLBACK RENDERING
export class ReceiptErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ThermalReceiptPrinter caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="printer-overlay">
          <div className="printer-stage">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-4 max-w-md mx-auto text-white shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Order Confirmed!</h3>
              <p className="text-xs text-zinc-400">
                Payment received successfully. Thank you for shopping with StyleStack.
              </p>
              <button
                type="button"
                onClick={this.props.onClose || (() => window.location.reload())}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 2. INNER RECEIPT PRINTER COMPONENT WITH SAFE OPTIONAL CHAINING & DEFAULTS
const ThermalReceiptPrinterContent = ({ invoice, order, orderDetails, onClose }) => {
  // paperState: 'idle' | 'printing' | 'printed' | 'teared'
  // Default to 'printed' so the receipt is immediately visible with all order details and NOT a blank white paper!
  const [paperState, setPaperState] = useState('printed');

  // Normalize order data from any prop variation (invoice, order, orderDetails)
  const orderObj = order || orderDetails || invoice || {};

  // Safe payment method extraction with fallback
  const paymentMethod =
    order?.paymentMethod ||
    orderDetails?.paymentMethod ||
    invoice?.paymentMethod ||
    orderObj?.customer?.paymentMethod ||
    orderObj?.paymentMethod ||
    orderObj?.paymentMode ||
    'Instant UPI / GPay';

  const isCod =
    typeof paymentMethod === 'string' &&
    (paymentMethod.toLowerCase().includes('cash') ||
      paymentMethod.toLowerCase() === 'cod');
  const isPaidOnline = !isCod;

  // Safe order ID with fallback
  const orderId =
    order?.id ||
    order?.orderId ||
    orderDetails?.id ||
    orderDetails?.orderId ||
    invoice?.id ||
    invoice?.orderId ||
    orderObj?.id ||
    orderObj?.orderId ||
    'SS-ORD-' + Math.floor(100000 + Math.random() * 900000);

  // Safe Date & Time calculation without throwing Invalid time value RangeError
  let formattedDate =
    order?.date ||
    orderDetails?.date ||
    invoice?.date ||
    orderObj?.date ||
    'Today';
  let formattedTime = '';

  const dateVal =
    order?.createdAt ||
    orderDetails?.createdAt ||
    invoice?.createdAt ||
    orderObj?.createdAt ||
    order?.date ||
    orderDetails?.date ||
    invoice?.date ||
    orderObj?.date;

  if (dateVal) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        formattedTime = d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {
      formattedDate = typeof dateVal === 'string' ? dateVal : 'Today';
    }
  }

  // Safe items array with fallback - checking order?.items, orderDetails?.items, invoice?.items
  const rawItems = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(orderDetails?.items)
    ? orderDetails.items
    : Array.isArray(invoice?.items)
    ? invoice.items
    : Array.isArray(orderObj?.items)
    ? orderObj.items
    : Array.isArray(orderObj?.orderItems)
    ? orderObj.orderItems
    : [];

  // Safe numeric totals - checking order?.total, orderDetails?.total, invoice?.total
  const totalAmount = Number(
    order?.total ??
    order?.totalAmount ??
    orderDetails?.total ??
    orderDetails?.totalAmount ??
    invoice?.total ??
    invoice?.totalAmount ??
    orderObj?.total ??
    orderObj?.totalAmount ??
    orderObj?.amount ??
    0
  );

  const subtotal = Number(
    order?.subtotal ??
    orderDetails?.subtotal ??
    invoice?.subtotal ??
    orderObj?.subtotal ??
    (totalAmount > 0 ? Math.round(totalAmount / 1.05) : 0)
  );

  const gstAmount = Number(
    order?.gstAmount ??
    orderDetails?.gstAmount ??
    invoice?.gstAmount ??
    orderObj?.gstAmount ??
    (totalAmount > 0 ? Math.round(totalAmount - subtotal) : 0)
  );

  const shippingFee = Number(
    order?.shippingFee ??
    orderDetails?.shippingFee ??
    invoice?.shippingFee ??
    orderObj?.shippingFee ??
    0
  );

  // Handle PRINT RECEIPT click
  const handlePrint = () => {
    if (paperState === 'printing') return;
    setPaperState('printing');
    setTimeout(() => {
      setPaperState('printed');
    }, 2000);
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
                <span className="font-semibold text-black">
                  {formattedDate} {formattedTime}
                </span>
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
                {(rawItems || []).length === 0 ? (
                  <div className="flex justify-between text-[10px] text-zinc-900 leading-tight">
                    <span className="truncate max-w-[155px]">
                      Selected Apparel Items <strong className="text-zinc-600 font-mono">x1</strong>
                    </span>
                    <span className="font-bold font-mono text-black">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  (rawItems || []).map((item, idx) => {
                    const itemName =
                      item?.name || item?.title || item?.productName || 'Fashion Apparel';
                    const itemQty = Number(item?.quantity ?? item?.qty ?? 1);
                    const itemPrice = Number(
                      item?.price ?? (totalAmount ? Math.round(totalAmount / itemQty) : 0)
                    );
                    const itemTotal = itemPrice * itemQty;
                    return (
                      <div key={idx} className="flex justify-between text-[10px] text-zinc-900 leading-tight">
                        <span className="truncate max-w-[155px]">
                          {itemName} <strong className="text-zinc-600 font-mono">x{itemQty}</strong>
                        </span>
                        <span className="font-bold font-mono text-black">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="text-[10px] space-y-0.5 pb-2 mb-2 border-b border-dashed border-zinc-400 text-zinc-700">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>SHIPPING:</span>
                <span className="font-mono">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN')}`}
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
            disabled={paperState === 'printing'}
            className="control-btn control-btn-primary"
            title="Roll out paper receipt"
          >
            <Printer className="w-4 h-4" />
            <span>
              {paperState === 'printing'
                ? 'PRINTING...'
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

// 3. MAIN EXPORT WRAPPED IN ERROR BOUNDARY
export const ThermalReceiptPrinter = (props) => {
  return (
    <ReceiptErrorBoundary onClose={props.onClose}>
      <ThermalReceiptPrinterContent {...props} />
    </ReceiptErrorBoundary>
  );
};

export default ThermalReceiptPrinter;
