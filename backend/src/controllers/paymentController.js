const crypto = require('crypto');
const { getRazorpayInstance, isRazorpayConfigured } = require('../config/razorpay');
const store = require('../data/store');

/**
 * Create a new Razorpay payment order
 * POST /api/payment/razorpay/order
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt, notes, orderId } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      const err = new Error('A valid positive order amount is required');
      err.status = 400;
      throw err;
    }

    // Razorpay requires amount in smallest currency sub-unit (paise for INR)
    const amountInPaise = Math.round(parsedAmount * 100);
    const receiptId = String(receipt || orderId || `rcpt_${Date.now()}`).slice(0, 40);

    const rzp = getRazorpayInstance();

    let rzpOrder;
    if (rzp) {
      rzpOrder = await rzp.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receiptId,
        notes: notes || {
          orderId: orderId || '',
          platform: 'StyleStack E-Commerce',
        },
      });
    } else {
      // Mock / Offline fallback when keys are not configured
      rzpOrder = {
        id: `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt: receiptId,
        status: 'created',
        attempts: 0,
        notes: notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        receipt: rzpOrder.receipt,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 * POST /api/payment/razorpay/verify
 */
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      const err = new Error('Missing payment parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required');
      err.status = 400;
      throw err;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const dataToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    let isSignatureValid = false;

    if (secret && secret.trim()) {
      const expectedSignature = crypto
        .createHmac('sha256', secret.trim())
        .update(dataToSign)
        .digest('hex');
      isSignatureValid = expectedSignature === razorpay_signature;
    } else {
      // In mock/test environments without secret configured:
      // Accept either standard mock token or deterministic HMAC using test key
      const mockSecret = 'mock_secret_fallback';
      const expectedMockSig = crypto
        .createHmac('sha256', mockSecret)
        .update(dataToSign)
        .digest('hex');

      isSignatureValid =
        razorpay_signature === 'mock_valid_signature' ||
        razorpay_signature === expectedMockSig;
    }

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }

    // Update order payment status in store if orderId provided
    let updatedOrder = null;
    if (orderId) {
      try {
        updatedOrder = store.updateOrderPayment(orderId, {
          paymentStatus: 'Paid',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paymentMethod: 'Razorpay Secure (Test Mode)',
          verifiedAt: new Date().toISOString(),
        });
      } catch (storeErr) {
        console.warn(`[Payment] Order ${orderId} not found in local store to update: ${storeErr.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: orderId || null,
        paymentId: razorpay_payment_id,
        paymentStatus: 'Paid',
        razorpayOrderId: razorpay_order_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle payment failure or user cancellation
 * POST /api/payment/razorpay/failure
 */
const handlePaymentFailure = async (req, res, next) => {
  try {
    const { orderId, razorpay_payment_id, error } = req.body;

    let updatedOrder = null;
    if (orderId) {
      try {
        updatedOrder = store.updateOrderPayment(orderId, {
          paymentStatus: 'Failed',
          razorpayPaymentId: razorpay_payment_id || null,
          failureReason: error?.description || error?.reason || 'Payment cancelled or failed',
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn(`[Payment] Order ${orderId} not found: ${e.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Payment failure recorded',
      data: {
        orderId: orderId || null,
        paymentStatus: 'Failed',
        reason: error?.description || error?.reason || 'Transaction could not be completed',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return public Razorpay configuration (Public Key ID only)
 * GET /api/payment/razorpay/config
 */
const getPaymentConfig = (req, res) => {
  res.json({
    success: true,
    data: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      currency: 'INR',
      testMode: true,
      isConfigured: isRazorpayConfigured(),
    },
  });
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  getPaymentConfig,
};
