const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

/**
 * Trigger manual test email for Gmail SMTP verification
 * POST /api/email/test
 */
router.post('/test', async (req, res) => {
  const { to } = req.body;
  const result = await emailService.sendTestEmail(to);
  if (result.success) {
    res.json({
      success: true,
      message: 'Test email dispatched successfully',
      data: result,
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Failed to dispatch test email',
      error: result.error,
    });
  }
});

/**
 * Verify Gmail SMTP configuration status
 * GET /api/email/verify
 */
router.get('/verify', async (req, res) => {
  const result = await emailService.verifyConnection();
  if (result.success) {
    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } else {
    res.status(result.configured ? 502 : 400).json({
      success: false,
      message: result.error,
      data: result,
      error: result.error,
    });
  }
});

module.exports = router;
