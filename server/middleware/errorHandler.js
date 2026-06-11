const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, BaseError } = require('sequelize');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  }

  if (err instanceof ValidationError) {
    error.message = err.errors.map((e) => e.message).join(', ');
    error.statusCode = 400;
  }

  if (err instanceof UniqueConstraintError) {
    const field = err.fields ? Object.keys(err.fields)[0] : 'field';
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    error.statusCode = 409;
  }

  if (err instanceof ForeignKeyConstraintError) {
    error.message = 'Referenced record not found.';
    error.statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token.';
    error.statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired.';
    error.statusCode = 401;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large. Maximum size is 10MB.';
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
