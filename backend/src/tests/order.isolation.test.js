const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('Customer Order Isolation and Authorization Verification', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-order-isolation-test');
  process.env.JWT_SECRET = 'secret-key-for-customer-order-isolation-tests-only';

  const { connectDB, disconnectDB } = require('../config/database');
  const User = require('../models/User');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const app = require('../app');

  await connectDB();

  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // Seed sample product
  const product = await Product.create({
    name: 'Royal Cambodian Oud',
    slug: 'royal-cambodian-oud',
    category: 'Dehn Al Oud',
    gender: 'Unisex',
    price: 350,
    stock: 20,
    images: ['https://example.com/royal.jpg'],
  });

  // Seed User Accounts: Customer A, Customer B, Admin
  const customerA = await User.create({
    name: 'Aisha Al Mansoori',
    email: 'aisha@example.com',
    phone: '+971501112233',
    password: 'Password123!',
    role: 'customer',
    isVerified: true,
    isActive: true,
  });

  const customerB = await User.create({
    name: 'Tariq Al Nuaimi',
    email: 'tariq@example.com',
    phone: '+971502223344',
    password: 'Password123!',
    role: 'customer',
    isVerified: true,
    isActive: true,
  });

  const adminUser = await User.create({
    name: 'Head of Operations',
    email: 'admin.orders@oudkraft.ae',
    phone: '+971503334455',
    password: 'Password123!',
    role: 'admin',
    isVerified: true,
    isActive: true,
  });

  // Obtain auth tokens
  const loginA = await request(app).post('/api/v1/auth/login').send({
    email: 'aisha@example.com',
    password: 'Password123!',
  });
  const tokenA = loginA.body.data.token;

  const loginB = await request(app).post('/api/v1/auth/login').send({
    email: 'tariq@example.com',
    password: 'Password123!',
  });
  const tokenB = loginB.body.data.token;

  const loginAdmin = await request(app).post('/api/v1/auth/login').send({
    email: 'admin.orders@oudkraft.ae',
    password: 'Password123!',
  });
  const tokenAdmin = loginAdmin.body.data.token;

  // Seed distinct orders for Customer A
  const orderA1 = await Order.create({
    orderNumber: 'OK-A1-1001',
    user: customerA._id,
    customer: {
      name: 'Aisha Al Mansoori',
      email: 'aisha@example.com',
      phone: '+971501112233',
    },
    deliveryAddress: { emirate: 'Abu Dhabi', street: 'Corniche' },
    items: [{ product: product._id, name: product.name, price: 350, quantity: 1, subtotal: 350 }],
    subtotal: 350,
    deliveryFee: 0,
    discount: 0,
    total: 350,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'Confirmed',
  });

  const orderA2 = await Order.create({
    orderNumber: 'OK-A2-1002',
    user: customerA._id,
    customer: {
      name: 'Aisha Al Mansoori',
      email: 'aisha@example.com',
      phone: '+971501112233',
    },
    deliveryAddress: { emirate: 'Abu Dhabi', street: 'Saadiyat' },
    items: [{ product: product._id, name: product.name, price: 350, quantity: 2, subtotal: 700 }],
    subtotal: 700,
    deliveryFee: 0,
    discount: 0,
    total: 700,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    status: 'Pending',
  });

  // Seed distinct order for Customer B
  const orderB1 = await Order.create({
    orderNumber: 'OK-B1-2001',
    user: customerB._id,
    customer: {
      name: 'Tariq Al Nuaimi',
      email: 'tariq@example.com',
      phone: '+971502223344',
    },
    deliveryAddress: { emirate: 'Dubai', street: 'Jumeirah' },
    items: [{ product: product._id, name: product.name, price: 350, quantity: 1, subtotal: 350 }],
    subtotal: 350,
    deliveryFee: 0,
    discount: 0,
    total: 350,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'Delivered',
  });

  // ========================================================
  // 1. Customer A receives ONLY Customer A's orders
  // ========================================================
  await t.test('1. Customer A receives only Customer A orders', async () => {
    const res = await request(app)
      .get('/api/v1/orders/my-orders')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 2);
    assert.equal(res.body.data.length, 2);

    const orderNumbers = res.body.data.map((o) => o.orderNumber);
    assert.ok(orderNumbers.includes('OK-A1-1001'));
    assert.ok(orderNumbers.includes('OK-A2-1002'));
    assert.ok(!orderNumbers.includes('OK-B1-2001'), 'Customer B order must NOT be present');
  });

  // ========================================================
  // 2. Customer B receives ONLY Customer B's orders
  // ========================================================
  await t.test('2. Customer B receives only Customer B orders', async () => {
    const res = await request(app)
      .get('/api/v1/orders/my-orders')
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data.length, 1);

    const orderNumbers = res.body.data.map((o) => o.orderNumber);
    assert.ok(orderNumbers.includes('OK-B1-2001'));
    assert.ok(!orderNumbers.includes('OK-A1-1001'), 'Customer A order must NOT be present');
    assert.ok(!orderNumbers.includes('OK-A2-1002'), 'Customer A order must NOT be present');
  });

  // ========================================================
  // 3. Customer A cannot retrieve Customer B orders by spoofing parameters
  // ========================================================
  await t.test('3. Query params or spoofed customer IDs are strictly ignored by server', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/my-orders?customerId=${customerB._id}&email=tariq@example.com`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    // Still only Customer A's 2 orders
    assert.equal(res.body.count, 2);
    const orderNumbers = res.body.data.map((o) => o.orderNumber);
    assert.ok(!orderNumbers.includes('OK-B1-2001'));
  });

  // ========================================================
  // 4. Unauthenticated request to /orders/my-orders is rejected
  // ========================================================
  await t.test('4. Unauthenticated request to /my-orders is rejected with 401', async () => {
    const res = await request(app).get('/api/v1/orders/my-orders');
    assert.equal(res.status, 401);
  });

  // ========================================================
  // 5. Customer A accessing own order by ID is allowed (200 OK)
  // ========================================================
  await t.test('5. Customer A accessing own order by ID succeeds with 200', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderA1._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.orderNumber, 'OK-A1-1001');
  });

  // ========================================================
  // 6. Customer A accessing Customer B's order by ID is rejected (403 Forbidden)
  // ========================================================
  await t.test('6. Customer A accessing Customer B order by ID is rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderB1._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Access denied|not have permission/i);
  });

  // ========================================================
  // 7. Unauthenticated request to individual order is rejected (401 Unauthorized)
  // ========================================================
  await t.test('7. Unauthenticated request to individual order is rejected with 401', async () => {
    const res = await request(app).get(`/api/v1/orders/${orderA1._id}`);
    assert.equal(res.status, 401);
  });

  // ========================================================
  // 8. Admin user accessing all orders (/orders) succeeds (200 OK)
  // ========================================================
  await t.test('8. Admin user accessing /orders retrieves all orders across customers', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 3);
  });

  // ========================================================
  // 9. Admin user accessing any customer's order by ID succeeds (200 OK)
  // ========================================================
  await t.test('9. Admin user can view any customer order by ID for operational management', async () => {
    const resA = await request(app)
      .get(`/api/v1/orders/${orderA1._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    assert.equal(resA.status, 200);

    const resB = await request(app)
      .get(`/api/v1/orders/${orderB1._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    assert.equal(resB.status, 200);
  });

  // ========================================================
  // 10. Authenticated order creation links order to authenticated customer
  // ========================================================
  await t.test('10. Order created with auth token links user account automatically', async () => {
    const createRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        customer: {
          name: 'Aisha Al Mansoori',
          email: 'aisha@example.com',
          phone: '+971501112233',
        },
        deliveryAddress: {
          emirate: 'Abu Dhabi',
          street: 'Al Bateen',
        },
        paymentMethod: 'card',
        items: [
          {
            product: product._id,
            quantity: 1,
          },
        ],
      });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.success, true);
    assert.equal(createRes.body.data.user, customerA._id.toString());
  });
});
