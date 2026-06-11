const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, phone });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await user.save({ validate: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: user.toJSON(),
    accessToken,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.scope('withSensitive').findOne({ where: { email } });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validate: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    message: 'Login successful.',
    user: user.toJSON(),
    accessToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user) {
    user.refreshToken = null;
    await user.save({ validate: false });
  }
  clearTokenCookies(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided.' });
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.scope('withSensitive').findByPk(decoded.id);

  if (!user || user.refreshToken !== token) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }

  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  user.refreshToken = newRefreshToken;
  await user.save({ validate: false });

  setTokenCookies(res, newAccessToken, newRefreshToken);

  res.json({ success: true, accessToken: newAccessToken });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, you will receive a reset link shortly.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validate: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save({ validate: false });
    return res.status(500).json({ success: false, message: 'Failed to send reset email.' });
  }

  res.json({
    success: true,
    message: 'If that email exists, you will receive a reset link shortly.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.scope('withSensitive').findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  await User.update(updates, { where: { id: req.user.id } });
  const user = await User.findByPk(req.user.id);

  res.json({ success: true, user });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.scope('withSensitive').findByPk(req.user.id);

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully.' });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
};
