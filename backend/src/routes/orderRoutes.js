const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/OrderController');

// Public — customers place orders
router.post('/', createOrder);

// Admin-only
router.get('/', auth, admin, getOrders);
router.get('/:id', auth, admin, getOrderById);
router.patch('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;