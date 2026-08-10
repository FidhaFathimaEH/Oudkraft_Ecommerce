const rateLimit = require('express-rate-limit');
const { rateLimitWindowMs, rateLimitMaxRequests } = require('../config/env');

module.exports = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
