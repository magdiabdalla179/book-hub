const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Wishlist = require('../models/Wishlist');
const { asyncHandler } = require('../middleware/errorHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const where = {};

  if (req.query.role) where.role = req.query.role;
  if (req.query.suspended) where.isSuspended = req.query.suspended === 'true';
  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${req.query.search}%` } },
      { email: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }

  const [users, total] = await Promise.all([
    User.findAll({ where, order: [['createdAt', 'DESC']], offset: skip, limit }),
    User.count({ where }),
  ]);

  res.json({ success: true, count: users.length, total, page, totalPages: Math.ceil(total / limit), data: users });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot modify admin accounts.' });

  user.isSuspended = req.body.isSuspended;
  await user.save({ validate: false });

  res.json({
    success: true,
    message: user.isSuspended ? 'User suspended.' : 'User reactivated.',
    data: user,
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalOrders,
    totalProducts,
    thisMonthRevenue,
    lastMonthRevenue,
    recentOrders,
    topProducts,
    monthlySales,
    ordersByStatus,
  ] = await Promise.all([
    User.count({ where: { role: 'customer' } }),
    Order.count(),
    Product.count({ where: { isActive: true } }),
    Order.sum('total', {
      where: { paymentStatus: 'paid', createdAt: { [Op.gte]: startOfMonth } },
    }),
    Order.sum('total', {
      where: { paymentStatus: 'paid', createdAt: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth } },
    }),
    Order.findAll({ order: [['createdAt', 'DESC']], limit: 10 }),
    Product.findAll({
      where: { isActive: true },
      order: [['salesCount', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'author', 'coverImage', 'salesCount', 'ratingsAverage'],
    }),
    sequelize.query(`
      SELECT
        EXTRACT(YEAR FROM "createdAt")::int AS year,
        EXTRACT(MONTH FROM "createdAt")::int AS month,
        SUM("total") AS revenue,
        COUNT(*) AS orders
      FROM "Orders"
      WHERE "paymentStatus" = 'paid'
        AND "createdAt" >= :sixMonthsAgo
      GROUP BY year, month
      ORDER BY year, month
    `, {
      replacements: {
        sixMonthsAgo: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      },
      type: sequelize.QueryTypes.SELECT,
    }),
    sequelize.query(`
      SELECT "orderStatus" AS "_id", COUNT(*) AS count
      FROM "Orders"
      GROUP BY "orderStatus"
    `, {
      type: sequelize.QueryTypes.SELECT,
    }),
  ]);

  const prevMonthRevenue = lastMonthRevenue || 0;
  const revenueGrowth = prevMonthRevenue > 0
    ? ((((thisMonthRevenue || 0) - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        monthlyRevenue: thisMonthRevenue || 0,
        revenueGrowth: parseFloat(revenueGrowth),
      },
      recentOrders,
      topProducts,
      monthlySales,
      ordersByStatus,
    },
  });
});

const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Product,
      as: 'product',
      attributes: ['id', 'title', 'author', 'coverImage', 'price', 'discountPrice', 'ratingsAverage', 'format'],
    }],
    order: [['createdAt', 'DESC']],
  });

  const data = items.map((item) => {
    const p = item.product;
    return {
      _id: p.id,
      coverImage: p.coverImage,
      title: p.title,
      author: p.author,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      discountPrice: typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : p.discountPrice,
      ratingsAverage: p.ratingsAverage,
      format: p.format,
      addedAt: item.createdAt,
    };
  });

  res.json({ success: true, data });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const existing = await Wishlist.findOne({
    where: { userId: req.user.id, productId },
  });

  if (existing) {
    await existing.destroy();
    return res.json({ success: true, message: 'Removed from wishlist.', action: 'removed' });
  }

  await Wishlist.create({ userId: req.user.id, productId });
  res.json({ success: true, message: 'Added to wishlist.', action: 'added' });
});

module.exports = { getAllUsers, updateUserStatus, getAnalytics, getWishlist, toggleWishlist };
