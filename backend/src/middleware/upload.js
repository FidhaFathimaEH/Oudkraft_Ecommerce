const multer = require('multer');
const AppError = require('../utils/appError');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPEG, PNG, WebP, GIF, and AVIF image formats are allowed.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
  fileFilter,
});

module.exports = upload;
