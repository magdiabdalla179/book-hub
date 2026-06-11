const Review = require('../models/Review');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
const getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: req.params.productId }),
  ]);

  res.json({ success: true, count: reviews.length, total, page, totalPages: Math.ceil(total / limit), data: reviews });
});

// @desc    Add review (must have purchased the book)
// @route   POST /api/products/:productId/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  // Check if already reviewed
  const existing = await Review.findOne({ user: req.user._id, product: req.params.productId });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this book.' });
  }

  // Check verified purchase
  const order = await Order.findOne({
    user: req.user._id,
    paymentStatus: 'paid',
    'items.product': req.params.productId,
  });

  const review = await Review.create({
    user: req.user._id,
    product: req.params.productId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!order,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, data: review });
});

// @desc    Update review
// @route   PUT /api/products/:productId/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  Object.assign(review, req.body);
  await review.save();
  res.json({ success: true, data: review });
});

// @desc    Delete review
// @route   DELETE /api/products/:productId/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    $or: [{ user: req.user._id }, { user: req.user.role === 'admin' ? { $exists: true } : req.user._id }],
  });

  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
  await review.remove();
  res.json({ success: true, message: 'Review deleted.' });
});

module.exports = { getProductReviews, addReview, updateReview, deleteReview };
