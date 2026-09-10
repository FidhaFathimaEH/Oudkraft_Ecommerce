const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { jwtSecret, jwtExpiresIn, nodeEnv } = require('../config/env');

const createToken = (userId) => jwt.sign({ sub: userId.toString() }, jwtSecret, { expiresIn: jwtExpiresIn });
const cookieOptions = (token) => ({
  httpOnly: true,
  secure: nodeEnv === 'production',
  sameSite: nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: (jwt.decode(token).exp * 1000) - Date.now(),
  path: '/',
});
const sendAuthenticated = (res, statusCode, user, message) => {
  const token = createToken(user._id);
  res.cookie('accessToken', token, cookieOptions(token));
  return ApiResponse.send(res, statusCode, { user: user.toSafeObject() }, message);
};

class AuthController {
  static register = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) throw new AppError('An account with that email or phone already exists', 409);
    const user = await User.create({ name, email, phone, password });
    return sendAuthenticated(res, 201, user, 'Registration successful');
  });

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +role +isActive');
    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      throw new AppError('Email or password is incorrect', 401);
    }
    return sendAuthenticated(res, 200, user, 'Login successful');
  });

  static logout = (_req, res) => {
    res.clearCookie('accessToken', { httpOnly: true, secure: nodeEnv === 'production', sameSite: nodeEnv === 'production' ? 'none' : 'lax', path: '/' });
    return ApiResponse.send(res, 200, null, 'Logout successful');
  };

  static me = asyncHandler(async (req, res) => {
    const safeUser = req.user.toSafeObject();
    safeUser.role = req.user.role;
    return ApiResponse.send(res, 200, { user: safeUser }, 'Profile retrieved');
  });
}

module.exports = AuthController;
