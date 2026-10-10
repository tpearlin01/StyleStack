import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Printer, ArrowRight, CreditCard, Banknote, QrCode, MapPin, User, Mail, Loader2, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { BrandLogo } from './BrandLogo';

const INDIAN_STATES_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Varanasi', 'Agra', 'Prayagraj'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
};

const ALL_PROMINENT_CITIES = [
  'Mumbai', 'Pune', 'Nagpur', 'New Delhi', 'Bengaluru', 'Chennai',
  'Hyderabad', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh'
];

export const CheckoutModal = ({ isOpen, onClose, onOrderConfirmed }) => {
  const { cartItems, subtotal, gstAmount, shippingFee, totalAmount, clearCart } = useCart();
  const { currentUser, user } = useAuth();
  const activeUser = currentUser || user;

  // Step 1 = Form, Step 2 = Invoice View
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: strictly blank initially, email strictly from currentUser.email
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [formError, setFormError] = useState('');

  // Generated Invoice Data State
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Prefill email strictly from currentUser and reset errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail(activeUser?.email || '');
      if (step === 1) {
        setFormError('');
      }
    }
  }, [isOpen, activeUser?.email, step]);

  if (!isOpen) return null;

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setState(selectedState);
    // Reset city selection when state changes
    setCity('');
  };

  const availableCities = state
    ? INDIAN_STATES_CITIES[state] || []
    : ALL_PROMINENT_CITIES;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    if (!address.trim()) {
      setFormError('Please enter your street address.');
      return;
    }

    if (!state) {
      setFormError('Please select your state.');
      return;
    }

    if (!city) {
      setFormError('Please select your city.');
      return;
    }

    const cleanedPincode = pincode.replace(/\D/g, '');
    if (cleanedPincode.length !== 6) {
      setFormError('Please enter a valid 6-digit Pincode.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiService.placeOrder({
        customer: {
          name: fullName.trim(),
          email: email.trim(),
          address: address.trim(),
          state: state,
          city: city,
          pincode: cleanedPincode,
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

  // Back to Home action: closes modal, clears cart for completed order, returns cleanly to catalog
  const handleBackToHome = () => {
    clearCart();
    setStep(1);
    setGeneratedInvoice(null);
    onClose();
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleModalClose = () => {
    if (step === 2) {
      handleBackToHome();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 text-white animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header Decorator */}
        <div className="bg-zinc-950 text-white p-6 relative overflow-hidden flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText={false} />
            <div>
              <h3 className="font-sans font-bold text-xl text-white">
                {step === 1 ? 'Checkout & Shipping' : 'Official Digital Invoice'}
              </h3>
              <p className="text-xs text-zinc-400">
                {step === 1 ? 'Enter your delivery address to place order' : `Receipt ID: ${generatedInvoice?.orderId}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CUSTOMER CHECKOUT FORM */}
        {step === 1 && (
          <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-zinc-200 bg-zinc-900">
            
            {formError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium rounded-xl">
                {formError}
              </div>
            )}

            {/* Customer Contact Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                1. Customer Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address (Account Session) *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      readOnly
                      title="Prefilled from active logged-in account"
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs font-medium text-zinc-400 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                2. Delivery Destination
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Street Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Flat no., Building, Street"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* State, City, Pincode Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">State *</label>
                    <select
                      required
                      value={state}
                      onChange={handleStateChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-zinc-950 text-white cursor-pointer transition-colors"
                    >
                      <option value="" className="bg-zinc-950 text-zinc-400">Select State</option>
                      {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                        <option key={st} value={st} className="bg-zinc-950 text-white">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">City *</label>
                    <select
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-zinc-950 text-white cursor-pointer transition-colors"
                    >
                      <option value="" className="bg-zinc-950 text-zinc-400">Select City</option>
                      {availableCities.map((ct) => (
                        <option key={ct} value={ct} className="bg-zinc-950 text-white">
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit Pincode"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 text-xs font-medium font-mono focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Toggle */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                3. Payment Method (Simulated)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/20'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Cash on Delivery</p>
                  <p className="text-[10px] text-zinc-500">Pay when delivered</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/20'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Instant UPI / GPay</p>
                  <p className="text-[10px] text-zinc-500">Zero transaction fee</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/20'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Debit / Credit Card</p>
                  <p className="text-[10px] text-zinc-500">Visa, Mastercard</p>
                </button>
              </div>
            </div>

            {/* Total Order Summary Box */}
            <div className="bg-zinc-950 text-white p-4 rounded-2xl flex items-center justify-between text-xs font-bold border border-zinc-800">
              <div>
                <span className="text-zinc-400 block font-normal text-[11px]">Total Pay Amount (incl. 5% GST)</span>
                <span className="text-2xl text-rose-400 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
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
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-zinc-200 bg-zinc-900 print-section">
            
            {/* Confirmation Banner */}
            <div className="bg-rose-950/30 border border-rose-800/40 text-rose-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">Order Confirmed &amp; Invoiced!</h4>
                  <p className="text-xs text-rose-300/80">A digital receipt has been logged to your account.</p>
                </div>
              </div>
              <span className="bg-rose-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                Status: Confirmed / Processing
              </span>
            </div>

            {/* Official Header with Monogram */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" subtitle="DRESS & CLOTHING HUB" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Digital Invoice</p>
                <p className="font-mono font-bold text-lg text-white">{generatedInvoice.orderId}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(generatedInvoice.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Customer Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs">
              <div>
                <p className="text-zinc-400 font-semibold uppercase text-[10px]">Billed &amp; Shipped To:</p>
                <p className="font-bold text-white text-sm mt-0.5">{generatedInvoice.customer.name}</p>
                <p className="text-zinc-300">{generatedInvoice.customer.address}</p>
                <p className="text-zinc-300">
                  {generatedInvoice.customer.city}
                  {generatedInvoice.customer.state ? `, ${generatedInvoice.customer.state}` : ''} — {generatedInvoice.customer.pincode}
                </p>
                <p className="text-zinc-400 text-[11px] mt-1">{generatedInvoice.customer.email}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400 font-semibold uppercase text-[10px]">Payment Details:</p>
                <p className="font-bold text-white mt-0.5">{generatedInvoice.customer.paymentMethod}</p>
                <p className="text-rose-400 mt-2 text-[10px] uppercase font-bold">
                  Estimated Delivery: {generatedInvoice.estimatedDelivery}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Itemized Breakdown</h5>
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-300 uppercase font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-4">Item &amp; Category</th>
                      <th className="py-2.5 px-2 text-center">Size</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {generatedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/50">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border border-zinc-800"
                          />
                          <div>
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-[10px] text-zinc-400">{item.category}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-zinc-200">{item.selectedSize}</td>
                        <td className="py-3 px-2 text-center font-bold text-zinc-200">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-300">₹{item.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-white">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Summary Box */}
            <div className="bg-zinc-950 text-white p-5 rounded-2xl space-y-2 text-xs border border-zinc-800">
              <div className="flex justify-between text-zinc-300">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">₹{generatedInvoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>GST Tax (5%)</span>
                <span className="font-mono text-white">₹{generatedInvoice.gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Express Shipping Fee</span>
                <span>{generatedInvoice.shippingFee === 0 ? <strong className="text-rose-400">FREE</strong> : `₹${generatedInvoice.shippingFee}`}</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 mt-2 flex justify-between items-baseline font-bold text-sm">
                <span className="text-white text-base">Grand Total Paid</span>
                <span className="text-2xl text-rose-400 font-mono">₹{generatedInvoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Buttons: Print Invoice and Prominent Back to Home */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={handleBackToHome}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

