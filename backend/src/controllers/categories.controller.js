const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, count: categories.length, data: categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, data: category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, message: 'Category deleted.' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
