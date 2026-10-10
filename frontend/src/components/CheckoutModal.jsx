import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  CheckCircle2,
  Printer,
  ArrowRight,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  User,
  Mail,
  Loader2,
  Home,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { BrandLogo } from './BrandLogo';
import { ReceiptAnimation } from './ReceiptAnimation';

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
  const [showReceiptAnimation, setShowReceiptAnimation] = useState(false);

  // Form State: strictly blank initially, email strictly from currentUser.email
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'UPI' | 'CARD'
  const [formError, setFormError] = useState('');

  // UPI Specific State
  const [upiMode, setUpiMode] = useState('QR'); // 'QR' | 'ID'
  const [upiId, setUpiId] = useState('');
  const [isUpiVerifying, setIsUpiVerifying] = useState(false);
  const [hasCopiedUpi, setHasCopiedUpi] = useState(false);

  // Card Specific State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [showCardOtpModal, setShowCardOtpModal] = useState(false);
  const [cardOtp, setCardOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isCardVerifying, setIsCardVerifying] = useState(false);

  // Generated Invoice Data State
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const invoicePaymentMethod = generatedInvoice?.customer?.paymentMethod || '';
  const isInvoicePaidOnline = Boolean(
    invoicePaymentMethod &&
    !invoicePaymentMethod.toLowerCase().includes('cash') &&
    invoicePaymentMethod.toLowerCase() !== 'cod'
  );

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
    setCity('');
  };

  const availableCities = state
    ? INDIAN_STATES_CITIES[state] || []
    : ALL_PROMINENT_CITIES;

  // Helper formatting for Card Inputs
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard?.writeText('stylestack.pay@icici');
    setHasCopiedUpi(true);
    setTimeout(() => setHasCopiedUpi(false), 2000);
  };

  // Validate Customer Details and Shipping Address
  const validateDeliveryDetails = () => {
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return false;
    }
    if (!address.trim()) {
      setFormError('Please enter your street address.');
      return false;
    }
    if (!state) {
      setFormError('Please select your delivery state.');
      return false;
    }
    if (!city) {
      setFormError('Please select your delivery city.');
      return false;
    }
    const cleanedPincode = pincode.replace(/\D/g, '');
    if (cleanedPincode.length !== 6) {
      setFormError('Please enter a valid 6-digit Pincode.');
      return false;
    }
    return true;
  };

  // Core Order Execution (calls apiService.placeOrder)
  const executePlaceOrder = async (confirmedPaymentMethod) => {
    setIsSubmitting(true);
    setFormError('');

    try {
      const cleanedPincode = pincode.replace(/\D/g, '');
      const res = await apiService.placeOrder({
        customer: {
          name: fullName.trim(),
          email: email.trim(),
          address: address.trim(),
          state: state,
          city: city,
          pincode: cleanedPincode,
          paymentMethod: confirmedPaymentMethod,
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
        setShowCardOtpModal(false);
        setShowReceiptAnimation(true);
        if (onOrderConfirmed) {
          onOrderConfirmed(res.data);
        }
      } else {
        setFormError(res.message || 'Failed to place order.');
      }
    } catch {
      setFormError('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Submit Handler from Form
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateDeliveryDetails()) {
      return;
    }

    // COD FLOW: Instant Order Confirmation
    if (paymentMethod === 'COD') {
      await executePlaceOrder('Cash on Delivery');
      return;
    }

    // UPI FLOW: Verification Required
    if (paymentMethod === 'UPI') {
      if (upiMode === 'ID') {
        const cleanedUpi = upiId.trim().toLowerCase();
        if (!cleanedUpi || !cleanedUpi.includes('@') || cleanedUpi.length < 5) {
          setFormError('Please enter a valid UPI ID (e.g. username@okaxis or username@upi).');
          return;
        }
      }

      setIsUpiVerifying(true);
      setTimeout(async () => {
        setIsUpiVerifying(false);
        await executePlaceOrder('Instant UPI / GPay');
      }, 1500);
      return;
    }

    // CARD FLOW: Validate Card Fields & Prompt 3D-Secure OTP
    if (paymentMethod === 'CARD') {
      const cleanedCardNumber = cardNumber.replace(/\D/g, '');
      if (cleanedCardNumber.length !== 16) {
        setFormError('Please enter a valid 16-digit debit/credit card number.');
        return;
      }

      const expiryParts = cardExpiry.split('/');
      if (
        expiryParts.length !== 2 ||
        expiryParts[0].length !== 2 ||
        expiryParts[1].length !== 2 ||
        Number(expiryParts[0]) < 1 ||
        Number(expiryParts[0]) > 12
      ) {
        setFormError('Please enter a valid expiry date in MM/YY format (e.g. 08/28).');
        return;
      }

      if (!cardHolder.trim()) {
        setFormError('Please enter the cardholder name.');
        return;
      }

      // Card details are valid; open simulated 3D-Secure OTP modal
      setOtpError('');
      setCardOtp('');
      setShowCardOtpModal(true);
    }
  };

  // 2. Submit Handler for Card 3D-Secure OTP
  const handleVerifyCardOtp = (e) => {
    e.preventDefault();
    setOtpError('');

    const cleanedOtp = cardOtp.replace(/\D/g, '');
    if (cleanedOtp.length < 4 || cleanedOtp.length > 6) {
      setOtpError('Please enter the 4 to 6-digit OTP sent to your registered mobile number.');
      return;
    }

    setIsCardVerifying(true);
    setTimeout(async () => {
      setIsCardVerifying(false);
      await executePlaceOrder('Credit / Debit Card');
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReceiptAnimationComplete = () => {
    setShowReceiptAnimation(false);
    setStep(2);
  };

  const handleBackToHome = () => {
    clearCart();
    setStep(1);
    setShowReceiptAnimation(false);
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
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
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

            {/* Payment Method Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  3. Select Payment Method
                </h4>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure 256-Bit SSL Checkout</span>
                </span>
              </div>

              {/* Payment Method Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Cash on Delivery</p>
                  <p className="text-[10px] text-zinc-500">Instant placement</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Instant UPI / GPay</p>
                  <p className="text-[10px] text-zinc-500">Scan QR or enter VPA</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Debit / Credit Card</p>
                  <p className="text-[10px] text-zinc-500">3D-Secure Verified</p>
                </button>
              </div>

              {/* DYNAMIC SUBSECTION A: INSTANT UPI / GPAY */}
              {paymentMethod === 'UPI' && (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Mode Toggle: Scan QR Code or Enter UPI ID */}
                  <div className="flex items-center justify-center border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setUpiMode('QR')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          upiMode === 'QR'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Scan QR Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMode('ID')}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          upiMode === 'ID'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Enter UPI ID
                      </button>
                    </div>
                  </div>

                  {upiMode === 'QR' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
                      {/* Realistic Standard QR Code Card */}
                      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center border border-zinc-200 text-zinc-900 shrink-0">
                        <div className="p-1 bg-white rounded-xl flex items-center justify-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(`upi://pay?pa=stylestack@bank&pn=StyleStack&am=${totalAmount}&cu=INR`)}`}
                            alt="UPI Payment QR Code"
                            className="w-44 h-44 object-contain rounded-lg"
                            loading="lazy"
                          />
                        </div>

                        <div className="mt-2 text-center">
                          <p className="text-xs font-semibold text-zinc-700">
                            Exact Total Amount: <span className="font-black text-zinc-950 font-mono text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      </div>

                      {/* Instructions & VPA Details */}
                      <div className="space-y-3 max-w-xs text-left">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Scan with any UPI App</p>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Open Google Pay, PhonePe, Paytm, or CRED on your phone and scan the QR code to make payment.
                          </p>
                        </div>

                        {/* Copy VPA Option */}
                        <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-500 block">StyleStack Official UPI ID</span>
                            <span className="text-xs font-mono font-bold text-zinc-200">stylestack.pay@icici</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpiId}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {hasCopiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                          <span>Auto-verifying payment within 1.5 seconds upon confirmation.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Enter UPI ID Interface */
                    <div className="space-y-3 py-2 max-w-md mx-auto">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Enter your UPI ID / Virtual Payment Address (VPA) *
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            placeholder="username@okaxis or mobile@upi"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Quick handle suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 mr-1">Quick Suffix:</span>
                        {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((suf) => (
                          <button
                            key={suf}
                            type="button"
                            onClick={() => {
                              const base = upiId.includes('@') ? upiId.split('@')[0] : upiId || 'username';
                              setUpiId(base + suf);
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
                          >
                            {suf}
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-zinc-400">
                        A payment request of <strong className="text-white font-mono">₹{totalAmount.toLocaleString('en-IN')}</strong> will be verified via your registered UPI app.
                      </p>
                    </div>
                  )}

                  {/* Verification Spinner Banner (When Processing) */}
                  {isUpiVerifying && (
                    <div className="p-3.5 rounded-xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center gap-2.5 text-xs text-rose-300 font-bold animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      <span>Awaiting payment verification from UPI gateway (simulating live response)...</span>
                    </div>
                  )}
                </div>
              )}

              {/* DYNAMIC SUBSECTION B: DEBIT / CREDIT CARD */}
              {paymentMethod === 'CARD' && (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-white">Enter Card Payment Details</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">3D-Secure 2.0 Protected</span>
                  </div>

                  <div className="space-y-3">
                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        16-Digit Card Number *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 •••• •••• 8910"
                          className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 text-xs font-mono font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                        />
                        <span className="absolute right-3.5 top-2.5 text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                          {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'Mastercard' : 'CARD'}
                        </span>
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Expiry Date (MM/YY) *
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 text-xs font-mono font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                      />
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NAME AS PRINTED ON CARD"
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                    <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Clicking pay will open our simulated 3D-Secure OTP verification window.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Order Summary & Action Bar */}
            <div className="bg-zinc-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold border border-zinc-800">
              <div className="text-center sm:text-left">
                <span className="text-zinc-400 block font-normal text-[11px]">Total Pay Amount (incl. 5% GST)</span>
                <span className="text-2xl text-rose-400 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUpiVerifying}
                className="w-full sm:w-auto py-3 px-7 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer active:scale-95"
              >
                {isSubmitting || isUpiVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying &amp; Processing...</span>
                  </>
                ) : paymentMethod === 'COD' ? (
                  <>
                    <span>Confirm &amp; Place Order (COD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : paymentMethod === 'UPI' ? (
                  <>
                    <span>{upiMode === 'QR' ? 'Verify & Confirm QR Payment' : 'Verify & Pay via UPI ID'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Proceed to 3D-Secure Pay — ₹{totalAmount.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* SIMULATED 3D-SECURE / OTP VERIFICATION MODAL OVERLAY (FOR CARD PAYMENTS) */}
        {showCardOtpModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-zinc-200">
              
              {/* Bank Simulation Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">3D-Secure Bank Authentication</h4>
                    <p className="text-[10px] text-zinc-400">Verified by Visa / Mastercard ID Check</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCardOtpModal(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Merchant:</span>
                  <span className="font-bold text-white">StyleStack Luxury Fashion</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount Charged:</span>
                  <span className="font-bold font-mono text-rose-400">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Card:</span>
                  <span className="font-mono text-zinc-300">•••• •••• •••• {cardNumber.replace(/\s/g, '').slice(-4)}</span>
                </div>
              </div>

              {/* OTP Input Form */}
              <form onSubmit={handleVerifyCardOtp} className="space-y-4">
                <div className="space-y-1.5 text-center">
                  <p className="text-xs text-zinc-300">
                    Enter the One-Time Password (OTP) sent to your registered mobile ending in <strong>••89</strong>.
                  </p>
                  <div className="inline-block bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full text-[10px] text-rose-300 font-mono">
                    💡 Simulated Demo OTP: <strong>123456</strong>
                  </div>
                </div>

                {otpError && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium rounded-xl text-center">
                    {otpError}
                  </div>
                )}

                <div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={cardOtp}
                      onChange={(e) => setCardOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white placeholder-zinc-500 text-sm font-mono tracking-widest text-center font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                  <span>Expires in: 04:59</span>
                  <button
                    type="button"
                    onClick={() => setCardOtp('123456')}
                    className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Auto-Fill Demo OTP
                  </button>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isCardVerifying}
                    onClick={() => setShowCardOtpModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isCardVerifying}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-70 active:scale-95"
                  >
                    {isCardVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize Payment</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* STEP 2: PRINTABLE DIGITAL INVOICE RECEIPT */}
        {step === 2 && generatedInvoice && (
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 text-zinc-200 bg-zinc-900 print-section">
            
            {/* Conditional Green Payment Status Banner */}
            {isInvoicePaidOnline && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold">Payment Received Successfully! Thank you for your payment.</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-emerald-500/30">
                  PAID ONLINE
                </span>
              </div>
            )}

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
                <span className="text-white text-base">
                  {isInvoicePaidOnline ? 'Grand Total Paid' : 'Total Payable on Delivery'}
                </span>
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

        {/* RECEIPT PRINTING & TEARING ANIMATION OVERLAY */}
        {showReceiptAnimation && generatedInvoice && (
          <ReceiptAnimation
            orderDetails={generatedInvoice}
            onAnimationComplete={handleReceiptAnimationComplete}
          />
        )}

      </div>
    </div>
  );
};
