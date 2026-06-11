const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'RWF',
    },
    paymentMethod: {
      type: String,
      enum: ['mtn_momo', 'airtel_money', 'card', 'cod'],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    providerReferenceId: String, // ID returned by payment provider
    phoneNumber: String, // Mobile money phone
    status: {
      type: String,
      enum: ['pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed, // Full provider API response stored
      default: null,
    },
    failureReason: String,
    attempts: {
      type: Number,
      default: 0,
    },
    paidAt: Date,
    refundedAt: Date,
    refundReason: String,
    // Simulation fields
    isSimulated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
