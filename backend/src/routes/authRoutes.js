const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { register, login } = require('../validators/authValidators');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerLimiter, register, validate, AuthController.register);
router.post('/login', authLimiter, login, validate, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', auth, AuthController.me);
module.exports = router;
