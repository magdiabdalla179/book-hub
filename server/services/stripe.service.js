const Stripe = require('stripe');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  static async createPaymentIntent({ amount, currency, orderId, userId }) {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_your')) {
      return this._simulatePaymentIntent({ amount, orderId, userId });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'rwf',
      metadata: { orderId, userId },
      automatic_payment_methods: { enabled: true },
    });

    await Payment.create({
      orderId,
      userId,
      amount,
      currency: currency || 'RWF',
      paymentMethod: 'stripe',
      transactionId: paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
    };
  }

  static async confirmPaymentIntent(paymentIntentId) {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_your')) {
      return this._simulateConfirm(paymentIntentId);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await this._markSuccessful(paymentIntentId, paymentIntent.id);
      return { status: 'successful', message: 'Payment confirmed.' };
    }

    if (paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method') {
      await Payment.update(
        { status: 'failed', failureReason: paymentIntent.last_payment_error?.message || 'Payment cancelled.' },
        { where: { stripePaymentIntentId: paymentIntentId } }
      );
      return { status: 'failed', message: 'Payment was not successful.' };
    }

    return { status: 'pending', message: 'Payment is being processed.' };
  }

  static async handleWebhook(rawBody, signature) {
    if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_your')) {
      return { received: true };
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await this._markSuccessful(paymentIntent.id, paymentIntent.id);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      await Payment.update(
        { status: 'failed', failureReason: paymentIntent.last_payment_error?.message || 'Payment failed.' },
        { where: { stripePaymentIntentId: paymentIntent.id } }
      );
    }

    return { received: true };
  }

  static async _markSuccessful(paymentIntentId, transactionId) {
    const payment = await Payment.findOne({ where: { stripePaymentIntentId: paymentIntentId } });
    if (!payment) return;

    payment.status = 'successful';
    payment.paidAt = new Date();
    payment.transactionId = transactionId;
    await payment.save();

    await Order.update(
      { paymentStatus: 'paid', orderStatus: 'processing' },
      { where: { id: payment.orderId } }
    );
  }

  static async _simulatePaymentIntent({ amount, orderId, userId }) {
    const simId = `pi_sim_${Date.now()}`;

    await Payment.create({
      orderId,
      userId,
      amount,
      currency: 'RWF',
      paymentMethod: 'stripe',
      transactionId: simId,
      stripePaymentIntentId: simId,
      status: 'processing',
      isSimulated: true,
    });

    return {
      clientSecret: `${simId}_secret_simulated`,
      paymentIntentId: simId,
      amount,
      currency: 'RWF',
    };
  }

  static async _simulateConfirm(paymentIntentId) {
    await new Promise((r) => setTimeout(r, 1500));

    await Payment.update(
      { status: 'successful', paidAt: new Date() },
      { where: { stripePaymentIntentId: paymentIntentId } }
    );

    const payment = await Payment.findOne({ where: { stripePaymentIntentId: paymentIntentId } });
    if (payment) {
      await Order.update(
        { paymentStatus: 'paid', orderStatus: 'processing' },
        { where: { id: payment.orderId } }
      );
    }

    return { status: 'successful', message: 'Payment confirmed (simulated).' };
  }

  static async getPayment(paymentIntentId) {
    return Payment.findOne({ where: { stripePaymentIntentId: paymentIntentId } });
  }
}

module.exports = StripeService;
