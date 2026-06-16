const express = require('express');
const router = express.Router();
const {
  initiateMomoPayment, checkMomoStatus,
  initiateAirtelPayment, checkAirtelStatus, getMyPayments
} = require('../controllers/payments.controller');
const { protect } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.post('/momo', protect, paymentLimiter, initiateMomoPayment);
router.get('/momo/:transactionId/status', protect, checkMomoStatus);
router.post('/airtel', protect, paymentLimiter, initiateAirtelPayment);
router.get('/airtel/:transactionId/status', protect, checkAirtelStatus);
router.get('/my', protect, getMyPayments);

module.exports = router;
