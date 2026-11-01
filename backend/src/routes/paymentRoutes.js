const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  getPaymentConfig,
  triggerTestEmail,
} = require('../controllers/paymentController');

// Razorpay Order Creation
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/create-order', createRazorpayOrder); // Alias for convenience

// Payment Signature Verification
router.post('/razorpay/verify', verifyRazorpayPayment);

// Payment Failure/Cancellation Recording
router.post('/razorpay/failure', handlePaymentFailure);

// Public Config (Key ID)
router.get('/razorpay/config', getPaymentConfig);

// Gmail SMTP Notification Test
router.post('/email/test', triggerTestEmail);

module.exports = router;
