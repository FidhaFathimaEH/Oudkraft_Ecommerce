const { uploadBuffer, isCloudinaryConfigured } = require('../config/cloudinary');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

class UploadController {
  /**
   * Upload a single product image to Cloudinary.
   * POST /api/v1/uploads/image
   */
  static async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return next(new AppError('Please provide an image file to upload.', 400));
      }

      if (!isCloudinaryConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Cloudinary storage credentials are not configured on the server.',
        });
      }

      const result = await uploadBuffer(req.file.buffer);

      return ApiResponse.send(
        res,
        201,
        {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        },
        'Image uploaded successfully'
      );
    } catch (error) {
      if (error.isConfigError) {
        return res.status(503).json({
          success: false,
          message: error.message,
        });
      }
      return next(error);
    }
  }

  /**
   * Upload multiple product images (up to 5) to Cloudinary.
   * POST /api/v1/uploads
   */
  static async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return next(new AppError('Please provide at least one image file to upload.', 400));
      }

      if (!isCloudinaryConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Cloudinary storage credentials are not configured on the server.',
        });
      }

      const uploadPromises = req.files.map((file) => uploadBuffer(file.buffer));
      const results = await Promise.all(uploadPromises);

      const data = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      }));

      return ApiResponse.send(
        res,
        201,
        data,
        'Images uploaded successfully'
      );
    } catch (error) {
      if (error.isConfigError) {
        return res.status(503).json({
          success: false,
          message: error.message,
        });
      }
      return next(error);
    }
  }
}

module.exports = UploadController;
