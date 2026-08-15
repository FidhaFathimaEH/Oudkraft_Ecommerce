const router = require('express').Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/OrderController');

router.post('/', createOrder);

router.get('/', getOrders);

router.get('/:id', getOrderById);

router.patch('/:id/status', updateOrderStatus);

module.exports = router;