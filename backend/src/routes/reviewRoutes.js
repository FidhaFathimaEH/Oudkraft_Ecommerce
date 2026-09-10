const router = require('express').Router();

const ReviewController = require('../controllers/ReviewController');
const auth = require('../middleware/auth');

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
  ReviewController.markHelpful
);

router.patch(
  '/:id/report',
  auth,
  ReviewController.reportReview
);

module.exports = router;