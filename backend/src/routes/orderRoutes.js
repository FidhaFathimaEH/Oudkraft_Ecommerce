const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const {
  createOrder,
  createConfirmedWhatsAppOrder,
  downloadOrderInvoice,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/OrderController');

// Public/Optional Auth — customers place orders (captures customer identity if authenticated)
router.post('/', auth.optionalAuth, createOrder);

// Admin-only — record confirmed WhatsApp order
router.post('/admin-record', auth, admin, createConfirmedWhatsAppOrder);

// Customer-isolated order history — strictly authenticated
router.get('/my-orders', auth, getMyOrders);

// Admin-only — view all orders
router.get('/', auth, admin, getOrders);

// Admin-only — generate & download PDF invoice
router.get('/:id/invoice', auth, admin, downloadOrderInvoice);

// Individual order access — authenticated (Admin can view all, Customer can only view own)
router.get('/:id', auth, getOrderById);

// Admin-only — update status
router.patch('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;