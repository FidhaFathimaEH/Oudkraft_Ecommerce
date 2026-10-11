const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Handle MongoDB duplicate key error (code 11000) safely without crashing if keyValue is undefined
  if (err.code === 11000) {
    const field = (err.keyValue && Object.keys(err.keyValue)[0]) ||
                  (err.keyPattern && Object.keys(err.keyPattern)[0]) ||
                  'Field';
    error = new AppError(`${field} is already in use`, 409);
  } else if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path || 'identifier'} format`, 400);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new AppError('Your session is invalid or has expired', 401);
  } else if (!(error instanceof AppError)) {
    error = new AppError(err.message || 'Internal server error', err.statusCode || 500);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = error.statusCode || 500;

  // Mask internal 500 error messages in production to prevent information disclosure
  const clientMessage = (isProd && (!error.isOperational || statusCode >= 500))
    ? 'An unexpected error occurred. Please try again later.'
    : error.message || 'Internal server error';

  if (!error.isOperational || statusCode >= 500) {
    logger.error(`[Server Error] ${req.method} ${req.originalUrl}:`, error.stack || error.message);
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(error.details && { errors: error.details }),
    ...(!isProd && { stack: error.stack }),
  });
};

module.exports = errorHandler;
