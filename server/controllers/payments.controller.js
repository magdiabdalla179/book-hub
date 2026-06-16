const { asyncHandler } = require('../middleware/errorHandler');
const MTNMoMoService = require('../services/mtnMomo.service');
const AirtelMoneyService = require('../services/airtelMoney.service');
const StripeService = require('../services/stripe.service');
const Payment = require('../models/Payment');

const initiateMomoPayment = asyncHandler(async (req, res) => {
  const { phoneNumber, orderId, amount } = req.body;

  if (!phoneNumber || !orderId || !amount) {
    return res.status(400).json({ success: false, message: 'phoneNumber, orderId, and amount are required.' });
  }

  const result = await MTNMoMoService.initiatePayment({
    phoneNumber,
    amount,
    orderId,
    userId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: result.message,
    transactionId: result.transactionId,
    status: result.status,
  });
});

const checkMomoStatus = asyncHandler(async (req, res) => {
  const result = await MTNMoMoService.checkPaymentStatus(req.params.transactionId);

  res.json({
    success: true,
    status: result.status,
    message: result.message,
    payment: result.payment,
  });
});

const initiateAirtelPayment = asyncHandler(async (req, res) => {
  const { phoneNumber, orderId, amount } = req.body;

  if (!phoneNumber || !orderId || !amount) {
    return res.status(400).json({ success: false, message: 'phoneNumber, orderId, and amount are required.' });
  }

  const result = await AirtelMoneyService.initiatePayment({
    phoneNumber,
    amount,
    orderId,
    userId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: result.message,
    transactionId: result.transactionId,
    status: result.status,
  });
});

const checkAirtelStatus = asyncHandler(async (req, res) => {
  const result = await AirtelMoneyService.checkPaymentStatus(req.params.transactionId);

  res.json({
    success: true,
    status: result.status,
    message: result.message,
    payment: result.payment,
  });
});

const createStripePaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ success: false, message: 'orderId and amount are required.' });
  }

  const result = await StripeService.createPaymentIntent({
    amount,
    orderId,
    userId: req.user.id,
  });

  res.status(201).json({
    success: true,
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
  });
});

const confirmStripePayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({ success: false, message: 'paymentIntentId is required.' });
  }

  const result = await StripeService.confirmPaymentIntent(paymentIntentId);

  res.json({
    success: result.status === 'successful',
    status: result.status,
    message: result.message,
  });
});

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const result = await StripeService.handleWebhook(req.body, sig);
  res.json(result);
});

const getStripeConfig = asyncHandler(async (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key',
  });
});

const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  res.json({ success: true, count: payments.length, data: payments });
});

module.exports = {
  initiateMomoPayment,
  checkMomoStatus,
  initiateAirtelPayment,
  checkAirtelStatus,
  createStripePaymentIntent,
  confirmStripePayment,
  handleStripeWebhook,
  getStripeConfig,
  getMyPayments,
};
