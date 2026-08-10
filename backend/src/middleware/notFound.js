const AppError = require('../utils/appError');

module.exports = (req, res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
