const Order = require('../models/Order');

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
      subtotal,
      deliveryFee,
      discount = 0,
      total,
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

    const orderItems = items.map((item) => ({
      product: item.product || item._id || item.id,
      name: item.name,
      slug: item.slug || '',
      image: item.image || item.images?.[0] || '',
      size: item.size || '100 ml',
      quantity: Number(item.quantity),
      price: Number(item.price),
      subtotal: Number(item.price) * Number(item.quantity),
    }));

    const invalidItem = orderItems.find(
      (item) =>
        !item.product ||
        !item.name ||
        !Number.isFinite(item.quantity) ||
        item.quantity < 1 ||
        !Number.isFinite(item.price) ||
        item.price < 0
    );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: 'One or more order items are invalid.',
      });
    }

    const calculatedSubtotal = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const calculatedDeliveryFee = Number(deliveryFee) || 0;
    const calculatedDiscount = Number(discount) || 0;

    const calculatedTotal =
      calculatedSubtotal + calculatedDeliveryFee - calculatedDiscount;

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
      total: Math.max(0, calculatedTotal),

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