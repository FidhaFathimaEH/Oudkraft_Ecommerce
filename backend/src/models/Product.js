const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      default: 'Oud Kraft',
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
      required: true,
      index: true,
    },

    inspiration: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    detailedDescription: {
      type: String,
      trim: true,
    },

    fragranceFamily: {
      type: String,
      trim: true,
      index: true,
    },

    topNotes: {
      type: [String],
      default: [],
    },

    heartNotes: {
      type: [String],
      default: [],
    },

    middleNotes: {
      type: [String],
      default: [],
    },

    baseNotes: {
      type: [String],
      default: [],
    },

    occasion: {
      type: String,
      trim: true,
    },

    season: {
      type: String,
      trim: true,
    },

    sillage: {
      type: String,
      trim: true,
    },

    story: {
      type: String,
      trim: true,
    },

    howToWear: {
      type: String,
      trim: true,
    },

    whenToWear: {
      type: String,
      trim: true,
    },

    longevity: {
      type: String,
      trim: true,
    },

    projection: {
      type: String,
      trim: true,
    },

    size: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      min: 0,
    },

    discount: {
      type: String,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    bestseller: {
      type: Boolean,
      default: false,
      index: true,
    },

    delivery: {
      type: String,
      trim: true,
    },

    notes: {
      type: [String],
      default: [],
    },

    sku: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    ingredients: {
      type: [String],
      default: [],
    },

    usage: {
      type: String,
      trim: true,
    },

    deliveryInfo: {
      type: String,
      trim: true,
    },

    images: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    image360: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    reviews: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    questions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Text search
productSchema.index({
  name: 'text',
  slug: 'text',
  category: 'text',
  fragranceFamily: 'text',
});

// Product browsing
productSchema.index({
  category: 1,
  gender: 1,
});

productSchema.index({
  featured: 1,
  bestseller: 1,
});

module.exports = mongoose.model('Product', productSchema);