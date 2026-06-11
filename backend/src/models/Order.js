const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: String,
  author: String,
  coverImage: String,
  format: { type: String, enum: ['physical', 'ebook', 'both'] },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: Number,
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  province: String,
  country: { type: String, default: 'Rwanda' },
  postalCode: String,
  phone: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['mtn_momo', 'airtel_money', 'card', 'cod'],
    },
    hasEbooks: {
      type: Boolean,
      default: false,
    },
    ebooksDelivered: {
      type: Boolean,
      default: false,
    },
    notes: String,
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `BH-${timestamp}-${random}`;
  }

  // Calculate subtotals for items
  this.items = this.items.map((item) => ({
    ...item.toObject ? item.toObject() : item,
    subtotal: item.price * item.quantity,
  }));

  // Check if any item is an ebook
  this.hasEbooks = this.items.some((item) =>
    item.format === 'ebook' || item.format === 'both'
  );

  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
