const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [8, 128] },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatarPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer',
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  purchaseHistory: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  favoriteCategories: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  searchHistory: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'Users',
  defaultScope: {
    attributes: { exclude: ['password', 'refreshToken', 'resetPasswordToken', 'resetPasswordExpire'] },
  },
  scopes: {
    withSensitive: {
      attributes: { include: ['password', 'refreshToken', 'resetPasswordToken', 'resetPasswordExpire'] },
    },
  },
});

User.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.refreshToken;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpire;
  return values;
};

User.beforeSave(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, parseInt(process.env.SALT_ROUNDS) || 12);
  }
});

module.exports = User;
