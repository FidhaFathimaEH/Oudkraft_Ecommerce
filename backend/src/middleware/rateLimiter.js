const rateLimit = require('express-rate-limit');
const { rateLimitWindowMs, rateLimitMaxRequests, nodeEnv } = require('../config/env');

const isTest = nodeEnv === 'test' || process.env.NODE_ENV === 'test';
const isProd = nodeEnv === 'production' || process.env.NODE_ENV === 'production';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: isTest ? 10000 : (rateLimitMaxRequests || 600),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Dedicated login rate limiter (brute-force defense)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : (isProd ? 10 : 30),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Dedicated registration rate limiter (spam defense)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTest ? 1000 : (isProd ? 5 : 20),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many accounts created from this IP. Please try again later.' },
});

// Review action limiter (helpful votes and reports)
const reviewActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many review feedback requests. Please try again later.' },
});

apiLimiter.apiLimiter = apiLimiter;
apiLimiter.authLimiter = authLimiter;
apiLimiter.registerLimiter = registerLimiter;
apiLimiter.reviewActionLimiter = reviewActionLimiter;

module.exports = apiLimiter;
