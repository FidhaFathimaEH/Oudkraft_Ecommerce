const AppError = require('../utils/appError');

const errorHandler = (err, req, res, _next) => {
  let error = err;
  if (err.code === 11000) error = new AppError(`${Object.keys(err.keyValue)[0]} is already in use`, 409);
  else if (!(error instanceof AppError)) error = new AppError(err.message || 'Internal server error', err.statusCode || 500);

  if (!error.isOperational) console.error(error.stack);
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details && { errors: error.details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
