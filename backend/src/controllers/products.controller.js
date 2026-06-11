const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const APIFeatures = require('../utils/apiFeatures');

const formatValidation = {
  physical: {
    required: [],
    optional: ['physicalBook.stock', 'physicalBook.weight', 'physicalBook.shippingCost'],
    message: 'Physical book fields',
  },
  ebook: {
    required: [],
    optional: ['ebook.fileSize', 'ebook.previewPages'],
    message: 'E-book fields',
  },
  both: {
    required: [],
    optional: [
      'physicalBook.stock', 'physicalBook.weight', 'physicalBook.shippingCost',
      'ebook.fileSize', 'ebook.previewPages',
    ],
    message: 'Both format fields',
  },
};

const buildProductData = (body, files) => {
  const data = { ...body };

  // Map flat fields to nested sub-documents
  if (body.format === 'physical' || body.format === 'both') {
    data.physicalBook = {
      stock: body.physicalStock ?? body.stock ?? 0,
      weight: body.physicalWeight ?? body.weight ?? null,
      shippingCost: body.physicalShippingCost ?? body.shippingCost ?? null,
    };
  }
  if (body.format === 'ebook' || body.format === 'both') {
    data.ebook = {
      ...(data.ebook || {}),
      fileSize: body.ebookFileSize ?? body.fileSize ?? null,
      previewPages: body.ebookPreviewPages ?? body.previewPages ?? null,
    };
  }

  // Clean up old flat fields that might come from form
  delete data.stock;
  delete data.weight;
  delete data.shippingCost;
  delete data.fileSize;
  delete data.previewPages;
  delete data.physicalStock;
  delete data.physicalWeight;
  delete data.physicalShippingCost;
  delete data.ebookFileSize;
  delete data.ebookPreviewPages;

  return data;
};

// @desc    Get all products (public, active only)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const baseQuery = Product.find({ isActive: true }).populate('category', 'name slug icon');

  const features = new APIFeatures(baseQuery, req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;
  const total = await Product.countDocuments({ isActive: true });

  res.json({
    success: true,
    count: products.length,
    total,
    page: features.page,
    totalPages: Math.ceil(total / features.limit),
    data: products,
  });
});

// @desc    [Admin] Get all products including inactive
// @route   GET /api/admin/products
// @access  Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  if (req.query.format) {
    filter.format = req.query.format;
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true })
    .populate('category', 'name slug icon');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(6)
    .select('title author coverImage price discountPrice ratingsAverage ratingsCount format');

  res.json({ success: true, data: product, related });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const productData = buildProductData(req.body, req.files);

  // Handle file uploads
  if (req.files?.coverImage?.[0]) {
    const result = await uploadToCloudinary(req.files.coverImage[0].buffer, 'bookhub/covers');
    productData.coverImage = result.secure_url;
    productData.coverImagePublicId = result.public_id;
  }

  if (req.files?.ebookFile?.[0]) {
    const result = await uploadToCloudinary(req.files.ebookFile[0].buffer, 'bookhub/ebooks', {
      resource_type: 'raw',
      type: 'private',
    });
    productData.ebook = {
      ...(productData.ebook || {}),
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
    };
  }

  const product = await Product.create(productData);
  await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });

  res.status(201).json({ success: true, message: 'Product created.', data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const updateData = buildProductData(req.body, req.files);

  // Handle cover image upload
  if (req.files?.coverImage?.[0]) {
    if (product.coverImagePublicId) await deleteFromCloudinary(product.coverImagePublicId);
    const result = await uploadToCloudinary(req.files.coverImage[0].buffer, 'bookhub/covers');
    updateData.coverImage = result.secure_url;
    updateData.coverImagePublicId = result.public_id;
  }

  // Handle ebook file upload
  if (req.files?.ebookFile?.[0]) {
    if (product.ebook?.filePublicId) await deleteFromCloudinary(product.ebook.filePublicId);
    const result = await uploadToCloudinary(req.files.ebookFile[0].buffer, 'bookhub/ebooks', {
      resource_type: 'raw',
      type: 'private',
    });
    updateData.ebook = {
      ...(updateData.ebook || {}),
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
    };
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  res.json({ success: true, message: 'Product updated.', data: product });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  product.isActive = false;
  await product.save();
  await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });

  res.json({ success: true, message: 'Product deleted.' });
});

// @desc    Get featured/bestseller/new-arrival products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const [featured, bestSellers, newArrivals] = await Promise.all([
    Product.find({ featured: true, isActive: true })
      .limit(8)
      .populate('category', 'name')
      .select('title author coverImage price discountPrice ratingsAverage ratingsCount format physicalBook ebook'),
    Product.find({ bestSeller: true, isActive: true })
      .sort('-salesCount')
      .limit(8)
      .populate('category', 'name')
      .select('title author coverImage price discountPrice ratingsAverage ratingsCount format physicalBook ebook'),
    Product.find({ newArrival: true, isActive: true })
      .sort('-createdAt')
      .limit(8)
      .populate('category', 'name')
      .select('title author coverImage price discountPrice ratingsAverage ratingsCount format physicalBook ebook'),
  ]);

  res.json({ success: true, data: { featured, bestSellers, newArrivals } });
});

module.exports = {
  getProducts,
  getAdminProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
};
