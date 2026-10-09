import React, { useState } from 'react';
import { X, CheckCircle, Printer, ArrowRight, CreditCard, Banknote, QrCode, MapPin, User, Mail, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { BrandLogo } from './BrandLogo';

export const CheckoutModal = ({ isOpen, onClose, onOrderConfirmed }) => {
  const { cartItems, subtotal, gstAmount, shippingFee, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  // Step 1 = Form, Step 2 = Invoice View
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('42 Park Avenue, Haute Towers');
  const [city, setCity] = useState('Mumbai');
  const [pincode, setPincode] = useState('400001');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [formError, setFormError] = useState('');

  // Generated Invoice Data State
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !email || !address || !city || !pincode) {
      setFormError('Please fill in all shipping details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiService.placeOrder({
        customer: {
          name: fullName,
          email,
          address,
          city,
          pincode,
          paymentMethod:
            paymentMethod === 'COD'
              ? 'Cash on Delivery'
              : paymentMethod === 'UPI'
              ? 'Instant UPI / GPay'
              : 'Credit / Debit Card',
        },
        items: cartItems,
        subtotal,
        gstAmount,
        shippingFee,
        totalAmount,
      });

      if (res.success) {
        setGeneratedInvoice(res.data);
        clearCart();
        setStep(2);
        if (onOrderConfirmed) {
          onOrderConfirmed(res.data);
        }
      }
    } catch (err) {
      setFormError('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    setStep(1);
    setGeneratedInvoice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header Decorator */}
        <div className="bg-slate-950 text-white p-6 relative overflow-hidden flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={false} />
            <div>
              <h3 className="font-sans font-bold text-xl text-[#F3F4F6]">
                {step === 1 ? 'Checkout & Shipping' : 'Official Digital Invoice'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 1 ? 'Enter your delivery address to place order' : `Receipt ID: ${generatedInvoice?.orderId}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CUSTOMER CHECKOUT FORM */}
        {step === 1 && (
          <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-slate-800">
            
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                {formError}
              </div>
            )}

            {/* Customer Contact Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                1. Customer Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Princel Tixeira"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="princel@stylestack.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                2. Delivery Destination
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat 4B, Emerald Towers, Bandra West"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="400050"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Toggle */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                3. Payment Method (Simulated)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-rose-600 bg-rose-50/50 text-slate-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-rose-600 mb-1" />
                  <p className="font-bold text-xs">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-400">Pay when delivered</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-rose-600 bg-rose-50/50 text-slate-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600 mb-1" />
                  <p className="font-bold text-xs">Instant UPI / GPay</p>
                  <p className="text-[10px] text-slate-400">Zero transaction fee</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-rose-600 bg-rose-50/50 text-slate-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600 mb-1" />
                  <p className="font-bold text-xs">Debit / Credit Card</p>
                  <p className="text-[10px] text-slate-400">Visa, Mastercard</p>
                </button>
              </div>
            </div>

            {/* Total Order Summary Box */}
            <div className="bg-slate-950 text-white p-4 rounded-2xl flex items-center justify-between text-xs font-bold border border-slate-800">
              <div>
                <span className="text-slate-400 block font-normal text-[11px]">Total Pay Amount (incl. 5% GST)</span>
                <span className="text-2xl text-rose-400 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* STEP 2: PRINTABLE DIGITAL INVOICE RECEIPT */}
        {step === 2 && generatedInvoice && (
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-slate-800 print-section">
            
            {/* Confirmation Banner */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Order Confirmed &amp; Invoiced!</h4>
                  <p className="text-xs text-emerald-700">A digital receipt has been logged to your account.</p>
                </div>
              </div>
              <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                Status: Confirmed / Processing
              </span>
            </div>

            {/* Official Header with PHR Monogram */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" subtitle="DRESS & CLOTHING HUB" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Invoice</p>
                <p className="font-mono font-bold text-lg text-slate-900">{generatedInvoice.orderId}</p>
                <p className="text-xs text-slate-500">
                  {new Date(generatedInvoice.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Customer Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Billed &amp; Shipped To:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{generatedInvoice.customer.name}</p>
                <p className="text-slate-600">{generatedInvoice.customer.address}</p>
                <p className="text-slate-600">{generatedInvoice.customer.city} — {generatedInvoice.customer.pincode}</p>
                <p className="text-slate-500 text-[11px] mt-1">{generatedInvoice.customer.email}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold uppercase text-[10px]">Payment Details:</p>
                <p className="font-bold text-slate-900 mt-0.5">{generatedInvoice.customer.paymentMethod}</p>
                <p className="text-slate-500 mt-2 text-[10px] uppercase font-bold text-emerald-600">
                  Estimated Delivery: {generatedInvoice.estimatedDelivery}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Itemized Breakdown</h5>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Item &amp; Category</th>
                      <th className="py-2.5 px-2 text-center">Size</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {generatedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.category}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-bold">{item.selectedSize}</td>
                        <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono">₹{item.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-bold font-mono">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Summary Box */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal</span>
                <span className="font-mono">₹{generatedInvoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST Tax (5%)</span>
                <span className="font-mono">₹{generatedInvoice.gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Express Shipping Fee</span>
                <span>{generatedInvoice.shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₹${generatedInvoice.shippingFee}`}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 mt-2 flex justify-between items-baseline font-bold text-sm">
                <span className="text-white text-base">Grand Total Paid</span>
                <span className="text-2xl text-rose-400 font-mono">₹{generatedInvoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <button
                onClick={handleFinish}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
