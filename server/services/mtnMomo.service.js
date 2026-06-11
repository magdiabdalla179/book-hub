const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

class MTNMoMoService {
  static validatePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const normalized = cleaned.startsWith('250') ? cleaned : `250${cleaned.replace(/^0/, '')}`;
    const mtnPrefixes = ['25078', '25079', '25077'];
    const isValid = mtnPrefixes.some((prefix) => normalized.startsWith(prefix)) && normalized.length === 12;
    return { isValid, normalized };
  }

  static async initiatePayment({ phoneNumber, amount, orderId, userId }) {
    const { isValid, normalized } = this.validatePhoneNumber(phoneNumber);

    if (!isValid) {
      throw new Error('Invalid MTN MoMo phone number. Use 078x, 079x, or 077x numbers.');
    }

    const transactionId = uuidv4();

    const payment = await Payment.create({
      orderId,
      userId,
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

    await Order.update({ paymentStatus: 'pending' }, { where: { id: orderId } });

    return {
      transactionId,
      status: 'pending',
      message: `Payment request sent to ${normalized}. Please check your phone and enter your MoMo PIN.`,
      payment,
    };
  }

  static async checkPaymentStatus(transactionId) {
    const payment = await Payment.findOne({ where: { transactionId } });

    if (!payment) {
      throw new Error('Transaction not found.');
    }

    if (payment.status === 'successful') {
      return { status: 'successful', payment };
    }

    if (payment.status === 'failed') {
      return { status: 'failed', payment };
    }

    const secondsElapsed = (Date.now() - payment.createdAt.getTime()) / 1000;

    if (secondsElapsed < 3) {
      return { status: 'pending', message: 'Waiting for customer to confirm payment...' };
    }

    const rand = Math.random();
    let newStatus;

    if (rand < 0.80) {
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
        financialTransactionId: `FT-${Date.now()}`,
        status: 'SUCCESSFUL',
        reason: 'Payment approved',
      };
      await payment.save();

      await Order.update(
        { paymentStatus: 'paid', orderStatus: 'processing' },
        { where: { id: payment.orderId } }
      );

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

  static async getPayment(transactionId) {
    return Payment.findOne({ where: { transactionId } });
  }
}

module.exports = MTNMoMoService;
