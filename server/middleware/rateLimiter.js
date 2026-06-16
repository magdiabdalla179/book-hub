const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
  });

// General API limiter
const apiLimiter = createLimiter(
  15 * 60 * 1000, // 15 min
  200,
  'Too many requests from this IP, please try again after 15 minutes.'
);

// Auth limiter (stricter)
const authLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  'Too many login attempts, please try again after 15 minutes.'
);

// AI limiter (expensive requests)
const aiLimiter = createLimiter(
  60 * 1000, // 1 min
  20,
  'Too many AI requests. Please slow down.'
);

// Payment limiter
const paymentLimiter = createLimiter(
  60 * 1000,
  5,
  'Too many payment requests. Please wait a moment.'
);

module.exports = { apiLimiter, authLimiter, aiLimiter, paymentLimiter };
