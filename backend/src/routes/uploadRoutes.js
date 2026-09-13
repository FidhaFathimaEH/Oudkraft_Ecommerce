const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');
const UploadController = require('../controllers/UploadController');

// All upload routes require authenticated admin access
router.post('/image', auth, admin, upload.single('image'), UploadController.uploadImage);
router.post('/', auth, admin, upload.array('images', 5), UploadController.uploadImages);

module.exports = router;
