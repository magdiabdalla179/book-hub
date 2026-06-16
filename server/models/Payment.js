const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'RWF',
  },
  paymentMethod: {
    type: DataTypes.ENUM('mtn_momo', 'airtel_money', 'card', 'cod'),
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  providerReferenceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  providerResponse: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  failureReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refundReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isSimulated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'Payments',
});

module.exports = Payment;
