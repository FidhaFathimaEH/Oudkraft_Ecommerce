const multer = require('multer');

// Storage is intentionally memory-only until Cloudinary upload workflows are implemented.
module.exports = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
