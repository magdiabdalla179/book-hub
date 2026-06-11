const { asyncHandler } = require('../middleware/errorHandler');
const MTNMoMoService = require('../services/mtnMomo.service');
const AirtelMoneyService = require('../services/airtelMoney.service');
const Payment = require('../models/Payment');

// @desc    Initiate MTN MoMo payment
// @route   POST /api/payments/momo
// @access  Private
const initiateMomoPayment = asyncHandler(async (req, res) => {
  const { phoneNumber, orderId, amount } = req.body;

  if (!phoneNumber || !orderId || !amount) {
    return res.status(400).json({ success: false, message: 'phoneNumber, orderId, and amount are required.' });
  }

  const result = await MTNMoMoService.initiatePayment({
    phoneNumber,
    amount,
    orderId,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: result.message,
    transactionId: result.transactionId,
    status: result.status,
  });
});

// @desc    Check MTN MoMo payment status
// @route   GET /api/payments/momo/:transactionId/status
// @access  Private
const checkMomoStatus = asyncHandler(async (req, res) => {
  const result = await MTNMoMoService.checkPaymentStatus(req.params.transactionId);

  res.json({
    success: true,
    status: result.status,
    message: result.message,
    payment: result.payment,
  });
});

// @desc    Initiate Airtel Money payment
// @route   POST /api/payments/airtel
// @access  Private
const initiateAirtelPayment = asyncHandler(async (req, res) => {
  const { phoneNumber, orderId, amount } = req.body;

  if (!phoneNumber || !orderId || !amount) {
    return res.status(400).json({ success: false, message: 'phoneNumber, orderId, and amount are required.' });
  }

  const result = await AirtelMoneyService.initiatePayment({
    phoneNumber,
    amount,
    orderId,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: result.message,
    transactionId: result.transactionId,
    status: result.status,
  });
});

// @desc    Check Airtel Money payment status
// @route   GET /api/payments/airtel/:transactionId/status
// @access  Private
const checkAirtelStatus = asyncHandler(async (req, res) => {
  const result = await AirtelMoneyService.checkPaymentStatus(req.params.transactionId);

  res.json({
    success: true,
    status: result.status,
    message: result.message,
    payment: result.payment,
  });
});

// @desc    Get user payment history
// @route   GET /api/payments/my
// @access  Private
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('order', 'orderNumber total orderStatus')
    .sort('-createdAt')
    .limit(20);

  res.json({ success: true, count: payments.length, data: payments });
});

module.exports = {
  initiateMomoPayment,
  checkMomoStatus,
  initiateAirtelPayment,
  checkAirtelStatus,
  getMyPayments,
};
