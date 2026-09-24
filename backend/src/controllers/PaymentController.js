const mongoose = require('mongoose');
const Order = require('../models/Order');
const { getStripe, isStripeConfigured } = require('../config/stripe');
const { clientUrl, stripe: stripeConfig } = require('../config/env');
const { resolveOrderItemsAndAmounts } = require('./OrderController');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `OK-${timestamp}-${random}`;
};

/**
 * Creates a Stripe Checkout Session for an order using server-authoritative amounts.
 * Client-provided subtotal, deliveryFee, discount, or total values in req.body are strictly ignored.
 *
 * @route POST /api/v1/payments/create-checkout-session
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe payment gateway is currently unavailable or not configured.',
      });
    }

    const {
      orderId,
      customer,
      deliveryAddress,
      items,
      couponCode,
    } = req.body;

    let order = null;

    if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID.',
        });
      }

      order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      if (order.paymentStatus === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Order is already paid.',
        });
      }

      if (order.paymentMethod !== 'card') {
        return res.status(400).json({
          success: false,
          message: 'Order payment method must be card for online checkout.',
        });
      }
    } else if (items && Array.isArray(items) && items.length > 0) {
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

      order = await Order.create({
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

        paymentMethod: 'card',
        paymentStatus: 'pending',
        status: 'Pending',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Order ID or order items with customer details are required.',
      });
    }

    if (!order.total || order.total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Order total must be greater than zero.',
      });
    }

    // Amount in fils (1 AED = 100 fils)
    const unitAmount = Math.round(order.total * 100);

    const stripe = getStripe();
    const baseUrl = clientUrl.replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: order.customer.email,
      client_reference_id: order._id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `Oud Kraft Order ${order.orderNumber}`,
              description: `Order ${order.orderNumber} (${order.items.length} item${order.items.length > 1 ? 's' : ''})`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    order.stripeSessionId = session.id;
    if (session.payment_intent) {
      order.stripePaymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id;
    }
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Checkout session created successfully.',
      data: {
        sessionId: session.id,
        sessionUrl: session.url,
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: 'aed',
      },
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

/**
 * Handles incoming Stripe webhooks.
 * Authoritative handler for confirming Stripe payments.
 *
 * @route POST /api/v1/payments/webhook
 */
const handleWebhook = async (req, res) => {
  const webhookSecret =
    stripeConfig?.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !webhookSecret.trim()) {
    return res.status(500).json({
      success: false,
      message: 'Stripe webhook secret is not configured on the server.',
    });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing Stripe signature header.',
    });
  }

  const rawBody = req.rawBody || req.body;
  if (!rawBody || (typeof rawBody !== 'string' && !Buffer.isBuffer(rawBody))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or missing webhook request body.',
    });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret.trim()
    );
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid Stripe webhook signature.',
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const sessionId = session.id;
        const metadataOrderId = session.metadata?.orderId;
        const metadataOrderNumber = session.metadata?.orderNumber;

        // 1. Locate the internal order
        let order = null;
        if (metadataOrderId && mongoose.Types.ObjectId.isValid(metadataOrderId)) {
          order = await Order.findById(metadataOrderId);
        }

        if (!order && sessionId) {
          order = await Order.findOne({ stripeSessionId: sessionId });
        }

        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Referenced order not found.',
          });
        }

        // 2. Validate metadata / order consistency to prevent cross-order tampering
        if (metadataOrderNumber && order.orderNumber !== metadataOrderNumber) {
          return res.status(400).json({
            success: false,
            message: 'Order number does not match session metadata.',
          });
        }

        if (order.stripeSessionId && order.stripeSessionId !== sessionId) {
          return res.status(400).json({
            success: false,
            message: 'Stripe session ID does not match order record.',
          });
        }

        // 3. Idempotency check: if order is already paid, safely return 200 without duplicate side effects
        if (order.paymentStatus === 'paid') {
          return res.status(200).json({
            success: true,
            message: 'Order is already marked as paid.',
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              alreadyPaid: true,
            },
          });
        }

        // 4. Verify Stripe checkout payment status (only 'paid' is marked confirmed)
        if (session.payment_status !== 'paid') {
          // If session is incomplete / unpaid, leave pending and do not confirm
          return res.status(200).json({
            success: true,
            message: 'Payment not settled yet; order remains pending.',
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              paymentStatus: order.paymentStatus,
            },
          });
        }

        // 5. Extract paymentIntent ID if present
        let paymentIntentId = null;
        if (typeof session.payment_intent === 'string') {
          paymentIntentId = session.payment_intent;
        } else if (
          session.payment_intent &&
          typeof session.payment_intent.id === 'string'
        ) {
          paymentIntentId = session.payment_intent.id;
        }

        // 6. Update order to paid & Confirmed
        order.paymentStatus = 'paid';
        order.status = 'Confirmed';
        order.stripeSessionId = sessionId;
        if (paymentIntentId) {
          order.stripePaymentIntentId = paymentIntentId;
        }
        order.paidAt = new Date();

        await order.save();

        return res.status(200).json({
          success: true,
          message: 'Order successfully marked as paid and confirmed.',
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            status: order.status,
          },
        });
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const sessionId = session.id;
        const metadataOrderId = session.metadata?.orderId;

        let order = null;
        if (metadataOrderId && mongoose.Types.ObjectId.isValid(metadataOrderId)) {
          order = await Order.findById(metadataOrderId);
        }
        if (!order && sessionId) {
          order = await Order.findOne({ stripeSessionId: sessionId });
        }

        if (order && order.paymentStatus === 'pending') {
          return res.status(200).json({
            success: true,
            message: 'Checkout session expired; order remains unpaid.',
            data: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              paymentStatus: order.paymentStatus,
            },
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Checkout session expired event received.',
        });
      }

      default: {
        return res.status(200).json({
          success: true,
          message: `Unhandled event type: ${event.type}`,
        });
      }
    }
  } catch {
    return res.status(500).json({
      success: false,
      message: 'Error processing webhook event.',
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
};
