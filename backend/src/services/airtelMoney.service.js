const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

/**
 * Simulate Airtel Money Rwanda payment flow
 *
 * In production, this would integrate with:
 * https://openapi.airtel.africa/
 * - POST /auth/oauth2/token → Bearer token
 * - POST /merchant/v1/payments/ → Initiate charge
 * - GET  /standard/v1/payments/{id} → Check status
 */
class AirtelMoneyService {
  /**
   * Validate Rwanda phone number for Airtel
   * Valid Airtel Rwanda prefixes: 073, 072
   */
  static validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('250') ? cleaned : `250${cleaned.replace(/^0/, '')}`;
    const airtelPrefixes = ['25073', '25072'];
    const isValid = airtelPrefixes.some((prefix) => normalized.startsWith(prefix)) && normalized.length === 12;
    return { isValid, normalized };
  }

  /**
   * Initiate Airtel Money payment
   */
  static async initiatePayment({ phoneNumber, amount, orderId, userId }) {
    const { isValid, normalized } = this.validatePhoneNumber(phoneNumber);

    if (!isValid) {
      throw new Error('Invalid Airtel Money phone number. Use 072x or 073x numbers.');
    }

    const transactionId = `AIR-${uuidv4()}`;

    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount,
      currency: 'RWF',
      paymentMethod: 'airtel_money',
      transactionId,
      phoneNumber: normalized,
      status: 'pending',
      isSimulated: true,
      providerResponse: {
        transactionId,
        message: 'Airtel Money request sent. Please check your phone and authorize payment.',
        network: 'AIRTEL_RW',
      },
    });

    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'pending' });

    return {
      transactionId,
      status: 'pending',
      message: `Airtel Money request sent to ${normalized}. Please check your phone and enter your PIN.`,
      payment,
    };
  }

  /**
   * Simulate checking Airtel payment status
   * 75% success, 20% pending, 5% failed
   */
  static async checkPaymentStatus(transactionId) {
    const payment = await Payment.findOne({ transactionId }).populate('order');

    if (!payment) {
      throw new Error('Transaction not found.');
    }

    if (payment.status === 'successful' || payment.status === 'failed') {
      return { status: payment.status, payment };
    }

    const secondsElapsed = (Date.now() - payment.createdAt.getTime()) / 1000;

    if (secondsElapsed < 5) {
      return { status: 'pending', message: 'Awaiting authorization from customer...' };
    }

    const rand = Math.random();
    let newStatus;

    if (rand < 0.75) {
      newStatus = 'successful';
    } else if (rand < 0.95) {
      newStatus = 'pending';
    } else {
      newStatus = 'failed';
    }

    if (newStatus === 'successful') {
      payment.status = 'successful';
      payment.paidAt = new Date();
      payment.providerResponse = {
        ...payment.providerResponse,
        airtelTransactionId: `AT${Date.now()}`,
        status: 'TS',
        message: 'Transaction successful',
      };
      await payment.save();

      await Order.findByIdAndUpdate(payment.order._id, {
        paymentStatus: 'paid',
        orderStatus: 'processing',
      });

      return {
        status: 'successful',
        message: 'Airtel Money payment confirmed!',
        payment,
      };
    }

    if (newStatus === 'failed') {
      payment.status = 'failed';
      payment.failureReason = 'Transaction declined. Insufficient Airtel Money balance or user cancelled.';
      payment.providerResponse = {
        ...payment.providerResponse,
        status: 'TF',
        message: 'Transaction Failed',
      };
      await payment.save();

      return {
        status: 'failed',
        message: 'Airtel Money payment failed. Please try again.',
        payment,
      };
    }

    return { status: 'pending', message: 'Payment processing...' };
  }
}

module.exports = AirtelMoneyService;
