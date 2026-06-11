const jwt = require('jsonwebtoken');

/**
 * Generate access token (short-lived)
 * @param {string} id - User ID
 * @returns {string} JWT access token
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

/**
 * Generate refresh token (long-lived)
 * @param {string} id - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

/**
 * Set JWT tokens as HTTP-only cookies
 * @param {Object} res - Express response object
 * @param {string} accessToken
 * @param {string} refreshToken
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clear auth cookies on logout
 * @param {Object} res - Express response object
 */
const clearTokenCookies = (res) => {
  res.cookie('accessToken', '', { maxAge: 0, httpOnly: true });
  res.cookie('refreshToken', '', { maxAge: 0, httpOnly: true });
};

module.exports = { generateAccessToken, generateRefreshToken, setTokenCookies, clearTokenCookies };
