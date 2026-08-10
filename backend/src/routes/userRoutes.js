const router = require('express').Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfile, changePassword } = require('../validators/authValidators');

router.use(auth);
router.get('/profile', UserController.profile);
router.put('/profile', updateProfile, validate, UserController.updateProfile);
router.put('/change-password', changePassword, validate, UserController.changePassword);
module.exports = router;
