const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

const getToken = (req) => {
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' ? token : null;
};

module.exports = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new AppError('Authentication is required', 401);

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new AppError('Your session is invalid or has expired', 401);
  }

  const user = await User.findById(payload.sub).select('+role +isActive +passwordChangedAt');
  if (!user || !user.isActive) throw new AppError('This account is unavailable', 401);
  if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw new AppError('Your password was changed. Please log in again', 401);
  }
  req.user = user;
  next();
});
