const express = require('express');
const router = express.Router();
const {
  getOverview,
  getFeedback,
  getReturns,
} = require('../controllers/analyticsController');

router.get('/overview', getOverview);
router.get('/feedback', getFeedback);
router.get('/returns', getReturns);

module.exports = router;
