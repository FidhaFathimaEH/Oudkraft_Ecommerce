const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { nodeEnv, clientUrl } = require('./config/env');
const requestLogger = require('./middleware/logger');
const apiLimiter = require('./middleware/rateLimiter');
const sanitize = require('./middleware/sanitize');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');
const { API_PREFIX, HEALTH_PATH } = require('./constants');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Security headers applied globally (including static assets)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Robust CORS with trailing-slash normalization
const normalizeOrigin = (url) => (typeof url === 'string' ? url.trim().replace(/\/+$/, '') : '');
const normalizedClientUrl = normalizeOrigin(clientUrl);
const allowedOrigins = new Set(
  [
    normalizedClientUrl,
    'https://oudkraft-ecommerce.vercel.app',
    'https://oudkraft.ae',
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.has(normalized)) {
        return callback(null, true);
      }
      if (nodeEnv !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(normalized)) {
        return callback(null, true);
      }
      return callback(new AppError('Not allowed by CORS', 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Static assets mounted after Helmet & CORS
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use(compression());
app.use(requestLogger);

// Stripe webhook requires original raw body Buffer for signature verification
app.use(
  `${API_PREFIX}/payments/webhook`,
  express.raw({ type: 'application/json' })
);

app.use(
  express.json({
    limit: '10kb',
    verify: (req, res, buf) => {
      if (req.originalUrl && req.originalUrl.includes('/payments/webhook')) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(sanitize);

app.get(HEALTH_PATH, (req, res) => res.status(200).json({
  success: true,
  status: 'OK',
  environment: nodeEnv,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
}));

app.use(API_PREFIX, apiLimiter);
app.use(`${API_PREFIX}/auth`, require('./routes/authRoutes'));
app.use(`${API_PREFIX}/products`, require('./routes/productRoutes'));
app.use(`${API_PREFIX}/categories`, require('./routes/categoryRoutes'));
app.use(`${API_PREFIX}/cart`, require('./routes/cartRoutes'));
app.use(`${API_PREFIX}/wishlist`, require('./routes/wishlistRoutes'));
app.use(`${API_PREFIX}/orders`, require('./routes/orderRoutes'));
app.use(`${API_PREFIX}/payments`, require('./routes/paymentRoutes'));
app.use(`${API_PREFIX}/reviews`, require('./routes/reviewRoutes'));
app.use(`${API_PREFIX}/coupons`, require('./routes/couponRoutes'));
app.use(`${API_PREFIX}/uploads`, require('./routes/uploadRoutes'));
app.use(`${API_PREFIX}/newsletter`, require('./routes/newsletterRoutes'));
app.use(`${API_PREFIX}/contact`, require('./routes/contactRoutes'));
app.use(`${API_PREFIX}/users`, require('./routes/userRoutes'));
app.use(`${API_PREFIX}/admin`, require('./routes/adminRoutes'));
app.use(`${API_PREFIX}/settings`, require('./routes/settingRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
