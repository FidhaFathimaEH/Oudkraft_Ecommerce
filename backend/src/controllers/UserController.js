const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  static profile = asyncHandler(async (req, res) => ApiResponse.send(res, 200, { user: req.user.toSafeObject() }, 'Profile retrieved'));

  static updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'email', 'phone', 'avatar'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    return ApiResponse.send(res, 200, { user: req.user.toSafeObject() }, 'Profile updated');
  });

  static changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password +role +isActive');
    if (!user || !user.isActive) throw new AppError('This account is unavailable', 401);
    if (!(await user.comparePassword(req.body.currentPassword))) throw new AppError('Current password is incorrect', 401);
    if (req.body.currentPassword === req.body.newPassword) throw new AppError('New password must be different', 422);
    user.password = req.body.newPassword;
    await user.save();
    res.clearCookie('accessToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' });
    return ApiResponse.send(res, 200, null, 'Password changed successfully. Please log in again.');
  });
}

module.exports = UserController;
