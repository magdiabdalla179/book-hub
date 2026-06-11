const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, getAnalytics, getWishlist, toggleWishlist } = require('../controllers/users.controller');
const { protect, authorize } = require('../middleware/auth');

// Wishlist (any authenticated user)
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/toggle', protect, toggleWishlist);

// Admin only
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
