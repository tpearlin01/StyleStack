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

module.exports = router;
