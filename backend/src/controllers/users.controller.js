const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Wishlist = require('../models/Wishlist');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    [Admin] Get all users
// @route   GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.role) filter.role = req.query.role;
  if (req.query.suspended) filter.isSuspended = req.query.suspended === 'true';
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, count: users.length, total, page, totalPages: Math.ceil(total / limit), data: users });
});

// @desc    [Admin] Suspend or reactivate user
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot modify admin accounts.' });

  user.isSuspended = req.body.isSuspended;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: user.isSuspended ? 'User suspended.' : 'User reactivated.',
    data: user,
  });
});

// @desc    [Admin] Dashboard analytics
// @route   GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalOrders,
    totalProducts,
    revenueData,
    lastMonthRevenue,
    recentOrders,
    topProducts,
    monthlySales,
    ordersByStatus,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),

    // This month revenue
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // Last month revenue
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),

    // Recent 10 orders
    Order.find().populate('user', 'name email').sort('-createdAt').limit(10),

    // Top 5 selling products
    Product.find({ isActive: true }).sort('-salesCount').limit(5).select('title author coverImage salesCount ratingsAverage'),

    // Monthly sales for chart (last 6 months)
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Orders by status
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
  ]);

  const thisMonthRevenue = revenueData[0]?.total || 0;
  const prevMonthRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = prevMonthRevenue > 0
    ? (((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        monthlyRevenue: thisMonthRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
      },
      recentOrders,
      topProducts,
      monthlySales,
      ordersByStatus,
    },
  });
});

// @desc    Get/update wishlist
// @route   GET|POST|DELETE /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products.product', 'title author coverImage price discountPrice ratingsAverage format');
  res.json({ success: true, data: wishlist?.products || [] });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [{ product: productId }] });
    return res.json({ success: true, message: 'Added to wishlist.', action: 'added' });
  }

  const existsIndex = wishlist.products.findIndex(
    (p) => p.product.toString() === productId
  );

  if (existsIndex >= 0) {
    wishlist.products.splice(existsIndex, 1);
    await wishlist.save();
    return res.json({ success: true, message: 'Removed from wishlist.', action: 'removed' });
  }

  wishlist.products.push({ product: productId });
  await wishlist.save();
  res.json({ success: true, message: 'Added to wishlist.', action: 'added' });
});

module.exports = { getAllUsers, updateUserStatus, getAnalytics, getWishlist, toggleWishlist };
