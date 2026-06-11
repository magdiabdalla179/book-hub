const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  slug: {
    type: DataTypes.STRING(60),
    unique: true,
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📚',
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  productCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'Categories',
});

Category.beforeValidate((category) => {
  if (category.changed('name')) {
    category.slug = category.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
});

module.exports = Category;
