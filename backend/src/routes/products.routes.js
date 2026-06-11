const express = require('express');
const router = express.Router();
const {
  getProducts, getAdminProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts
} = require('../controllers/products.controller');
const { getProductReviews, addReview, updateReview, deleteReview } = require('../controllers/reviews.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadBookFiles } = require('../middleware/upload');

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/admin/all', protect, authorize('admin'), getAdminProducts);
router.get('/:id', optionalAuth, getProduct);
router.post('/', protect, authorize('admin'), uploadBookFiles, createProduct);
router.put('/:id', protect, authorize('admin'), uploadBookFiles, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Reviews nested under products
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, addReview);
router.put('/:productId/reviews/:id', protect, updateReview);
router.delete('/:productId/reviews/:id', protect, deleteReview);

module.exports = router;
