const AppError = require('../utils/appError');

module.exports = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication is required', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Access denied. Administrator privileges required', 403));
  }

  next();
};
