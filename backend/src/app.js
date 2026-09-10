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
const { API_PREFIX, HEALTH_PATH } = require('./constants');
const path = require('path');

const app = express();
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(compression());
app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
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
app.use(`${API_PREFIX}/reviews`, require('./routes/reviewRoutes'));
app.use(`${API_PREFIX}/coupons`, require('./routes/couponRoutes'));
app.use(`${API_PREFIX}/uploads`, require('./routes/uploadRoutes'));
app.use(`${API_PREFIX}/newsletter`, require('./routes/newsletterRoutes'));
app.use(`${API_PREFIX}/contact`, require('./routes/contactRoutes'));
app.use(`${API_PREFIX}/users`, require('./routes/userRoutes'));
app.use(`${API_PREFIX}/admin`, require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
