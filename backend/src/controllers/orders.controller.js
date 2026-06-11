const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
  }

  // Validate & enrich items from database
  const enrichedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product not found: ${item.product}`,
      });
    }

    // Determine which format the user wants
    const chosenFormat = item.format || product.format;

    // Validate chosen format is available for this product
    if (product.format !== chosenFormat && product.format !== 'both') {
      return res.status(400).json({
        success: false,
        message: `"${product.title}" is only available as ${product.format}, not ${chosenFormat}.`,
      });
    }

    // Check stock for physical items
    const physicalStock = product.physicalBook?.stock ?? 0;
    if (chosenFormat === 'physical' && physicalStock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.title}". Available: ${physicalStock}`,
      });
    }

    const effectivePrice = product.discountPrice ?? product.price;
    enrichedItems.push({
      product: product._id,
      title: product.title,
      author: product.author,
      coverImage: product.coverImage,
      format: chosenFormat,
      price: effectivePrice,
      quantity: item.quantity,
      subtotal: effectivePrice * item.quantity,
    });
    subtotal += effectivePrice * item.quantity;
  }

  // Shipping calculation
  const hasPhysical = enrichedItems.some((i) => i.format === 'physical' || i.format === 'both');
  const shippingCost = hasPhysical ? 2000 : 0; // 2000 RWF for physical

  const taxRate = 0.18; // 18% VAT in Rwanda
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + shippingCost + tax;

  const order = await Order.create({
    user: req.user._id,
    items: enrichedItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    tax,
    total,
    notes,
  });

  // Deduct stock for physical items
  for (const item of enrichedItems) {
    if (item.format === 'physical' || item.format === 'both') {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'physicalBook.stock': -item.quantity },
      });
    }
  }

  // Update user purchase history
  const productIds = enrichedItems.map((i) => i.product);
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { purchaseHistory: { $each: productIds } },
  });

  // Send confirmation email (non-blocking)
  sendOrderConfirmationEmail(req.user.email, order).catch(console.error);

  await order.populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: order,
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: req.user._id }),
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Users can only see their own orders (admins can see all)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  res.json({ success: true, data: order });
});

// @desc    [Admin] Get all orders
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
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

// @desc    [Admin] Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

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

// @desc    Get ebook download URL for purchased book
// @route   GET /api/orders/:orderId/ebooks/:productId/download
// @access  Private
const downloadEbook = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params;
  const { generateSignedUrl } = require('../config/cloudinary');

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    paymentStatus: 'paid',
  });

  if (!order) {
    return res.status(403).json({ success: false, message: 'Purchase not verified.' });
  }

  const orderItem = order.items.find(
    (i) => i.product.toString() === productId &&
      (i.format === 'ebook' || i.format === 'both')
  );

  if (!orderItem) {
    return res.status(403).json({ success: false, message: 'Ebook not found in this order.' });
  }

  const product = await Product.findById(productId).select('+ebook.filePublicId');
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
