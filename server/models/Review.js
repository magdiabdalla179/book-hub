const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  helpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  helpfulVoters: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
  tableName: 'Reviews',
  indexes: [
    { unique: true, fields: ['userId', 'productId'] },
    { fields: ['productId'] },
  ],
});

module.exports = Review;
