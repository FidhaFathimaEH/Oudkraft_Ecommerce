const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {
  createCheckoutSession,
  handleWebhook,
} = require('../controllers/PaymentController');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');

/**
 * Token validator middleware:
 * If an Authorization header or cookie token is provided, validate it.
 * If invalid or expired, reject with 401.
 * If not provided, allow guest checkout (consistent with public order placement).
 */
const validateOptionalCustomerAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;
  const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : (authHeader ? authHeader : null));

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub).select('+role +isActive');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This account is unavailable or inactive.',
      });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Your session is invalid or has expired.',
    });
  }
};

// Route: POST /api/v1/payments/create-checkout-session
router.post('/create-checkout-session', validateOptionalCustomerAuth, createCheckoutSession);

// Route: POST /api/v1/payments/webhook (Signature verified inside controller with raw body)
router.post('/webhook', handleWebhook);

module.exports = router;
