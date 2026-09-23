const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');

class SettingController {
  /**
   * Get homepage hero banner setting.
   * GET /api/v1/settings/hero
   * Public access
   */
  static getHeroBanner = asyncHandler(async (req, res) => {
    const setting = await Setting.findOne({ key: 'hero_banner' }).lean();
    return ApiResponse.send(
      res,
      200,
      setting ? setting.value : null,
      'Hero banner retrieved successfully'
    );
  });

  /**
   * Update homepage hero banner setting.
   * PUT /api/v1/settings/hero
   * Admin-only access
   */
  static updateHeroBanner = asyncHandler(async (req, res, next) => {
    const { imageUrl, publicId } = req.body || {};

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return next(new AppError('A valid image URL is required.', 400));
    }

    const trimmedUrl = imageUrl.trim();
    // Basic URL validation
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return next(new AppError('Image URL must start with http:// or https://', 400));
    }

    const payload = {
      imageUrl: trimmedUrl,
      publicId: typeof publicId === 'string' ? publicId.trim() : undefined,
    };

    const setting = await Setting.findOneAndUpdate(
      { key: 'hero_banner' },
      { value: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return ApiResponse.send(
      res,
      200,
      setting.value,
      'Hero banner updated successfully'
    );
  });
}

module.exports = SettingController;
