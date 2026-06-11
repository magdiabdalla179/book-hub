const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

/**
 * Simulate MTN MoMo Rwanda payment flow
 *
 * In production, this would:
 * 1. POST /v1_0/apiuser to create API user
 * 2. POST /v1_0/apiuser/{referenceId}/apikey to get API key
 * 3. POST /collection/token/ to get bearer token
 * 4. POST /collection/v1_0/requesttopay to initiate payment
 * 5. GET  /collection/v1_0/requesttopay/{referenceId} to poll status
 */
class MTNMoMoService {
  /**
   * Validate Rwanda phone number for MTN
   * Valid MTN Rwanda prefixes: 078, 079, 077
   */
  static validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('250') ? cleaned : `250${cleaned.replace(/^0/, '')}`;
    const mtnPrefixes = ['25078', '25079', '25077'];
    const isValid = mtnPrefixes.some((prefix) => normalized.startsWith(prefix)) && normalized.length === 12;
    return { isValid, normalized };
  }

  /**
   * Initiate payment request
   * @param {Object} params
   * @param {string} params.phoneNumber - Customer phone number
   * @param {number} params.amount - Amount in RWF
   * @param {string} params.orderId - Order ID for reference
   * @param {string} params.userId - User ID
   * @returns {Promise<Object>} Payment record
   */
  static async initiatePayment({ phoneNumber, amount, orderId, userId }) {
    const { isValid, normalized } = this.validatePhoneNumber(phoneNumber);

    if (!isValid) {
      throw new Error('Invalid MTN MoMo phone number. Use 078x, 079x, or 077x numbers.');
    }

    const transactionId = uuidv4();

    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount,
      currency: 'RWF',
      paymentMethod: 'mtn_momo',
      transactionId,
      phoneNumber: normalized,
      status: 'pending',
      isSimulated: true,
      providerResponse: {
        referenceId: transactionId,
        message: 'Payment request sent to mobile. Awaiting customer confirmation.',
        simulatedPhone: normalized,
      },
    });

    // Update order payment status
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'pending' });

    return {
      transactionId,
      status: 'pending',
      message: `Payment request sent to ${normalized}. Please check your phone and enter your MoMo PIN.`,
      payment,
    };
  }

  /**
   * Simulate checking payment status
   * In simulation mode: 80% success, 15% pending, 5% failed
   * After 3+ seconds from creation → resolve
   */
  static async checkPaymentStatus(transactionId) {
    const payment = await Payment.findOne({ transactionId }).populate('order');

    if (!payment) {
      throw new Error('Transaction not found.');
    }

    if (payment.status === 'successful') {
      return { status: 'successful', payment };
    }

    if (payment.status === 'failed') {
      return { status: 'failed', payment };
    }

    // Simulate processing time (must be 3+ seconds since creation)
    const secondsElapsed = (Date.now() - payment.createdAt.getTime()) / 1000;

    if (secondsElapsed < 3) {
      return { status: 'pending', message: 'Waiting for customer to confirm payment...' };
    }

    // Simulate outcome
    const rand = Math.random();
    let newStatus;

    if (rand < 0.80) {
      newStatus = 'successful';
    } else if (rand < 0.95) {
      newStatus = 'pending'; // Still processing
    } else {
      newStatus = 'failed';
    }

    if (newStatus === 'successful') {
      payment.status = 'successful';
      payment.paidAt = new Date();
      payment.providerResponse = {
        ...payment.providerResponse,
        financialTransactionId: `FT-${Date.now()}`,
        status: 'SUCCESSFUL',
        reason: 'Payment approved',
      };
      await payment.save();

      // Mark order as paid
      await Order.findByIdAndUpdate(payment.order._id, {
        paymentStatus: 'paid',
        orderStatus: 'processing',
      });

      return {
        status: 'successful',
        message: 'Payment confirmed! Your order is being processed.',
        payment,
      };
    }

    if (newStatus === 'failed') {
      payment.status = 'failed';
      payment.failureReason = 'Transaction declined by customer or insufficient funds.';
      payment.providerResponse = {
        ...payment.providerResponse,
        status: 'FAILED',
        reason: 'PAYER_REJECTED',
      };
      await payment.save();

      return {
        status: 'failed',
        message: 'Payment failed. Please try again.',
        payment,
      };
    }

    return { status: 'pending', message: 'Payment is being processed...' };
  }

  /**
   * Get payment details
   */
  static async getPayment(transactionId) {
    return Payment.findOne({ transactionId });
  }
}

module.exports = MTNMoMoService;
