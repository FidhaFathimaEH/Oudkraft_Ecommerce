const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

const rawJwtSecret = process.env.JWT_SECRET;
if (isProduction) {
  if (!rawJwtSecret) {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
  }
  if (rawJwtSecret.trim() === 'dev-secret' || rawJwtSecret.trim().toLowerCase() === 'dev-secret') {
    throw new Error('FATAL: Insecure development default value for JWT_SECRET cannot be used in production.');
  }
}

module.exports = {
  port: process.env.PORT || 5000,

  nodeEnv,

  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/oudkraft',

  jwtSecret: rawJwtSecret || 'dev-secret',

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ||
    '7d',

  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    'dev-refresh-secret',

  clientUrl:
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  smtp: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  rateLimitWindowMs: Number(
    process.env.RATE_LIMIT_WINDOW_MS ||
      (isDevelopment ? 60000 : 900000)
  ),

  rateLimitMaxRequests: Number(
    process.env.RATE_LIMIT_MAX_REQUESTS ||
      (isDevelopment ? 1000 : 100)
  ),
};