const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const AdminController = require('../controllers/AdminController');

// All admin routes require auth + admin
router.use(auth, admin);

router.get('/verify', (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access verified' });
});

router.get('/dashboard', AdminController.getDashboard);
router.get('/customers', AdminController.getCustomers);

module.exports = router;
