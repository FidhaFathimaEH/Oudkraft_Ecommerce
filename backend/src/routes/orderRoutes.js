const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/OrderController');

// Public/Optional Auth — customers place orders (captures customer identity if authenticated)
router.post('/', auth.optionalAuth, createOrder);

// Customer-isolated order history — strictly authenticated
router.get('/my-orders', auth, getMyOrders);

// Admin-only — view all orders
router.get('/', auth, admin, getOrders);

// Individual order access — authenticated (Admin can view all, Customer can only view own)
router.get('/:id', auth, getOrderById);

// Admin-only — update status
router.patch('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;