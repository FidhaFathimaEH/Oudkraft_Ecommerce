const AppError = require('../utils/appError');

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return next(new AppError('Administrator access is required', 403));
  next();
};
