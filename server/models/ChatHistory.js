const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatHistory = sequelize.define('ChatHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: 'New Conversation',
  },
  messages: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  context: {
    type: DataTypes.ENUM('general', 'support', 'recommendations', 'summary'),
    defaultValue: 'general',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'ChatHistories',
});

module.exports = ChatHistory;
