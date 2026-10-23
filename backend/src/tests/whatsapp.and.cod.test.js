const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('WhatsApp ordering and Cash on Delivery (COD) launch verification', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-launch-test');
  process.env.JWT_SECRET = 'launch-test-secret-long-enough-for-auth-token-67890';
  delete process.env.STRIPE_SECRET_KEY; // Ensure Stripe key is completely absent

  const { connectDB, disconnectDB } = require('../config/database');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const app = require('../app');

  await connectDB();
  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // Seed sample products with known prices
  const perfumeA = await Product.create({
    name: 'Royal Cambodian Oud',
    slug: 'royal-cambodian-oud',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    price: 450,
    stock: 20,
    images: ['https://example.com/royal-oud.jpg'],
  });

  const perfumeB = await Product.create({
    name: 'Desert Rose & Amber',
    slug: 'desert-rose-amber',
    category: 'Extrait de Parfum',
    gender: 'Women',
    price: 180,
    stock: 15,
    images: ['https://example.com/desert-rose.jpg'],
  });

  // 1. Single product COD order creates pending/unpaid order with server-calculated price
  await t.test('1. COD order creates successfully in database with pending status and server pricing', async () => {
    // 1 x perfumeB (180 AED) to Abu Dhabi (fee: 20 AED). Total = 200 AED.
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Fatima Al Zaabi',
          email: 'fatima.zaabi@example.com',
          phone: '+971501234567',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
          area: 'Al Bateen',
          street: 'King Abdullah Bin Abdulaziz Al Saud St',
          building: 'Villa 14',
          apartment: 'Ground Floor',
          instructions: 'Call upon arrival',
        },
        items: [
          {
            product: perfumeB._id,
            size: '100 ml',
            quantity: 1,
            // Malicious/tampered client price should be rejected/ignored
            price: 5,
          },
        ],
        paymentMethod: 'cash_on_delivery',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.paymentMethod, 'cash_on_delivery');
    assert.equal(res.body.data.paymentStatus, 'pending');
    assert.equal(res.body.data.status, 'Pending');
    assert.equal(res.body.data.subtotal, 180);
    assert.equal(res.body.data.deliveryFee, 20);
    assert.equal(res.body.data.total, 200);

    const savedOrder = await Order.findById(res.body.data._id);
    assert.ok(savedOrder);
    assert.equal(savedOrder.orderNumber.startsWith('OK-'), true);
    assert.equal(savedOrder.paymentMethod, 'cash_on_delivery');
    assert.equal(savedOrder.paymentStatus, 'pending');
    assert.equal(savedOrder.status, 'Pending');
    assert.equal(savedOrder.items[0].price, 180);
    assert.equal(savedOrder.total, 200);
  });

  // 2. Multi-item COD order correctly applies free delivery threshold server-side
  await t.test('2. Multi-item COD order applies free delivery threshold over 250 AED', async () => {
    // 1 x perfumeA (450 AED) + 2 x perfumeB (180*2 = 360 AED) = 810 AED.
    // Subtotal >= 250 => deliveryFee = 0. Total = 810 AED.
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Mansoor Al Nuaimi',
          email: 'mansoor@example.com',
          phone: '+971509988776',
        },
        deliveryAddress: {
          emirate: 'Sharjah',
          street: 'Al Majaz Waterfront',
        },
        items: [
          { product: perfumeA._id, quantity: 1 },
          { product: perfumeB._id, quantity: 2 },
        ],
        paymentMethod: 'cash_on_delivery',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.subtotal, 810);
    assert.equal(res.body.data.deliveryFee, 0);
    assert.equal(res.body.data.total, 810);
  });

  // 3. Application functions smoothly and rejects Stripe session when credentials absent
  await t.test('3. Checkout session endpoint returns clean 503 without crashing when Stripe absent', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({
        customer: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+971501112233',
        },
        deliveryAddress: { emirate: 'Dubai' },
        items: [{ product: perfumeA._id, quantity: 1 }],
      });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Stripe payment gateway is currently unavailable/i);
  });
});
