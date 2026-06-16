const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const APIFeatures = require('../utils/apiFeatures');

const buildProductData = (body, files) => {
  const data = { ...body };

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

  if (body.category) data.categoryId = body.category;
  delete data.category;

  return data;
};

const getProducts = asyncHandler(async (req, res) => {
  const baseOptions = {
    where: { isActive: true },
    include: [{ model: Category, as: 'category', attributes: ['name', 'slug', 'icon'] }],
    distinct: true,
  };

  const features = new APIFeatures(baseOptions, req.query)
    .search(['title', 'author', 'description'])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const { count: total, rows: products } = await Product.findAndCountAll(features.queryOptions);

  res.json({
    success: true,
    count: products.length,
    total,
    page: features.page,
    totalPages: Math.ceil(total / features.limit),
    data: products,
  });
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${req.query.search}%` } },
      { author: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }
  if (req.query.format) {
    where.format = req.query.format;
  }
  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  if (req.query.isActive === undefined) {
    where.isActive = true;
  }

  const [products, total] = await Promise.all([
    Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      order: [[req.query.sort?.replace('-', '') || 'createdAt', req.query.sort?.startsWith('-') ? 'DESC' : 'ASC']],
      offset: skip,
      limit,
    }),
    Product.count({ where }),
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

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    where: { id: req.params.id, isActive: true },
    include: [{ model: Category, as: 'category', attributes: ['name', 'slug', 'icon'] }],
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const related = await Product.findAll({
    where: {
      categoryId: product.categoryId,
      id: { [Op.ne]: product.id },
      isActive: true,
    },
    limit: 6,
    attributes: ['id', 'title', 'author', 'coverImage', 'price', 'discountPrice', 'ratingsAverage', 'ratingsCount', 'format'],
  });

  res.json({ success: true, data: product, related });
});

const createProduct = asyncHandler(async (req, res) => {
  const productData = buildProductData(req.body, req.files);

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
  await Category.increment('productCount', { by: 1, where: { id: product.categoryId } });

  res.status(201).json({ success: true, message: 'Product created.', data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const updateData = buildProductData(req.body, req.files);

  if (req.files?.coverImage?.[0]) {
    if (product.coverImagePublicId) await deleteFromCloudinary(product.coverImagePublicId);
    const result = await uploadToCloudinary(req.files.coverImage[0].buffer, 'bookhub/covers');
    updateData.coverImage = result.secure_url;
    updateData.coverImagePublicId = result.public_id;
  }

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

  await Product.update(updateData, { where: { id: req.params.id } });
  product = await Product.findByPk(req.params.id, {
    include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
  });

  res.json({ success: true, message: 'Product updated.', data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  product.isActive = false;
  await product.save();
  await Category.increment('productCount', { by: -1, where: { id: product.categoryId } });

  res.json({ success: true, message: 'Product deleted.' });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const baseInclude = { model: Category, as: 'category', attributes: ['name'] };
  const baseAttrs = ['id', 'title', 'author', 'coverImage', 'price', 'discountPrice', 'ratingsAverage', 'ratingsCount', 'format', 'physicalBook', 'ebook'];

  const [featured, bestSellers, newArrivals] = await Promise.all([
    Product.findAll({
      where: { featured: true, isActive: true },
      include: [baseInclude],
      attributes: baseAttrs,
      limit: 8,
    }),
    Product.findAll({
      where: { bestSeller: true, isActive: true },
      order: [['salesCount', 'DESC']],
      include: [baseInclude],
      attributes: baseAttrs,
      limit: 8,
    }),
    Product.findAll({
      where: { newArrival: true, isActive: true },
      order: [['createdAt', 'DESC']],
      include: [baseInclude],
      attributes: baseAttrs,
      limit: 8,
    }),
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
