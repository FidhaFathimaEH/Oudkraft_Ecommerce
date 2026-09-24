const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('Order lifecycle and server-side calculation security', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-order-test');
  process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-for-order-test-phase';

  const { connectDB, disconnectDB } = require('../config/database');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const app = require('../app');

  await connectDB();
  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // Seed sample products
  const product1 = await Product.create({
    name: 'Musk Tahara Premium',
    slug: 'musk-tahara-premium',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    price: 200,
    stock: 25,
    images: ['https://example.com/musk.jpg'],
  });

  const product2 = await Product.create({
    name: 'Amber Sublime',
    slug: 'amber-sublime',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    price: 150,
    stock: 15,
    images: ['https://example.com/amber.jpg'],
  });

  // 1. Server calculates product subtotal from MongoDB prices
  await t.test('1. Server calculates product subtotal from MongoDB prices', async () => {
    // 2 x product1 (200 each) = 400 AED subtotal.
    // Subtotal >= 250 => deliveryFee is 0. Total = 400 AED.
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Khalid Al Hashemi',
          email: 'khalid@example.com',
          phone: '+971501239876',
        },
        deliveryAddress: {
          emirate: 'Dubai',
          street: 'Sheikh Zayed Rd',
        },
        items: [
          {
            product: product1._id,
            quantity: 2,
          },
        ],
        paymentMethod: 'card',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.subtotal, 400);
    assert.equal(res.body.data.total, 400);
    assert.equal(res.body.data.deliveryFee, 0);

    const saved = await Order.findById(res.body.data._id);
    assert.equal(saved.subtotal, 400);
    assert.equal(saved.items[0].price, 200);
    assert.equal(saved.items[0].subtotal, 400);
  });

  // 2. Client-provided subtotal is ignored
  await t.test('2. Client-provided subtotal is ignored', async () => {
    // 1 x product2 (150 AED). Subtotal is 150 AED.
    // Client sends subtotal: 10
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Nouf Al Mazrouei',
          email: 'nouf@example.com',
          phone: '+971505551234',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
        },
        items: [
          {
            product: product2._id,
            quantity: 1,
          },
        ],
        paymentMethod: 'card',
        subtotal: 10,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    // Subtotal must be authoritative 150 AED, NOT client's 10 AED
    assert.equal(res.body.data.subtotal, 150);

    const saved = await Order.findById(res.body.data._id);
    assert.equal(saved.subtotal, 150);
  });

  // 3. Client-provided total is ignored
  await t.test('3. Client-provided total is ignored', async () => {
    // 1 x product2 (150 AED). Delivery to Abu Dhabi: 20 AED. Total: 170 AED.
    // Client sends total: 1
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Sultan Al Qasimi',
          email: 'sultan@example.com',
          phone: '+971507778899',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
        },
        items: [
          {
            product: product2._id,
            quantity: 1,
          },
        ],
        paymentMethod: 'card',
        total: 1,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    // Total must be authoritative 170 AED, NOT client's 1 AED
    assert.equal(res.body.data.total, 170);

    const saved = await Order.findById(res.body.data._id);
    assert.equal(saved.total, 170);
  });

  // 4. Client-provided discount cannot arbitrarily reduce total
  await t.test('4. Client-provided discount cannot arbitrarily reduce total', async () => {
    // 1 x product1 (200 AED). Delivery to Abu Dhabi: 20 AED. Total should be 220 AED.
    // Client sends discount: 999
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Hessa Al Nuaimi',
          email: 'hessa@example.com',
          phone: '+971503332211',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
        },
        items: [
          {
            product: product1._id,
            quantity: 1,
          },
        ],
        paymentMethod: 'card',
        discount: 999,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    // Discount must be 0 (client value rejected), total must be 220 AED
    assert.equal(res.body.data.discount, 0);
    assert.equal(res.body.data.total, 220);

    const saved = await Order.findById(res.body.data._id);
    assert.equal(saved.discount, 0);
    assert.equal(saved.total, 220);
  });

  // 5. Client cannot mark payment as paid or order as Confirmed
  await t.test('5. Client cannot mark payment as paid or order as Confirmed', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Attacker Attempt',
          email: 'attacker@example.com',
          phone: '+971500009999',
        },
        deliveryAddress: {
          emirate: 'Dubai',
        },
        items: [
          {
            product: product1._id,
            quantity: 1,
          },
        ],
        paymentMethod: 'card',
        paymentStatus: 'paid',
        status: 'Confirmed',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    // Order MUST remain pending and Pending
    assert.equal(res.body.data.paymentStatus, 'pending');
    assert.equal(res.body.data.status, 'Pending');

    const saved = await Order.findById(res.body.data._id);
    assert.equal(saved.paymentStatus, 'pending');
    assert.equal(saved.status, 'Pending');
  });

  // 6. COD still works
  await t.test('6. COD still works and uses server-calculated amounts', async () => {
    // 1 x product1 (200 AED). Dubai delivery (35 AED). Total = 235 AED.
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        customer: {
          name: 'Hamdan Al Maktoum',
          email: 'hamdan@example.com',
          phone: '+971501114444',
        },
        deliveryAddress: {
          emirate: 'Dubai',
          street: 'Jumeirah Beach Road',
        },
        items: [
          {
            product: product1._id,
            quantity: 1,
          },
        ],
        paymentMethod: 'cash_on_delivery',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.paymentMethod, 'cash_on_delivery');
    assert.equal(res.body.data.paymentStatus, 'pending');
    assert.equal(res.body.data.status, 'Pending');
    assert.equal(res.body.data.subtotal, 200);
    assert.equal(res.body.data.deliveryFee, 35);
    assert.equal(res.body.data.total, 235);

    const saved = await Order.findById(res.body.data._id);
    assert.equal(saved.paymentMethod, 'cash_on_delivery');
    assert.equal(saved.paymentStatus, 'pending');
    assert.equal(saved.stripeSessionId, undefined);
  });
});
