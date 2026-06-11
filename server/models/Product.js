const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true },
  },
  slug: {
    type: DataTypes.STRING(220),
    unique: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  discountPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  format: {
    type: DataTypes.ENUM('physical', 'ebook', 'both'),
    allowNull: false,
  },
  physicalBook: {
    type: DataTypes.JSONB,
    defaultValue: { stock: 0, weight: null, shippingCost: null },
  },
  ebook: {
    type: DataTypes.JSONB,
    defaultValue: { fileUrl: null, filePublicId: null, fileSize: null, previewPages: null },
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coverImagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'English',
  },
  pages: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  publishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  bestSeller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  newArrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ratingsAverage: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: { min: 0, max: 5 },
  },
  ratingsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  salesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  aiSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'Products',
});

Product.beforeValidate((product) => {
  if (product.changed('title')) {
    product.slug = product.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+$/, '');
  }
});

module.exports = Product;
