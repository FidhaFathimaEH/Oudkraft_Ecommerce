const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const SettingController = require('../controllers/SettingController');

// Public route to fetch hero banner
router.get('/hero', SettingController.getHeroBanner);

// Protected admin-only route to update hero banner
router.put('/hero', auth, admin, SettingController.updateHeroBanner);

module.exports = router;
