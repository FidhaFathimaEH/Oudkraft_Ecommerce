const router = require('express').Router();
const ProductController = require('../controllers/ProductController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.get('/', ProductController.getProducts);
router.get('/:slug', ProductController.getProductBySlug);

// Admin-only mutation routes
router.post('/', auth, admin, ProductController.createProduct);
router.patch('/:id', auth, admin, ProductController.updateProduct);
router.delete('/:id', auth, admin, ProductController.deleteProduct);

module.exports = router;