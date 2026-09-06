const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

    verifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },

    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },

    reported: {
      type: Boolean,
      default: false,
      index: true,
    },

    media: {
      images: {
        type: [String],
        default: [],
      },

      video: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

/*
 * A customer can review a product only once.
 */
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.Review ||
  mongoose.model('Review', reviewSchema);