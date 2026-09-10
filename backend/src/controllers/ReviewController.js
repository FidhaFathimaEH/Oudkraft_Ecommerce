const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

/*
 * Check whether the authenticated customer purchased
 * and received the requested product.
 */
const hasVerifiedPurchase = async (user, productId) => {
  const order = await Order.findOne({
    'customer.email': user.email.toLowerCase(),
    status: 'Delivered',
    'items.product': productId,
  });

  return Boolean(order);
};

/*
 * Recalculate the product's rating and review count.
 */
const updateProductRating = async (productId) => {
  const result = await Review.aggregate([
    {
      $match: {
        product: productId,
        reported: false,
      },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const ratingData = result[0] || {
    averageRating: 0,
    reviewCount: 0,
  };

  await Product.findByIdAndUpdate(productId, {
    rating: Number(ratingData.averageRating.toFixed(1)),
    reviewCount: ratingData.reviewCount,
  });
};

/*
 * GET /api/v1/reviews/product/:productId
 *
 * Public — anyone can read reviews.
 */
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      reported: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * POST /api/v1/reviews
 *
 * Authenticated customers only.
 */
const createReview = async (req, res, next) => {
  try {
    const {
      product,
      rating,
      title = '',
      comment,
      media = {},
    } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product is required.',
      });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must contain at least 3 characters.',
      });
    }

    const productExists = await Product.exists({
      _id: product,
    });

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    /*
     * Prevent duplicate reviews.
     */
    const existingReview = await Review.findOne({
      product,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product.',
      });
    }

    /*
     * Verify the customer actually received
     * this product.
     */
    const verifiedPurchase = await hasVerifiedPurchase(
      req.user,
      product
    );

    const review = await Review.create({
      product,
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase,
      media: {
        images: Array.isArray(media.images)
          ? media.images
          : [],
        video: media.video || null,
      },
    });

    await updateProductRating(product);

    return res.status(201).json({
      success: true,
      message: verifiedPurchase
        ? 'Verified review submitted successfully.'
        : 'Review submitted successfully.',
      data: review,
    });
  } catch (error) {
    /*
     * Handle MongoDB duplicate-key errors.
     */
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product.',
      });
    }

    next(error);
  }
};

/*
 * PATCH /api/v1/reviews/:id/helpful
 *
 * Increase helpful count.
 */
const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          helpful: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review marked as helpful.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/*
 * PATCH /api/v1/reviews/:id/report
 *
 * Report a review.
 */
const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        reported: true,
      },
      {
        new: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    await updateProductRating(review.product);

    return res.status(200).json({
      success: true,
      message: 'Review reported successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  markHelpful,
  reportReview,
};