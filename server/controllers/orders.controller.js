const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');

const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
  }

  const enrichedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findByPk(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product not found: ${item.product}`,
      });
    }

    const chosenFormat = item.format || product.format;

    if (product.format !== chosenFormat && product.format !== 'both') {
      return res.status(400).json({
        success: false,
        message: `"${product.title}" is only available as ${product.format}, not ${chosenFormat}.`,
      });
    }

    const physicalStock = product.physicalBook?.stock ?? 0;
    if (chosenFormat === 'physical' && physicalStock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.title}". Available: ${physicalStock}`,
      });
    }

    const effectivePrice = product.discountPrice ?? product.price;
    enrichedItems.push({
      product: product.id,
      title: product.title,
      author: product.author,
      coverImage: product.coverImage,
      format: chosenFormat,
      price: parseFloat(effectivePrice),
      quantity: item.quantity,
      subtotal: parseFloat(effectivePrice) * item.quantity,
    });
    subtotal += parseFloat(effectivePrice) * item.quantity;
  }

  const hasPhysical = enrichedItems.some((i) => i.format === 'physical' || i.format === 'both');
  const shippingCost = hasPhysical ? 2000 : 0;
  const taxRate = 0.18;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + shippingCost + tax;

  const order = await Order.create({
    userId: req.user.id,
    items: enrichedItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    tax,
    total,
    notes,
  });

  for (const item of enrichedItems) {
    if (item.format === 'physical' || item.format === 'both') {
      const prod = await Product.findByPk(item.product);
      const pb = { ...prod.physicalBook };
      pb.stock = Math.max(0, (pb.stock || 0) - item.quantity);
      await Product.update({ physicalBook: pb }, { where: { id: item.product } });
    }
  }

  const productIds = enrichedItems.map((i) => i.product);
  const orderUser = await User.findByPk(req.user.id);
  const existing = orderUser.purchaseHistory || [];
  const merged = [...new Set([...existing, ...productIds])];
  await User.update({ purchaseHistory: merged }, { where: { id: req.user.id } });

  sendOrderConfirmationEmail(req.user.email, order).catch(console.error);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: order,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    }),
    Order.count({ where: { userId: req.user.id } }),
  ]);

  res.json({
    success: true,
    count: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: orders,
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  res.json({ success: true, data: order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const where = {};

  if (req.query.status) where.orderStatus = req.query.status;
  if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    }),
    Order.count({ where }),
  ]);

  res.json({
    success: true,
    count: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: orders,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const orderStatus = req.body.orderStatus || req.body.status;
  const { trackingNumber } = req.body;

  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === 'shipped') order.shippedAt = new Date();
  if (orderStatus === 'delivered') order.deliveredAt = new Date();
  if (orderStatus === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = req.body.cancelReason;
  }

  await order.save();

  res.json({ success: true, message: 'Order status updated.', data: order });
});

const downloadEbook = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params;
  const { generateSignedUrl } = require('../config/cloudinary');

  const order = await Order.findOne({
    where: { id: orderId, userId: req.user.id, paymentStatus: 'paid' },
  });

  if (!order) {
    return res.status(403).json({ success: false, message: 'Purchase not verified.' });
  }

  const orderItem = (order.items || []).find(
    (i) => i.product === productId &&
      (i.format === 'ebook' || i.format === 'both')
  );

  if (!orderItem) {
    return res.status(403).json({ success: false, message: 'Ebook not found in this order.' });
  }

  const product = await Product.findByPk(productId);
  if (!product?.ebook?.filePublicId) {
    return res.status(404).json({ success: false, message: 'Ebook file not available.' });
  }

  const signedUrl = generateSignedUrl(product.ebook.filePublicId, 3600);
  res.json({ success: true, downloadUrl: signedUrl, expiresIn: 3600 });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  downloadEbook,
};
