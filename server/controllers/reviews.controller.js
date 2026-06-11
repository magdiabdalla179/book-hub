const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.findAll({
      where: { productId: req.params.productId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit,
    }),
    Review.count({ where: { productId: req.params.productId } }),
  ]);

  res.json({ success: true, count: reviews.length, total, page, totalPages: Math.ceil(total / limit), data: reviews });
});

const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  const existing = await Review.findOne({
    where: { userId: req.user.id, productId: req.params.productId },
  });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this book.' });
  }

  const order = await Order.findOne({
    where: {
      userId: req.user.id,
      paymentStatus: 'paid',
      [Op.and]: sequelize.where(
        sequelize.literal(`items @> '[{"product": "${req.params.productId}"}]'`),
        true
      ),
    },
  });

  const review = await Review.create({
    userId: req.user.id,
    productId: req.params.productId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!order,
  });

  const populated = await Review.findByPk(review.id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
  });

  await updateProductRatings(req.params.productId);

  res.status(201).json({ success: true, data: populated });
});

const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  await review.update(req.body);
  await updateProductRatings(review.productId);

  res.json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const productId = review.productId;
  await review.destroy();
  await updateProductRatings(productId);

  res.json({ success: true, message: 'Review deleted.' });
});

async function updateProductRatings(productId) {
  const [result] = await sequelize.query(`
    SELECT COUNT(*)::int AS "numReviews", COALESCE(AVG(rating), 0)::float AS "avgRating"
    FROM "Reviews"
    WHERE "productId" = :productId
  `, {
    replacements: { productId },
    type: sequelize.QueryTypes.SELECT,
  });

  await Product.update(
    {
      ratingsCount: result.numReviews,
      ratingsAverage: Math.round(result.avgRating * 10) / 10,
    },
    { where: { id: productId } }
  );
}

module.exports = { getProductReviews, addReview, updateReview, deleteReview };
