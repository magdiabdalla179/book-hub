const express = require('express');
const router = express.Router();
const {
  initiateMomoPayment, checkMomoStatus,
  initiateAirtelPayment, checkAirtelStatus,
  createStripePaymentIntent, confirmStripePayment, getStripeConfig,
  getMyPayments,
} = require('../controllers/payments.controller');
const { protect } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.post('/momo', protect, paymentLimiter, initiateMomoPayment);
router.get('/momo/:transactionId/status', protect, checkMomoStatus);
router.post('/airtel', protect, paymentLimiter, initiateAirtelPayment);
router.get('/airtel/:transactionId/status', protect, checkAirtelStatus);

router.post('/stripe/create-intent', protect, paymentLimiter, createStripePaymentIntent);
router.post('/stripe/confirm', protect, confirmStripePayment);

router.get('/config/stripe', getStripeConfig);

router.get('/my', protect, getMyPayments);

module.exports = router;
