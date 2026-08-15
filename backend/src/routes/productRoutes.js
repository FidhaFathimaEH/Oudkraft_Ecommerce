const router = require('express').Router();
const ProductController = require('../controllers/ProductController');

// Public routes
router.get('/', ProductController.getProducts);
router.get('/:slug', ProductController.getProductBySlug);

// Admin routes will be protected with admin middleware later.
router.post('/', ProductController.createProduct);
router.patch('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;