const Order = require('../models/Order');
const Product = require('../models/Product');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `OK-${timestamp}-${random}`;
};

const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

const calculateDeliveryFee = (subtotal, emirate) => {
  const FREE_DELIVERY_THRESHOLD = 250;
  const ABU_DHABI_FEE = 20;
  const OTHER_EMIRATES_FEE = 35;

  if (Number(subtotal) >= FREE_DELIVERY_THRESHOLD) {
    return 0;
  }

  const normalizedEmirate = (emirate || '').toString().trim().toLowerCase();
  if (normalizedEmirate === 'abu dhabi') {
    return ABU_DHABI_FEE;
  }

  return OTHER_EMIRATES_FEE;
};

const calculateDiscount = async (couponCode, subtotal) => {
  if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
    return 0;
  }

  try {
    const Coupon = require('../models/Coupon');
    const code = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      return 0;
    }

    if (coupon.discountAmount && Number(coupon.discountAmount) > 0) {
      return round2(Math.min(subtotal, Number(coupon.discountAmount)));
    }

    if (coupon.discountPercent && Number(coupon.discountPercent) > 0) {
      return round2((subtotal * Number(coupon.discountPercent)) / 100);
    }
  } catch {
    return 0;
  }

  return 0;
};

const resolveOrderItemsAndAmounts = async ({ items, emirate, couponCode }) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('At least one product is required.');
    err.statusCode = 400;
    throw err;
  }

  const productIds = items.map(
    (item) => item.product || item._id || item.id
  );

  const hasInvalidProductId = productIds.some((id) => !id);
  if (hasInvalidProductId) {
    const err = new Error('One or more product IDs are missing.');
    err.statusCode = 400;
    throw err;
  }

  const products = await Product.find({
    _id: { $in: productIds },
  });

  if (products.length !== productIds.length) {
    const err = new Error('One or more products could not be found.');
    err.statusCode = 400;
    throw err;
  }

  const orderItems = [];

  for (const item of items) {
    const productId = item.product || item._id || item.id;
    const product = products.find(
      (databaseProduct) =>
        databaseProduct._id.toString() === productId.toString()
    );

    if (!product) {
      const err = new Error(`Product not found: ${productId}`);
      err.statusCode = 400;
      throw err;
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      const err = new Error(`Invalid quantity for ${product.name}.`);
      err.statusCode = 400;
      throw err;
    }

    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) {
      const err = new Error(`Invalid price configured for ${product.name}.`);
      err.statusCode = 400;
      throw err;
    }

    const lineSubtotal = round2(price * quantity);
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
      subtotal: lineSubtotal,
    });
  }

  const subtotal = round2(
    orderItems.reduce((sum, item) => sum + item.subtotal, 0)
  );

  const deliveryFee = calculateDeliveryFee(subtotal, emirate);
  const discount = await calculateDiscount(couponCode, subtotal);
  const total = round2(Math.max(0, subtotal + deliveryFee - discount));

  return {
    orderItems,
    subtotal,
    deliveryFee,
    discount,
    total,
  };
};

const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      deliveryAddress,
      items,
      couponCode,
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

    const {
      orderItems,
      subtotal,
      deliveryFee,
      discount,
      total,
    } = await resolveOrderItemsAndAmounts({
      items,
      emirate: deliveryAddress.emirate,
      couponCode,
    });

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

      subtotal,
      deliveryFee,
      discount,
      total,
      currency: 'aed',

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
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
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
  resolveOrderItemsAndAmounts,
  calculateDeliveryFee,
  calculateDiscount,
  round2,
};