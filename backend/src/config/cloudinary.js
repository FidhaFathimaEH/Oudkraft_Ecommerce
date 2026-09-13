const cloudinary = require('cloudinary').v2;
const { cloudinary: cloudinaryConfig } = require('./env');

const isCloudinaryConfigured = () => {
  return Boolean(
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.apiKey &&
    cloudinaryConfig.apiSecret
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
    secure: true,
  });
}

/**
 * Uploads a file buffer directly to Cloudinary using an upload_stream.
 *
 * @param {Buffer} buffer - File buffer from memory storage
 * @param {Object} options - Additional Cloudinary upload options
 * @returns {Promise<Object>} Resolves with Cloudinary upload result
 */
const uploadBuffer = (buffer, options = {}) => {
  if (!isCloudinaryConfigured()) {
    const error = new Error('Cloudinary storage credentials are not configured on the server.');
    error.statusCode = 503;
    error.isConfigError = true;
    return Promise.reject(error);
  }

  const uploadOptions = {
    folder: 'oudkraft/products',
    resource_type: 'image',
    ...options,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBuffer,
};
