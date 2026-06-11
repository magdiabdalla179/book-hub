const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  shippingCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  orderStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hasEbooks: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ebooksDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'Orders',
});

Order.beforeCreate((order) => {
  if (!order.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    order.orderNumber = `BH-${timestamp}-${random}`;
  }

  order.items = (order.items || []).map((item) => ({
    ...item,
    subtotal: item.price * item.quantity,
  }));

  order.hasEbooks = (order.items || []).some((item) =>
    item.format === 'ebook' || item.format === 'both'
  );
});

module.exports = Order;
