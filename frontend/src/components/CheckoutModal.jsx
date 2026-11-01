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
import { saveNewOrder } from '../utils/orderStorage';
import { BrandLogo } from './BrandLogo';
import { ThermalReceiptPrinter } from './ThermalReceiptPrinter';
import './CompleteOrderButton.css';

// Dynamically load Razorpay standard checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Self-contained embedded CompleteOrderButton component with zero external dependencies
const CompleteOrderButton = ({
  onComplete,
  onClick,
  totalAmount,
  disabled = false,
  className = '',
  style = {},
}) => {
  const [stage, setStage] = useState('idle'); // 'idle' | 'running' | 'done'

  useEffect(() => {
    setStage('idle');
  }, [totalAmount]);

  const handleClick = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (stage !== 'idle' || disabled) return;

    if (typeof onClick === 'function') {
      try {
        const canProceed = await onClick(e);
        if (canProceed === false) return;
      } catch (err) {
        console.error('CompleteOrderButton click error:', err);
        return;
      }
    }

    setStage('running');

    // 1. Full animation sequence duration (3.6s)
    setTimeout(() => {
      setStage('done');

      // 2. Allow user to see "Order Placed" before receipt opens
      setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 1200);
    }, 3600);
  };

  return (
    <div className={`truck-btn-wrapper ${className}`} style={style}>
      <button
        type="button"
        onClick={handleClick}
        disabled={stage !== 'idle' || disabled}
        className={`order-truck-button ${stage}`}
        aria-label={stage === 'done' ? 'Order Placed' : 'Complete Order'}
      >
        <span className="btn-label-text default-label">Complete Order</span>

        {/* Viewport scene */}
        <div className="truck-viewport" aria-hidden="true">
          <div className="road-stripes"></div>

          {/* Truck Assembly */}
          <div className="truck-assembly">
            <div className="truck-bed-container">
              {/* Parcel box drops directly into this bed */}
              <div className="truck-box"></div>
              <div className="bed-wall-floor"></div>
              <div className="bed-door-tailgate"></div>
            </div>

            <div className="truck-cab-unit">
              <div className="cab-windshield"></div>
              <div className="cab-headlamp"></div>
            </div>

            <div className="truck-tire tire-rear"></div>
            <div className="truck-tire tire-front"></div>
          </div>
        </div>

        <span className="btn-label-text success-label">
          Order Placed
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M3 8.5l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
};

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
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'RAZORPAY' | 'UPI' | 'CARD'
  const [formError, setFormError] = useState('');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState(null); // { type: 'success' | 'error' | 'warning' | 'info', text: string }

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
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Persistent order total to prevent ₹0 reset during checkout animation
  const [orderTotal, setOrderTotal] = useState(totalAmount || 0);
  useEffect(() => {
    if (totalAmount > 0) {
      setOrderTotal(totalAmount);
    }
  }, [totalAmount]);

  const activeOrderData = invoiceOrder || generatedInvoice;
  const displayedTotal = totalAmount > 0 ? totalAmount : (orderTotal || activeOrderData?.totalAmount || activeOrderData?.total || 0);
  const invoicePaymentMethod = activeOrderData?.customer?.paymentMethod || activeOrderData?.paymentMethod || '';
  const isInvoicePaidOnline = Boolean(
    invoicePaymentMethod &&
    !invoicePaymentMethod.toLowerCase().includes('cash') &&
    invoicePaymentMethod.toLowerCase() !== 'cod'
  );

  // Cleanly reset modal states whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setGeneratedInvoice(null);
      setInvoiceOrder(null);
      setFormError('');
      setPaymentStatusMessage(null);
      setShowCardOtpModal(false);
      setCardOtp('');
      setOtpError('');
    } else {
      setStep(1);
      setEmail(activeUser?.email || 'customer@stylestack.com');
      setFormError('');
      setPaymentStatusMessage(null);
      loadRazorpayScript().catch(() => {});
    }
  }, [isOpen, activeUser?.email]);

  function handleBackToHome() {
    clearCart();
    setStep(1);
    setGeneratedInvoice(null);
    setInvoiceOrder(null);
    onClose();
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleTransitionToReceipt() {
    setShowCardOtpModal(false);

    const selectedPaymentMethod =
      paymentMethod === 'RAZORPAY'
        ? (invoiceOrder?.paymentMethod || 'Razorpay Gateway (Online Verified - Test Mode)')
        : paymentMethod === 'CARD'
        ? 'Credit / Debit Card (Online 3D-Secure Verified)'
        : paymentMethod === 'UPI'
        ? (upiMode === 'QR' ? 'Instant UPI (QR Code Scanned)' : `Instant UPI (${upiId || 'Verified'})`)
        : 'Cash on Delivery (COD)';

    const orderPayload = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      createdAt: new Date().toISOString(),
      items: Array.isArray(cartItems) && cartItems.length > 0 ? cartItems.map((i) => ({ ...i })) : (invoiceOrder?.items || []),
      subtotal: Number(subtotal || invoiceOrder?.subtotal || 0),
      gstAmount: Number(gstAmount || invoiceOrder?.gstAmount || 0),
      shippingFee: Number(shippingFee || invoiceOrder?.shippingFee || 0),
      total: Number(displayedTotal || totalAmount || 0),
      totalAmount: Number(displayedTotal || totalAmount || 0),
      paymentMethod: selectedPaymentMethod,
      customer: {
        name: (fullName || '').trim() || 'Valued Customer',
        email: (email || '').trim() || activeUser?.email || 'customer@stylestack.com',
        address: (address || '').trim() || 'Standard Delivery Address',
        city: city || 'Mumbai',
        state: state || 'Maharashtra',
        pincode: pincode || '400001',
        paymentMethod: selectedPaymentMethod,
      },
      status: 'Placed',
      estimatedDelivery: '3-4 Business Days',
    };

    const finalOrder = (invoiceOrder && invoiceOrder.id) ? { ...orderPayload, ...invoiceOrder } : orderPayload;

    setInvoiceOrder(finalOrder);
    setGeneratedInvoice(finalOrder);

    if (typeof onOrderConfirmed === 'function') {
      try {
        onOrderConfirmed(finalOrder);
      } catch (err) {
        console.error('Error invoking onOrderConfirmed:', err);
      }
    }
    // Cart clearing happens strictly after the animation completes and order is confirmed
    clearCart();
    setStep(2);
  }

  function handleOrderSuccess() {
    handleTransitionToReceipt();
  }

  if (!isOpen) return null;

  // Step 2: Interactive Thermal Receipt Printer Modal
  if (step === 2) {
    const fallbackOrder = invoiceOrder || generatedInvoice || {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      items: (cartItems || []).map((item) => ({ ...item })),
      subtotal: subtotal || 0,
      gstAmount: gstAmount || 0,
      shippingFee: shippingFee || 0,
      totalAmount: totalAmount || 0,
      total: totalAmount || 0,
      paymentMethod: paymentMethod || 'Instant UPI / GPay',
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: new Date().toISOString(),
    };

    return (
      <ThermalReceiptPrinter
        invoice={fallbackOrder}
        order={fallbackOrder}
        orderDetails={fallbackOrder}
        onClose={handleBackToHome}
      />
    );
  }

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
      setFullName('Valued Customer');
    }
    if (!email.trim()) {
      setEmail(activeUser?.email || 'customer@stylestack.com');
    }
    if (!address.trim()) {
      setFormError('Please enter your street address.');
      return false;
    }
    if (!state) {
      setState('Maharashtra');
    }
    if (!city) {
      setCity('Mumbai');
    }
    const cleanedPincode = pincode.replace(/\D/g, '');
    if (cleanedPincode.length !== 6) {
      setPincode('400001');
    }
    return true;
  };

  // Core Order Execution (calls apiService.placeOrder)
  const executePlaceOrder = async (confirmedPaymentMethod, options = {}) => {
    const { deferStepTransition = false } = options;
    setIsSubmitting(true);
    setFormError('');

    // Pre-capture and clone cart items and monetary calculations prior to state mutations
    const capturedItems = Array.isArray(cartItems) && cartItems.length > 0
      ? cartItems.map((item) => ({ ...item }))
      : [];
    const capturedSubtotal = Number(subtotal || 0);
    const capturedGst = Number(gstAmount || 0);
    const capturedShipping = Number(shippingFee || 0);
    const capturedTotal = Number(totalAmount || (capturedSubtotal + capturedGst + capturedShipping));
    const cleanedPincode = pincode.replace(/\D/g, '') || '400001';

    // Guaranteed independent complete orderData object
    const safeOrderData = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customer: {
        name: fullName.trim() || 'Valued Customer',
        email: email.trim() || 'customer@stylestack.com',
        address: address.trim() || 'Standard Delivery Address',
        state: state || 'Maharashtra',
        city: city || 'Mumbai',
        pincode: cleanedPincode,
        paymentMethod: confirmedPaymentMethod,
      },
      paymentMethod: confirmedPaymentMethod,
      items: capturedItems,
      subtotal: capturedSubtotal,
      gstAmount: capturedGst,
      shippingFee: capturedShipping,
      totalAmount: capturedTotal,
      total: capturedTotal,
      status: 'Placed',
      estimatedDelivery: '3-4 Business Days',
    };

    try {
      const res = await apiService.placeOrder({
        customer: safeOrderData.customer,
        items: capturedItems,
        subtotal: capturedSubtotal,
        gstAmount: capturedGst,
        shippingFee: capturedShipping,
        totalAmount: capturedTotal,
      });

      const finalOrder = (res && res.success && res.data)
        ? { ...safeOrderData, ...res.data }
        : safeOrderData;

      // Safely store order data without clearing cart or navigating prematurely
      setInvoiceOrder(finalOrder);
      setGeneratedInvoice(finalOrder);
    } catch (err) {
      console.error('Order placement caught exception:', err);
      // Fallback order state
      saveNewOrder(safeOrderData);
      setInvoiceOrder(safeOrderData);
      setGeneratedInvoice(safeOrderData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for clicking CompleteOrderButton in the main checkout view
  const handleCompleteOrderClick = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setFormError('');

    if (!validateDeliveryDetails()) {
      return false;
    }

    // CARD FLOW: Validate Card Fields & Prompt 3D-Secure OTP
    if (paymentMethod === 'CARD') {
      const cleanedCardNumber = cardNumber.replace(/\D/g, '');
      if (cleanedCardNumber.length !== 16) {
        setFormError('Please enter a valid 16-digit debit/credit card number.');
        return false;
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
        return false;
      }

      if (!cardHolder.trim()) {
        setFormError('Please enter the cardholder name.');
        return false;
      }

      // Card details are valid; open simulated 3D-Secure OTP modal
      setOtpError('');
      setCardOtp('');
      setShowCardOtpModal(true);
      return false; // Do not animate main button; animate in the OTP modal
    }

    // RAZORPAY TEST MODE FLOW
    if (paymentMethod === 'RAZORPAY') {
      if (isSubmitting) return false;
      setIsSubmitting(true);
      setPaymentStatusMessage(null);

      try {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded || typeof window.Razorpay === 'undefined') {
          setPaymentStatusMessage({
            type: 'error',
            text: 'Could not load Razorpay Checkout script. Please check your network connection and retry.',
          });
          setIsSubmitting(false);
          return false;
        }

        const capturedItems = Array.isArray(cartItems) && cartItems.length > 0
          ? cartItems.map((item) => ({ ...item }))
          : [];
        const capturedSubtotal = Number(subtotal || 0);
        const capturedGst = Number(gstAmount || 0);
        const capturedShipping = Number(shippingFee || 0);
        const capturedTotal = Number(displayedTotal || totalAmount || (capturedSubtotal + capturedGst + capturedShipping));
        const cleanedPincode = pincode.replace(/\D/g, '') || '400001';

        // 1. Create StyleStack order record
        const orderRes = await apiService.placeOrder({
          customer: {
            name: fullName.trim() || 'Valued Customer',
            email: email.trim() || activeUser?.email || 'customer@stylestack.com',
            address: address.trim() || 'Standard Delivery Address',
            state: state || 'Maharashtra',
            city: city || 'Mumbai',
            pincode: cleanedPincode,
            paymentMethod: 'Razorpay Gateway (Test Mode)',
          },
          items: capturedItems,
          subtotal: capturedSubtotal,
          gstAmount: capturedGst,
          shippingFee: capturedShipping,
          totalAmount: capturedTotal,
        });

        const activeOrder = orderRes?.data || {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        };
        const orderId = activeOrder.orderId || activeOrder.id;

        // 2. Create server-side Razorpay payment order
        const rzpOrderRes = await apiService.createRazorpayOrder({
          amount: capturedTotal,
          currency: 'INR',
          receipt: orderId,
          orderId,
          notes: {
            customerName: fullName.trim() || 'Valued Customer',
            customerEmail: email.trim() || activeUser?.email || '',
          },
        });

        const rzpData = rzpOrderRes?.data || {};
        const rzpOrderId = rzpData.orderId;
        const rzpKey = rzpData.keyId || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) || 'rzp_test_placeholder';

        // 3. Launch Razorpay Standard Checkout modal
        const rzpOptions = {
          key: rzpKey,
          amount: rzpData.amount || Math.round(capturedTotal * 100),
          currency: rzpData.currency || 'INR',
          name: 'StyleStack Luxury Fashion',
          description: `Order #${orderId} Payment (Test Mode)`,
          order_id: rzpOrderId,
          prefill: {
            name: fullName.trim() || activeUser?.name || 'Valued Customer',
            email: email.trim() || activeUser?.email || 'customer@stylestack.com',
            contact: '9999999999',
          },
          theme: {
            color: '#e11d48',
          },
          handler: async function (response) {
            // Successful payment returned from Razorpay modal
            try {
              setPaymentStatusMessage({
                type: 'info',
                text: 'Verifying payment signature with StyleStack server...',
              });

              const verifyRes = await apiService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
              });

              if (verifyRes.success) {
                setPaymentStatusMessage({
                  type: 'success',
                  text: `Payment Successful & Verified! Transaction Ref: ${response.razorpay_payment_id}`,
                });

                const confirmedOrder = {
                  ...activeOrder,
                  subtotal: capturedSubtotal,
                  gstAmount: capturedGst,
                  shippingFee: capturedShipping,
                  totalAmount: capturedTotal,
                  total: capturedTotal,
                  paymentMethod: `Razorpay Test Mode (${response.razorpay_payment_id})`,
                  paymentStatus: 'Paid',
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                };

                setInvoiceOrder(confirmedOrder);
                setGeneratedInvoice(confirmedOrder);

                setTimeout(() => {
                  handleTransitionToReceipt();
                }, 1200);
              } else {
                setPaymentStatusMessage({
                  type: 'error',
                  text: verifyRes.message || 'Payment signature verification failed. Please contact support.',
                });
                setIsSubmitting(false);
              }
            } catch (vErr) {
              setPaymentStatusMessage({
                type: 'error',
                text: 'Verification error: ' + (vErr.message || 'Unknown verification error'),
              });
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setPaymentStatusMessage({
                type: 'warning',
                text: 'Payment was cancelled. You can retry payment or choose another payment method.',
              });
              apiService.recordPaymentFailure({
                orderId,
                error: { reason: 'payment_cancelled_by_user' },
              });
            },
          },
        };

        const rzp = new window.Razorpay(rzpOptions);

        rzp.on('payment.failed', function (resp) {
          setIsSubmitting(false);
          const failureDesc = resp?.error?.description || resp?.error?.reason || 'Transaction could not be completed.';
          setPaymentStatusMessage({
            type: 'error',
            text: `Payment Failed: ${failureDesc}`,
          });
          apiService.recordPaymentFailure({
            orderId,
            razorpay_payment_id: resp?.error?.metadata?.payment_id,
            error: resp?.error,
          });
        });

        rzp.open();
        return false;
      } catch (err) {
        console.error('Razorpay initialization exception:', err);
        setIsSubmitting(false);
        setPaymentStatusMessage({
          type: 'error',
          text: 'Payment initialization error: ' + (err.message || 'Could not reach server'),
        });
        return false;
      }
    }

    // UPI FLOW: Instant background preparation without early navigation timers
    if (paymentMethod === 'UPI') {
      if (upiMode === 'ID') {
        const cleanedUpi = upiId.trim().toLowerCase();
        if (!cleanedUpi || !cleanedUpi.includes('@') || cleanedUpi.length < 5) {
          setFormError('Please enter a valid UPI ID (e.g. username@okaxis or username@upi).');
          return false;
        }
      }

      await executePlaceOrder('Instant UPI / GPay');
      return true;
    }

    // COD FLOW: Instant background preparation
    await executePlaceOrder('Cash on Delivery');
    return true;
  };

  // 1. Submit Handler from Form (Prevent default form jump)
  const handleSubmitOrder = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
  };

  // 2. Submit Handler for Card 3D-Secure OTP with animation support
  const handleCardOtpAnimationStart = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setOtpError('');

    const cleanedOtp = cardOtp.replace(/\D/g, '');
    if (cleanedOtp.length < 4 || cleanedOtp.length > 6) {
      setOtpError('Please enter the 4 to 6-digit OTP sent to your registered mobile number.');
      return false;
    }

    setIsCardVerifying(true);
    await executePlaceOrder('Credit / Debit Card (3D-Secure Verified)');
    setIsCardVerifying(false);
    return true;
  };

  const handleVerifyCardOtp = async (e) => {
    e.preventDefault();
    await handleCardOtpAnimationStart(e);
  };

  const handlePrint = () => {
    window.print();
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

            {paymentStatusMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all animate-in fade-in duration-150 ${
                  paymentStatusMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : paymentStatusMessage.type === 'warning'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                    : paymentStatusMessage.type === 'info'
                    ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                {paymentStatusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{paymentStatusMessage.text}</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('COD');
                    setPaymentStatusMessage(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Cash on Delivery</p>
                  <p className="text-[10px] text-zinc-500">Pay on delivery</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('RAZORPAY');
                    setPaymentStatusMessage(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    TEST
                  </span>
                  <ShieldCheck className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Razorpay Secure</p>
                  <p className="text-[10px] text-zinc-500">Cards, UPI, NetBank</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('UPI');
                    setPaymentStatusMessage(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Instant UPI / QR</p>
                  <p className="text-[10px] text-zinc-500">Scan QR or enter VPA</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('CARD');
                    setPaymentStatusMessage(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-rose-600 bg-rose-600/10 text-white ring-2 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-rose-500 mb-1" />
                  <p className="font-bold text-xs">Simulated Card</p>
                  <p className="text-[10px] text-zinc-500">3D-Secure Demo</p>
                </button>
              </div>

              {/* DYNAMIC SUBSECTION: RAZORPAY TEST MODE */}
              {paymentMethod === 'RAZORPAY' && (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <ShieldCheck className="w-4 h-4 text-rose-500" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-white flex items-center gap-2">
                          <span>Razorpay Payment Gateway</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            Test Mode Active
                          </span>
                        </h5>
                        <p className="text-[10px] text-zinc-400">
                          Razorpay Standard Checkout with 256-bit Server Signature Verification
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                      <p className="text-zinc-300 font-semibold text-[11px] flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                        <span>Accepted Instruments</span>
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Simulated Credit Cards, Debit Cards, UPI (GPay/PhonePe), NetBanking (50+ Banks), and Wallets.
                      </p>
                    </div>

                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800/80 space-y-1">
                      <p className="text-zinc-300 font-semibold text-[11px] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Zero Risk Sandbox</span>
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Operating in Razorpay Sandbox / Test Mode. No real financial charges will occur.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Payable Total Amount:</span>
                    <span className="font-bold font-mono text-white text-xs">₹{Number(displayedTotal).toLocaleString('en-IN')}</span>
                  </div>

                  {isSubmitting && (
                    <div className="p-3 rounded-xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center gap-2 text-xs text-rose-300 font-bold animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      <span>Connecting to Razorpay gateway... please complete payment in popup.</span>
                    </div>
                  )}
                </div>
              )}

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
                          <span>Instant secure verification upon completing order.</span>
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
                <span className="text-2xl text-rose-500 font-bold font-mono">
                  ₹{Number(displayedTotal).toLocaleString('en-IN')}
                </span>
              </div>

              <CompleteOrderButton
                totalAmount={displayedTotal}
                onClick={handleCompleteOrderClick}
                onComplete={handleOrderSuccess}
              />
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
                  <span className="font-bold font-mono text-rose-400">₹{Number(displayedTotal).toLocaleString('en-IN')}</span>
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

                  <CompleteOrderButton
                    totalAmount={displayedTotal}
                    onClick={handleCardOtpAnimationStart}
                    onComplete={handleOrderSuccess}
                  />
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
