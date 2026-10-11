const router = require('express').Router();

const ReviewController = require('../controllers/ReviewController');
const auth = require('../middleware/auth');
const { reviewActionLimiter } = require('../middleware/rateLimiter');

/*
 * Public
 */
router.get(
  '/product/:productId',
  ReviewController.getProductReviews
);

/*
 * Authenticated customer actions
 */
router.post(
  '/',
  auth,
  ReviewController.createReview
);

router.patch(
  '/:id/helpful',
  auth,
  reviewActionLimiter,
  ReviewController.markHelpful
);

router.patch(
  '/:id/report',
  auth,
  reviewActionLimiter,
  ReviewController.reportReview
);

module.exports = router;