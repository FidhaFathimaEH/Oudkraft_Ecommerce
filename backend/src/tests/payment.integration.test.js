const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('Stripe payment integration: security, configuration, server-authoritative calculations, and session creation', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-payment-test');
  process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-for-payment-test-phase';

  const { connectDB, disconnectDB } = require('../config/database');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const stripeConfigModule = require('../config/stripe');
  const env = require('../config/env');
  const app = require('../app');

  await connectDB();
  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // Seed sample products
  const productA = await Product.create({
    name: 'Royal Cambodian Oud',
    slug: 'royal-cambodian-oud',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    price: 300,
    stock: 10,
    images: ['https://example.com/photoA.jpg'],
  });

  const productB = await Product.create({
    name: 'Taif Rose Essence',
    slug: 'taif-rose-essence',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    price: 100,
    stock: 10,
    images: ['https://example.com/photoB.jpg'],
  });

  // Helper to install mock Stripe client
  let lastCreatedSessionParams = null;
  const mockStripeClient = {
    checkout: {
      sessions: {
        create: async (params) => {
          lastCreatedSessionParams = params;
          return {
            id: 'cs_test_mock_123456789',
            url: 'https://checkout.stripe.com/pay/cs_test_mock_123456789',
            payment_intent: 'pi_test_mock_987654321',
          };
        },
      },
    },
    webhooks: {
      constructEvent: (payload, signature) => {
        if (!signature || signature === 'invalid_signature') {
          throw new Error('Invalid signature');
        }
        if (typeof payload === 'string' || Buffer.isBuffer(payload)) {
          return JSON.parse(payload.toString());
        }
        return payload;
      },
    },
  };

  // 1. Stripe endpoint rejects unauthenticated/unauthorized access when invalid auth token is passed
  await t.test('1. Rejects unauthenticated/invalid auth token and invalid payloads', async () => {
    // Malformed/invalid token should be rejected with 401
    const invalidAuthRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .set('Authorization', 'Bearer definitely.invalid.token')
      .send({ orderId: '6ab4d5efb8c5edb49b7c7f4d' });

    assert.equal(invalidAuthRes.status, 401);
    assert.equal(invalidAuthRes.body.success, false);

    // Empty payload without orderId or items
    const emptyPayloadRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({});

    // Either 503 (if stripe unconfigured) or 400 (missing payload)
    assert.ok([400, 503].includes(emptyPayloadRes.status));
  });

  // 2. Missing Stripe configuration returns a controlled server error (503)
  await t.test('2. Missing Stripe configuration returns controlled 503 error', async () => {
    // Ensure Stripe secretKey is empty
    env.stripe.secretKey = '';
    stripeConfigModule.setStripeClient(null);

    const res = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({
        customer: {
          name: 'Fatima Al Mansoori',
          email: 'fatima@example.com',
          phone: '+971501234567',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
        },
        items: [
          {
            product: productA._id,
            quantity: 1,
          },
        ],
      });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Stripe payment gateway is currently unavailable or not configured/i);

    // Restore mock client for subsequent tests
    env.stripe.secretKey = 'sk_test_mock_dummy_key_for_testing';
    stripeConfigModule.setStripeClient(mockStripeClient);
  });

  // 3. Client-provided subtotal/total cannot determine Stripe amount
  await t.test('3. Client-provided subtotal/total cannot determine Stripe amount', async () => {
    lastCreatedSessionParams = null;

    // Product A price is 300 AED in MongoDB. Subtotal >= 250 -> deliveryFee is 0. Authoritative total is 300 AED.
    // Client sends subtotal: 5, total: 5 in an attempt to manipulate the charge.
    const res = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({
        customer: {
          name: 'Ahmed Saeed',
          email: 'ahmed@example.com',
          phone: '+971509998877',
        },
        deliveryAddress: {
          emirate: 'Dubai',
        },
        items: [
          {
            product: productA._id,
            quantity: 1,
          },
        ],
        subtotal: 5,
        total: 5,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.total, 300);

    // Stripe amount in fils: 300 AED * 100 = 30000 fils. (NOT 500 fils)
    assert.ok(lastCreatedSessionParams);
    assert.equal(lastCreatedSessionParams.line_items[0].price_data.unit_amount, 30000);
    assert.equal(lastCreatedSessionParams.line_items[0].price_data.currency, 'aed');
  });

  // 4. Client-provided huge discount cannot reduce amount
  await t.test('4. Client-provided huge discount cannot reduce amount', async () => {
    lastCreatedSessionParams = null;

    // Product B price is 100 AED. Abu Dhabi delivery fee is 20 AED. Total should be 120 AED.
    // Client sends discount: 9999
    const res = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({
        customer: {
          name: 'Rashid Khan',
          email: 'rashid@example.com',
          phone: '+971501112233',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
        },
        items: [
          {
            product: productB._id,
            quantity: 1,
          },
        ],
        discount: 9999,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.total, 120);

    // Stripe amount must be 12000 fils (120 AED * 100)
    assert.ok(lastCreatedSessionParams);
    assert.equal(lastCreatedSessionParams.line_items[0].price_data.unit_amount, 12000);
  });

  // 5. Client-provided zero delivery fee cannot bypass authoritative delivery fee
  await t.test('5. Client-provided zero delivery fee cannot bypass authoritative delivery fee', async () => {
    lastCreatedSessionParams = null;

    // Product B price is 100 AED (< 250 AED threshold). Emirate is Dubai -> fee must be 35 AED.
    // Client passes deliveryFee: 0 to attempt free delivery.
    const res = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({
        customer: {
          name: 'Mariam Ali',
          email: 'mariam@example.com',
          phone: '+971504445566',
        },
        deliveryAddress: {
          emirate: 'Dubai',
        },
        items: [
          {
            product: productB._id,
            quantity: 1,
          },
        ],
        deliveryFee: 0,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    // Subtotal 100 + Dubai delivery fee 35 = 135 AED
    assert.equal(res.body.data.total, 135);

    // Stripe amount must be 13500 fils (NOT 10000 fils)
    assert.ok(lastCreatedSessionParams);
    assert.equal(lastCreatedSessionParams.line_items[0].price_data.unit_amount, 13500);
  });

  // 6. Payment session creation uses server-calculated values and links order
  await t.test('6. Payment session creation uses server-calculated values and links order', async () => {
    lastCreatedSessionParams = null;

    // Create order using existing orderId
    const res = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({
        customer: {
          name: 'Zayed Sultan',
          email: 'zayed@example.com',
          phone: '+971508889900',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
        },
        items: [
          {
            product: productA._id,
            quantity: 2, // 300 * 2 = 600 AED. >= 250 => fee 0. Total = 600 AED.
          },
        ],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.sessionId, 'cs_test_mock_123456789');
    assert.equal(res.body.data.sessionUrl, 'https://checkout.stripe.com/pay/cs_test_mock_123456789');

    // Verify Stripe metadata references internal order
    assert.ok(lastCreatedSessionParams);
    assert.equal(lastCreatedSessionParams.metadata.orderId, res.body.data.orderId);
    assert.equal(lastCreatedSessionParams.metadata.orderNumber, res.body.data.orderNumber);
    assert.equal(lastCreatedSessionParams.line_items[0].price_data.unit_amount, 60000);

    // Verify order in database
    const savedOrder = await Order.findById(res.body.data.orderId);
    assert.ok(savedOrder);
    assert.equal(savedOrder.stripeSessionId, 'cs_test_mock_123456789');
    assert.equal(savedOrder.stripePaymentIntentId, 'pi_test_mock_987654321');
    assert.equal(savedOrder.paymentStatus, 'pending');
    assert.equal(savedOrder.status, 'Pending');
    assert.equal(savedOrder.total, 600);
    assert.equal(savedOrder.currency, 'aed');
  });

  // WEBHOOK TESTS

  // 7. Missing webhook secret returns controlled server error
  await t.test('7. Missing webhook secret returns controlled error', async () => {
    env.stripe.webhookSecret = '';

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 't=123,v1=valid_mock_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'checkout.session.completed' }));

    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Stripe webhook secret is not configured on the server/i);

    // Restore webhook secret for subsequent tests
    env.stripe.webhookSecret = 'whsec_test_mock_secret_key';
  });

  // 8. Missing Stripe signature header is rejected
  await t.test('8. Missing Stripe signature header is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'checkout.session.completed' }));

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Missing Stripe signature header/i);
  });

  // 9. Invalid Stripe signature is rejected
  await t.test('9. Invalid Stripe signature is rejected', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'invalid_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'checkout.session.completed' }));

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid Stripe webhook signature/i);
  });

  // 10. Valid checkout.session.completed marks order paid and Confirmed
  let testWebhookOrder = null;
  await t.test('10. Valid checkout.session.completed marks order paid and Confirmed', async () => {
    testWebhookOrder = await Order.create({
      orderNumber: `OK-${Date.now().toString().slice(-8)}-1001`,
      customer: {
        name: 'Suhail Al Dhaheri',
        email: 'suhail@example.com',
        phone: '+971501230001',
      },
      deliveryAddress: {
        emirate: 'Abu Dhabi',
      },
      items: [
        {
          product: productA._id,
          name: productA.name,
          quantity: 1,
          price: 300,
          subtotal: 300,
        },
      ],
      subtotal: 300,
      deliveryFee: 0,
      discount: 0,
      total: 300,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      status: 'Pending',
      stripeSessionId: 'cs_test_valid_session_1001',
    });

    const eventPayload = {
      id: 'evt_test_1001',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_valid_session_1001',
          payment_status: 'paid',
          payment_intent: 'pi_test_valid_intent_1001',
          metadata: {
            orderId: testWebhookOrder._id.toString(),
            orderNumber: testWebhookOrder.orderNumber,
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'valid_test_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(eventPayload));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.paymentStatus, 'paid');
    assert.equal(res.body.data.status, 'Confirmed');

    const updated = await Order.findById(testWebhookOrder._id);
    assert.equal(updated.paymentStatus, 'paid');
    assert.equal(updated.status, 'Confirmed');
    assert.equal(updated.stripeSessionId, 'cs_test_valid_session_1001');
    assert.equal(updated.stripePaymentIntentId, 'pi_test_valid_intent_1001');
    assert.ok(updated.paidAt instanceof Date);
  });

  // 11. Duplicate successful webhook is idempotent
  await t.test('11. Duplicate successful webhook remains safe and idempotent', async () => {
    const updatedBefore = await Order.findById(testWebhookOrder._id);
    const paidAtBefore = updatedBefore.paidAt.getTime();
    const countBefore = await Order.countDocuments({ _id: testWebhookOrder._id });

    const duplicatePayload = {
      id: 'evt_test_1001_duplicate',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_valid_session_1001',
          payment_status: 'paid',
          payment_intent: 'pi_test_valid_intent_1001',
          metadata: {
            orderId: testWebhookOrder._id.toString(),
            orderNumber: testWebhookOrder.orderNumber,
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'valid_test_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(duplicatePayload));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.alreadyPaid, true);

    const updatedAfter = await Order.findById(testWebhookOrder._id);
    assert.equal(updatedAfter.paidAt.getTime(), paidAtBefore);
    assert.equal(updatedAfter.paymentStatus, 'paid');
    assert.equal(updatedAfter.status, 'Confirmed');

    const countAfter = await Order.countDocuments({ _id: testWebhookOrder._id });
    assert.equal(countAfter, countBefore);
  });

  // 12. Unknown order metadata does not mark any order paid
  await t.test('12. Unknown order metadata does not mark any order paid', async () => {
    const unknownPayload = {
      id: 'evt_test_unknown',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_unknown_session',
          payment_status: 'paid',
          payment_intent: 'pi_test_unknown_intent',
          metadata: {
            orderId: '6ab4d5efb8c5edb49b7c7999',
            orderNumber: 'OK-99999999-9999',
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'valid_test_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(unknownPayload));

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Referenced order not found/i);
  });

  // 13. Session/order mismatch does not mark order paid
  await t.test('13. Session/order mismatch does not mark order paid', async () => {
    const pendingOrder = await Order.create({
      orderNumber: `OK-${Date.now().toString().slice(-8)}-1002`,
      customer: {
        name: 'Mona Al Kaabi',
        email: 'mona@example.com',
        phone: '+971501230002',
      },
      deliveryAddress: {
        emirate: 'Dubai',
      },
      items: [
        {
          product: productB._id,
          name: productB.name,
          quantity: 1,
          price: 100,
          subtotal: 100,
        },
      ],
      subtotal: 100,
      deliveryFee: 35,
      discount: 0,
      total: 135,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      status: 'Pending',
      stripeSessionId: 'cs_test_original_session_1002',
    });

    const mismatchPayload = {
      id: 'evt_test_mismatch',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_DIFFERENT_session_9999',
          payment_status: 'paid',
          payment_intent: 'pi_test_mismatch',
          metadata: {
            orderId: pendingOrder._id.toString(),
            orderNumber: pendingOrder.orderNumber,
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'valid_test_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(mismatchPayload));

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Stripe session ID does not match order record/i);

    const checkOrder = await Order.findById(pendingOrder._id);
    assert.equal(checkOrder.paymentStatus, 'pending');
    assert.equal(checkOrder.status, 'Pending');
  });

  // 14. Incomplete/unpaid session remains pending
  await t.test('14. Incomplete/unpaid session remains pending', async () => {
    const unpaidOrder = await Order.create({
      orderNumber: `OK-${Date.now().toString().slice(-8)}-1003`,
      customer: {
        name: 'Omar Al Zaabi',
        email: 'omar@example.com',
        phone: '+971501230003',
      },
      deliveryAddress: {
        emirate: 'Sharjah',
      },
      items: [
        {
          product: productB._id,
          name: productB.name,
          quantity: 1,
          price: 100,
          subtotal: 100,
        },
      ],
      subtotal: 100,
      deliveryFee: 35,
      discount: 0,
      total: 135,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      status: 'Pending',
      stripeSessionId: 'cs_test_unpaid_session_1003',
    });

    const unpaidPayload = {
      id: 'evt_test_unpaid',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_unpaid_session_1003',
          payment_status: 'unpaid', // NOT paid yet
          payment_intent: 'pi_test_unpaid',
          metadata: {
            orderId: unpaidOrder._id.toString(),
            orderNumber: unpaidOrder.orderNumber,
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'valid_test_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(unpaidPayload));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /order remains pending/i);

    const checkOrder = await Order.findById(unpaidOrder._id);
    assert.equal(checkOrder.paymentStatus, 'pending');
    assert.equal(checkOrder.status, 'Pending');
  });

  // 15. checkout.session.expired does not become paid
  await t.test('15. checkout.session.expired does not become paid', async () => {
    const expiredOrder = await Order.create({
      orderNumber: `OK-${Date.now().toString().slice(-8)}-1004`,
      customer: {
        name: 'Hind Al Suwaidi',
        email: 'hind@example.com',
        phone: '+971501230004',
      },
      deliveryAddress: {
        emirate: 'Fujairah',
      },
      items: [
        {
          product: productB._id,
          name: productB.name,
          quantity: 1,
          price: 100,
          subtotal: 100,
        },
      ],
      subtotal: 100,
      deliveryFee: 35,
      discount: 0,
      total: 135,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      status: 'Pending',
      stripeSessionId: 'cs_test_expired_session_1004',
    });

    const expiredPayload = {
      id: 'evt_test_expired',
      type: 'checkout.session.expired',
      data: {
        object: {
          id: 'cs_test_expired_session_1004',
          metadata: {
            orderId: expiredOrder._id.toString(),
            orderNumber: expiredOrder.orderNumber,
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'valid_test_signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(expiredPayload));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /order remains unpaid/i);

    const checkOrder = await Order.findById(expiredOrder._id);
    assert.equal(checkOrder.paymentStatus, 'pending');
    assert.equal(checkOrder.status, 'Pending');
  });
});
