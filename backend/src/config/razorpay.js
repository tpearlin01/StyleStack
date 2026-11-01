const Razorpay = require('razorpay');

let razorpayInstance = null;

const isRazorpayConfigured = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(keyId && keySecret && keyId.trim() && keySecret.trim());
};

const getRazorpayInstance = () => {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.log('[Razorpay Config] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Operating in Test / Mock fallback mode.');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId.trim(),
      key_secret: keySecret.trim(),
    });
    console.log('[Razorpay Config] Razorpay SDK initialized successfully with Key ID:', keyId.substring(0, 8) + '...');
    return razorpayInstance;
  } catch (error) {
    console.error('[Razorpay Config] Failed to initialize Razorpay SDK:', error.message);
    return null;
  }
};

module.exports = {
  getRazorpayInstance,
  isRazorpayConfigured,
};
