const Order = require('../models/Order');
const Product = require('../models/Product');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `OK-${timestamp}-${random}`;
};

const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      deliveryAddress,
      items,
      deliveryFee = 0,
      discount = 0,
      paymentMethod,
    } = req.body;

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email and phone are required.',
      });
    }

    if (!deliveryAddress?.emirate) {
      return res.status(400).json({
        success: false,
        message: 'Delivery emirate is required.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product is required.',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required.',
      });
    }

    if (!['card', 'cash_on_delivery'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.',
      });
    }

    const productIds = items.map(
      (item) => item.product || item._id || item.id
    );

    const hasInvalidProductId = productIds.some(
      (id) => !id
    );

    if (hasInvalidProductId) {
      return res.status(400).json({
        success: false,
        message: 'One or more product IDs are missing.',
      });
    }

    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products could not be found.',
      });
    }

    const orderItems = [];

    for (const item of items) {
      const productId = item.product || item._id || item.id;

      const product = products.find(
        (databaseProduct) =>
          databaseProduct._id.toString() === productId.toString()
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price configured for ${product.name}.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug || '',
        image:
          product.images?.[0] ||
          product.image ||
          '',
        size: item.size || '100 ml',
        quantity,
        price,
        subtotal: price * quantity,
      });
    }

    const calculatedSubtotal = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const calculatedDeliveryFee = Number(deliveryFee);

    if (
      !Number.isFinite(calculatedDeliveryFee) ||
      calculatedDeliveryFee < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery fee.',
      });
    }

    const calculatedDiscount = Number(discount);

    if (
      !Number.isFinite(calculatedDiscount) ||
      calculatedDiscount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount.',
      });
    }

    const calculatedTotal = Math.max(
      0,
      calculatedSubtotal +
        calculatedDeliveryFee -
        calculatedDiscount
    );

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
      },

      deliveryAddress: {
        emirate: deliveryAddress.emirate.trim(),
        area: deliveryAddress.area?.trim() || '',
        street: deliveryAddress.street?.trim() || '',
        building: deliveryAddress.building?.trim() || '',
        apartment: deliveryAddress.apartment?.trim() || '',
        landmark: deliveryAddress.landmark?.trim() || '',
        instructions: deliveryAddress.instructions?.trim() || '',
      },

      items: orderItems,

      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      discount: calculatedDiscount,
      total: calculatedTotal,

      paymentMethod,
      paymentStatus: 'pending',
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};