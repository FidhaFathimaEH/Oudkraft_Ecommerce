const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    deliveryAddress: {
      emirate: {
        type: String,
        required: true,
        trim: true,
      },

      area: {
        type: String,
        trim: true,
        default: '',
      },

      street: {
        type: String,
        trim: true,
        default: '',
      },

      building: {
        type: String,
        trim: true,
        default: '',
      },

      apartment: {
        type: String,
        trim: true,
        default: '',
      },

      landmark: {
        type: String,
        trim: true,
        default: '',
      },

      instructions: {
        type: String,
        trim: true,
        default: '',
      },
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        slug: {
          type: String,
          default: '',
        },

        image: {
          type: String,
          default: '',
        },

        size: {
          type: String,
          default: '100 ml',
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'cash_on_delivery'],
      default: 'card',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);