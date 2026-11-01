try {
  require('dotenv').config();
} catch (e) {
  // Ignore in environments where dotenv is already loaded
}

const nodemailer = require('nodemailer');

// In-memory deduplication set to prevent duplicate email transmissions
const sentEmailKeys = new Set();

let cachedTransporter = null;

/**
 * Strips outer quotes and surrounding whitespace
 */
const sanitizeCredential = (val) => {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
};

/**
 * Strips outer quotes and removes all internal whitespace.
 * Google App Passwords are 16 characters shown in 4x4 groups (e.g. "abcd efgh ijkl mnop").
 * Stripping whitespace ensures Nodemailer transmits the continuous 16-character string.
 */
const sanitizePassword = (val) => {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, '');
};

/**
 * Detects whether an email or password is an unconfigured placeholder.
 */
const isPlaceholder = (val) => {
  if (!val || typeof val !== 'string') return true;
  const clean = val.trim().toLowerCase();
  return (
    !clean ||
    clean.includes('your_') ||
    clean.includes('your-') ||
    clean.includes('example.com') ||
    clean === 'your_gmail@gmail.com' ||
    clean === 'your_actual_app_password'
  );
};

const getSenderAddress = () => {
  const cleanUser = sanitizeCredential(process.env.EMAIL_USER);
  return cleanUser || 'no-reply@stylestack.com';
};

/**
 * Returns a configured Nodemailer transporter for Gmail SMTP, or null if credentials are not configured.
 */
const getTransporter = () => {
  const user = sanitizeCredential(process.env.EMAIL_USER);
  const pass = sanitizePassword(process.env.EMAIL_APP_PASSWORD);

  if (isPlaceholder(user) || isPlaceholder(pass)) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  try {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
    return cachedTransporter;
  } catch (err) {
    console.error('[EmailService] Transporter initialization error:', err.message);
    return null;
  }
};

/**
 * Reset transporter cache (useful when environment variables are injected or in tests).
 */
const resetTransporter = () => {
  cachedTransporter = null;
};

/**
 * Send an Order Confirmation Email upon successful order placement.
 * Safe execution: never throws or disrupts order flow if email fails.
 */
const sendOrderConfirmationEmail = async (order) => {
  if (!order) {
    return { success: false, error: 'No order provided' };
  }

  const orderId = order.id || order.orderId || 'UNKNOWN';
  const dedupKey = `order_confirmation:${orderId}`;

  // Deduplication check
  if (sentEmailKeys.has(dedupKey) || order.orderConfirmationEmailSent) {
    console.log(`[EmailService] Duplicate order confirmation email skipped for Order ${orderId}`);
    return { success: true, skipped: true, message: 'Duplicate email prevented' };
  }

  const recipientEmail =
    order.customerEmail ||
    (order.customer && order.customer.email) ||
    '';

  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn(`[EmailService] Invalid recipient email for Order ${orderId}: "${recipientEmail}"`);
    return { success: false, error: 'Missing or invalid recipient email' };
  }

  const customerName =
    order.customerName ||
    (order.customer && order.customer.name) ||
    'Valued Customer';

  const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));
  const totalAmount = Number(order.totalAmount !== undefined ? order.totalAmount : (order.total || 0)).toFixed(2);
  const subtotal = Number(order.subtotal || 0).toFixed(2);
  const gstAmount = Number(order.gstAmount !== undefined ? order.gstAmount : (order.taxAmount || 0)).toFixed(2);
  const shippingFee = Number(order.shippingFee || 0).toFixed(2);
  const items = Array.isArray(order.items) ? order.items : [];
  const paymentMethod = order.paymentMethod || (order.customer && order.customer.paymentMethod) || 'Cash on Delivery';
  const shippingAddress = order.shippingAddress || (order.customer && order.customer.address) || 'Standard Shipping Address';

  // Construct item rows for HTML
  const itemRowsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 12px 8px; color: #f4f4f5; font-size: 13px;">
          <strong>${item.name || 'Apparel Item'}</strong>
          <br/>
          <span style="font-size: 11px; color: #a1a1aa;">Size: ${item.size || item.selectedSize || 'Standard'} | Qty: ${item.quantity || 1}</span>
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #f4f4f5; font-size: 13px; font-family: monospace;">
          ₹${(Number(item.price !== undefined ? item.price : (item.unitPrice || 0)) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  const itemsListText = items
    .map((item) => `- ${item.name} (${item.size || 'M'}) x ${item.quantity || 1} = ₹${(Number(item.price || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}`)
    .join('\n');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Order Confirmation #${orderId}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px;">
      <table align="center" width="100%" max-width="600" style="max-width: 600px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; padding: 0; border-spacing: 0;">
        <tr>
          <td style="background-color: #09090b; padding: 24px; border-bottom: 1px solid #27272a; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 2px;">STYLE<span style="color: #e11d48;">STACK</span></h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1.5px;">Luxury Apparel &amp; Fashion</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px;">
            <div style="background-color: #e11d48/10; border-left: 4px solid #e11d48; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
              <h2 style="margin: 0; color: #ffffff; font-size: 18px;">Order Confirmed!</h2>
              <p style="margin: 4px 0 0 0; color: #a1a1aa; font-size: 13px;">Thank you for shopping with StyleStack, ${customerName}.</p>
            </div>

            <table width="100%" style="margin-bottom: 24px; font-size: 13px; color: #a1a1aa;">
              <tr>
                <td><strong>Order ID:</strong> <span style="font-family: monospace; color: #ffffff;">#${orderId}</span></td>
                <td style="text-align: right;"><strong>Date:</strong> ${orderDate}</td>
              </tr>
              <tr>
                <td><strong>Payment Method:</strong> ${paymentMethod}</td>
                <td style="text-align: right;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Placed</span></td>
              </tr>
            </table>

            <h3 style="font-size: 14px; text-transform: uppercase; color: #d4d4d8; border-bottom: 1px solid #27272a; padding-bottom: 8px; margin-bottom: 12px;">Order Summary</h3>
            <table width="100%" style="border-collapse: collapse; margin-bottom: 20px;">
              ${itemRowsHtml}
            </table>

            <table width="100%" style="font-size: 13px; color: #a1a1aa; border-top: 1px solid #27272a; padding-top: 12px;">
              <tr>
                <td style="padding: 4px 0;">Subtotal</td>
                <td style="text-align: right; color: #ffffff; font-family: monospace;">₹${Number(subtotal).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">GST (5%)</td>
                <td style="text-align: right; color: #ffffff; font-family: monospace;">₹${Number(gstAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Shipping</td>
                <td style="text-align: right; color: #10b981; font-weight: bold;">FREE</td>
              </tr>
              <tr style="border-top: 1px solid #27272a; font-size: 16px; font-weight: bold;">
                <td style="padding: 12px 0; color: #ffffff;">Total Amount</td>
                <td style="text-align: right; color: #e11d48; font-family: monospace;">₹${Number(totalAmount).toLocaleString('en-IN')}</td>
              </tr>
            </table>

            <div style="background-color: #09090b; padding: 16px; border-radius: 12px; margin-top: 24px; border: 1px solid #27272a;">
              <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #d4d4d8; text-transform: uppercase;">Shipping To:</h4>
              <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.5;">${shippingAddress}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: #09090b; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a;">
            <p style="margin: 0;">StyleStack Fashion Private Limited &bull; Handcrafted Couture &bull; India</p>
            <p style="margin: 4px 0 0 0;">Need help? Reply directly to this email or visit our Help Center.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const plainText = `
StyleStack - Order Confirmation
Order ID: #${orderId}
Order Date: ${orderDate}
Customer: ${customerName}
Delivery Address: ${shippingAddress}
Payment Method: ${paymentMethod}

Items:
${itemsListText}

Subtotal: ₹${subtotal}
GST (5%): ₹${gstAmount}
Shipping: ₹${shippingFee}
Total Amount: ₹${totalAmount}

Thank you for shopping with StyleStack!
  `.trim();

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[EmailService] Mock mode: EMAIL_USER/EMAIL_APP_PASSWORD contains unconfigured placeholder in backend/.env. Order confirmation email simulated for ${recipientEmail}.`);
    sentEmailKeys.add(dedupKey);
    order.orderConfirmationEmailSent = true;
    return {
      success: true,
      simulated: true,
      message: 'Email credentials not configured. Email simulated in test/fallback mode.',
      orderId,
      recipient: recipientEmail,
    };
  }

  try {
    const sender = getSenderAddress();
    const info = await transporter.sendMail({
      from: `"StyleStack Fashion" <${sender}>`,
      to: recipientEmail,
      subject: `Order Confirmation #${orderId} - StyleStack`,
      text: plainText,
      html: htmlContent,
    });

    console.log(`[EmailService] Order confirmation email sent to ${recipientEmail} (MessageId: ${info.messageId})`);
    sentEmailKeys.add(dedupKey);
    order.orderConfirmationEmailSent = true;
    return {
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail,
    };
  } catch (error) {
    console.error(`[EmailService] Failed to transmit order confirmation email to ${recipientEmail}:`, error.message);
    // Never throw! Order must not be lost
    return {
      success: false,
      error: error.message,
      recipient: recipientEmail,
    };
  }
};

/**
 * Send a Payment Confirmation Email after successful Razorpay verification.
 * Safe execution: never throws or disrupts order flow.
 */
const sendPaymentConfirmationEmail = async (order, paymentDetails = {}) => {
  if (!order) {
    return { success: false, error: 'No order provided' };
  }

  const orderId = order.id || order.orderId || 'UNKNOWN';
  const paymentId = paymentDetails.paymentId || paymentDetails.transactionId || order.transactionId || `TXN-${Date.now()}`;
  const dedupKey = `payment_confirmation:${orderId}:${paymentId}`;

  // Deduplication check
  if (sentEmailKeys.has(dedupKey) || order.paymentConfirmationEmailSent) {
    console.log(`[EmailService] Duplicate payment confirmation email skipped for Order ${orderId} / Payment ${paymentId}`);
    return { success: true, skipped: true, message: 'Duplicate payment email prevented' };
  }

  const recipientEmail =
    order.customerEmail ||
    (order.customer && order.customer.email) ||
    paymentDetails.email ||
    '';

  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn(`[EmailService] Invalid recipient email for Payment Confirmation ${orderId}: "${recipientEmail}"`);
    return { success: false, error: 'Missing or invalid recipient email' };
  }

  const customerName =
    order.customerName ||
    (order.customer && order.customer.name) ||
    'Valued Customer';

  const totalAmount = Number(order.totalAmount !== undefined ? order.totalAmount : (order.total || 0)).toFixed(2);
  const paymentStatus = paymentDetails.status || order.paymentStatus || 'Paid';
  const paymentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Payment Receipt #${orderId}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px;">
      <table align="center" width="100%" max-width="600" style="max-width: 600px; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; padding: 0; border-spacing: 0;">
        <tr>
          <td style="background-color: #09090b; padding: 24px; border-bottom: 1px solid #27272a; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 2px;">STYLE<span style="color: #e11d48;">STACK</span></h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1.5px;">Official Payment Receipt</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px;">
            <div style="background-color: #10b981/10; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
              <h2 style="margin: 0; color: #10b981; font-size: 18px;">Payment Successful &amp; Verified</h2>
              <p style="margin: 4px 0 0 0; color: #a1a1aa; font-size: 13px;">Your online payment was successfully verified and confirmed.</p>
            </div>

            <div style="text-align: center; margin: 24px 0; background-color: #09090b; padding: 20px; border-radius: 12px; border: 1px solid #27272a;">
              <span style="font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</span>
              <div style="font-size: 32px; font-weight: bold; color: #ffffff; font-family: monospace; margin: 6px 0;">₹${Number(totalAmount).toLocaleString('en-IN')}</div>
              <span style="display: inline-block; background-color: #10b981/20; color: #34d399; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px;">
                STATUS: ${paymentStatus.toUpperCase()}
              </span>
            </div>

            <table width="100%" style="font-size: 13px; color: #a1a1aa; border-top: 1px solid #27272a; padding-top: 16px;">
              <tr>
                <td style="padding: 6px 0;"><strong>Order Reference:</strong></td>
                <td style="text-align: right; color: #ffffff; font-family: monospace;">#${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Transaction ID:</strong></td>
                <td style="text-align: right; color: #ffffff; font-family: monospace;">${paymentId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Payment Date:</strong></td>
                <td style="text-align: right; color: #ffffff;">${paymentDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Payment Method:</strong></td>
                <td style="text-align: right; color: #ffffff;">${order.paymentMethod || 'Online Payment'}</td>
              </tr>
            </table>

            <p style="font-size: 12px; color: #71717a; margin-top: 24px; text-align: center;">
              This transaction was authenticated and processed securely.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #09090b; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a;">
            <p style="margin: 0;">StyleStack Fashion Private Limited &bull; Verified Online Checkout</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const plainText = `
StyleStack - Payment Receipt
Order ID: #${orderId}
Transaction ID: ${paymentId}
Payment Status: ${paymentStatus}
Date: ${paymentDate}
Total Amount: ₹${totalAmount}
Payment Method: ${order.paymentMethod || 'Online Payment'}

Your payment has been successfully verified and confirmed.
Thank you for shopping with StyleStack!
  `.trim();

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[EmailService] Mock mode: EMAIL_USER/EMAIL_APP_PASSWORD contains unconfigured placeholder in backend/.env. Payment confirmation email simulated for ${recipientEmail}.`);
    sentEmailKeys.add(dedupKey);
    order.paymentConfirmationEmailSent = true;
    return {
      success: true,
      simulated: true,
      message: 'Email credentials not configured. Payment confirmation email simulated in test/fallback mode.',
      orderId,
      paymentId,
      recipient: recipientEmail,
    };
  }

  try {
    const sender = getSenderAddress();
    const info = await transporter.sendMail({
      from: `"StyleStack Fashion" <${sender}>`,
      to: recipientEmail,
      subject: `Payment Confirmed #${orderId} - StyleStack (Ref: ${paymentId})`,
      text: plainText,
      html: htmlContent,
    });

    console.log(`[EmailService] Payment confirmation email sent to ${recipientEmail} (MessageId: ${info.messageId})`);
    sentEmailKeys.add(dedupKey);
    order.paymentConfirmationEmailSent = true;
    return {
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail,
    };
  } catch (error) {
    console.error(`[EmailService] Failed to transmit payment confirmation email to ${recipientEmail}:`, error.message);
    return {
      success: false,
      error: error.message,
      recipient: recipientEmail,
    };
  }
};

/**
 * Send a verification/test email (used to verify Gmail SMTP configuration).
 */
const sendTestEmail = async (to) => {
  const sender = getSenderAddress();
  const targetEmail = to || sender;
  if (!targetEmail) {
    return { success: false, error: 'Recipient email required' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      error: 'Gmail SMTP credentials (EMAIL_USER, EMAIL_APP_PASSWORD) not configured.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"StyleStack Fashion" <${sender}>`,
      to: targetEmail,
      subject: 'StyleStack Gmail SMTP Test Notification',
      text: 'Congratulations! Your StyleStack Nodemailer Gmail SMTP integration is functioning perfectly.',
      html: '<p style="font-family:sans-serif; color:#e11d48; font-weight:bold;">StyleStack Gmail SMTP is properly configured and operational!</p>',
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient: targetEmail,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verifies SMTP connection and credentials without sending an email.
 */
const verifyConnection = async () => {
  const rawUser = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_APP_PASSWORD;
  const cleanUser = sanitizeCredential(rawUser);
  const cleanPass = sanitizePassword(rawPass);

  if (isPlaceholder(cleanUser) || isPlaceholder(cleanPass)) {
    return {
      success: false,
      configured: false,
      error: 'Gmail SMTP credentials (EMAIL_USER, EMAIL_APP_PASSWORD) not configured or using default placeholders in backend/.env.',
    };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      configured: false,
      error: 'Could not initialize Gmail SMTP transporter.',
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      configured: true,
      message: 'Gmail SMTP connection verified successfully and ready to dispatch emails.',
    };
  } catch (err) {
    return {
      success: false,
      configured: true,
      error: err.message,
    };
  }
};

module.exports = {
  getTransporter,
  resetTransporter,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendTestEmail,
  verifyConnection,
  sanitizeCredential,
  sanitizePassword,
  isPlaceholder,
  getSenderAddress,
  _sentEmailKeys: sentEmailKeys,
};
