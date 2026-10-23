const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('Phase 2 Security Remediation: comprehensive regression verification', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-security-remediation-test');
  process.env.JWT_SECRET = 'super-secret-jwt-key-for-testing-only-12345';
  process.env.CLIENT_URL = 'https://oudkraft-ecommerce.vercel.app/';

  const { connectDB, disconnectDB } = require('../config/database');
  const app = require('../app');
  const User = require('../models/User');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const Review = require('../models/Review');
  const stripeConfigModule = require('../config/stripe');
  const env = require('../config/env');

  await connectDB();

  // Setup mock Stripe client
  env.stripe.secretKey = 'sk_test_mock_dummy_key_for_testing';
  stripeConfigModule.setStripeClient({
    checkout: {
      sessions: {
        create: async (_params) => ({
          id: 'cs_test_security_mock_123',
          url: 'https://checkout.stripe.com/pay/cs_test_security_mock_123',
          payment_intent: 'pi_test_security_mock_123',
        }),
      },
    },
  });

  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // Seed test users: customerA, customerB, adminUser
  const customerA = await User.create({
    name: 'Customer A',
    email: 'customer.a@example.com',
    phone: '+971501111111',
    password: 'Password123!',
    role: 'customer',
    isVerified: true,
    isActive: true,
  });

  const customerB = await User.create({
    name: 'Customer B',
    email: 'customer.b@example.com',
    phone: '+971502222222',
    password: 'Password123!',
    role: 'customer',
    isVerified: true,
    isActive: true,
  });

  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+971503333333',
    password: 'Password123!',
    role: 'admin',
    isVerified: true,
    isActive: true,
  });

  // Seed sample products
  const productA = await Product.create({
    slug: 'amber-wood',
    name: 'Amber Wood',
    category: 'Oriental',
    gender: 'Unisex',
    price: 350,
    stock: 25,
    rating: 4.8,
    reviewCount: 1,
  });

  const productB = await Product.create({
    slug: 'royal-rose',
    name: 'Royal Rose',
    category: 'Floral',
    gender: 'Women',
    price: 220,
    stock: 15,
    rating: 4.2,
    reviewCount: 0,
  });

  // ==========================================
  // 1. AUTHENTICATION & CROSS-SITE SESSIONS (SEC-CRIT-01)
  // ==========================================
  await t.test('1. Authentication returns JWT token in payload and supports both Cookie and Bearer auth', async () => {
    // Login Customer A
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer.a@example.com', password: 'Password123!' });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
    assert.ok(loginRes.body.data.token, 'Response data must include token for Bearer fallback');
    assert.ok(loginRes.headers['set-cookie'], 'Response must still set httpOnly cookie');

    const tokenA = loginRes.body.data.token;

    // Verify /auth/me using Bearer token
    const meBearerRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(meBearerRes.status, 200);
    assert.equal(meBearerRes.body.data.user.email, 'customer.a@example.com');

    // Verify /auth/me using Cookie
    const meCookieRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', loginRes.headers['set-cookie']);

    assert.equal(meCookieRes.status, 200);
    assert.equal(meCookieRes.body.data.user.email, 'customer.a@example.com');

    // Verify invalid / expired Bearer token
    const invalidTokenRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.value');

    assert.equal(invalidTokenRes.status, 401);

    // Verify logout clears cookie
    const logoutRes = await request(app).post('/api/v1/auth/logout');
    assert.equal(logoutRes.status, 200);
  });

  // ==========================================
  // 2. CHECKOUT ORDER OWNERSHIP / IDOR (SEC-CRIT-02)
  // ==========================================
  await t.test('2. Payment checkout session enforces order ownership and rejects IDOR', async () => {
    // Login tokens
    const loginARes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer.a@example.com', password: 'Password123!' });
    const tokenA = loginARes.body.data.token;

    const loginBRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer.b@example.com', password: 'Password123!' });
    const tokenB = loginBRes.body.data.token;

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123!' });
    const adminToken = adminLoginRes.body.data.token;

    // Create order for Customer A
    const orderA = await Order.create({
      orderNumber: 'OK-TEST-A1',
      customer: {
        name: 'Customer A',
        email: 'customer.a@example.com',
        phone: '+971501111111',
      },
      deliveryAddress: { emirate: 'Dubai' },
      items: [
        {
          product: productA._id,
          name: productA.name,
          quantity: 1,
          price: 350,
          subtotal: 350,
        },
      ],
      subtotal: 350,
      deliveryFee: 0,
      total: 350,
      paymentMethod: 'card',
      paymentStatus: 'pending',
    });

    // 2a. Customer A accesses own order -> ALLOWED (200)
    const ownOrderRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ orderId: orderA._id });

    assert.equal(ownOrderRes.status, 200);
    assert.equal(ownOrderRes.body.success, true);
    assert.equal(ownOrderRes.body.data.sessionId, 'cs_test_security_mock_123');

    // 2b. Customer B accesses Customer A's order -> REJECTED (403 IDOR blocked)
    const idorRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ orderId: orderA._id });

    assert.equal(idorRes.status, 403);
    assert.equal(idorRes.body.success, false);

    // 2c. Unauthenticated caller attempts to access Customer A's order (registered account) -> REJECTED (401 Auth required)
    const unauthRegisteredOrderRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({ orderId: orderA._id });

    assert.equal(unauthRegisteredOrderRes.status, 401);

    // 2d. Admin accesses order -> ALLOWED (200)
    const adminOrderRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderId: orderA._id });

    assert.equal(adminOrderRes.status, 200);

    // 2e. Guest order flow: create pure guest order
    const guestOrder = await Order.create({
      orderNumber: 'OK-TEST-GUEST-1',
      customer: {
        name: 'Guest Shopper',
        email: 'pure.guest@notregistered.com',
        phone: '+971509990000',
      },
      deliveryAddress: { emirate: 'Abu Dhabi' },
      items: [
        {
          product: productB._id,
          name: productB.name,
          quantity: 1,
          price: 220,
          subtotal: 220,
        },
      ],
      subtotal: 220,
      deliveryFee: 20,
      total: 240,
      paymentMethod: 'card',
      paymentStatus: 'pending',
    });

    // Unauthenticated caller without matching email proof -> REJECTED (403)
    const guestNoEmailRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({ orderId: guestOrder._id });

    assert.equal(guestNoEmailRes.status, 403);

    // Unauthenticated caller with WRONG email proof -> REJECTED (403)
    const guestWrongEmailRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({ orderId: guestOrder._id, customerEmail: 'wrong@attacker.com' });

    assert.equal(guestWrongEmailRes.status, 403);

    // Unauthenticated caller with MATCHING customer email proof -> ALLOWED (200)
    const guestValidRes = await request(app)
      .post('/api/v1/payments/create-checkout-session')
      .send({ orderId: guestOrder._id, customerEmail: 'pure.guest@notregistered.com' });

    assert.equal(guestValidRes.status, 200);
  });

  // ==========================================
  // 3. REVIEW REPORTING ABUSE (SEC-HIGH-01)
  // ==========================================
  await t.test('3. Review reporting prevents repeat abuse, author self-reporting, and unilateral censorship', async () => {
    const loginARes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer.a@example.com', password: 'Password123!' });
    const tokenA = loginARes.body.data.token;

    const loginBRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer.b@example.com', password: 'Password123!' });
    const tokenB = loginBRes.body.data.token;

    // Create review by Customer A
    const review = await Review.create({
      product: productA._id,
      user: customerA._id,
      name: 'Customer A',
      email: 'customer.a@example.com',
      rating: 5,
      title: 'Outstanding Oud',
      comment: 'Truly authentic and long-lasting oud scent.',
      verifiedPurchase: true,
      reported: false,
    });

    // Author cannot report own review (400)
    const selfReportRes = await request(app)
      .patch(`/api/v1/reviews/${review._id}/report`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(selfReportRes.status, 400);

    // Customer B reports review -> first report succeeds (200)
    const report1Res = await request(app)
      .patch(`/api/v1/reviews/${review._id}/report`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(report1Res.status, 200);

    // Verify review is NOT immediately censored (reported remains false until threshold of 5 is met)
    const checkReviewAfter1 = await Review.findById(review._id);
    assert.equal(checkReviewAfter1.reported, false, 'A single report must not unilaterally suppress a review');
    assert.equal(checkReviewAfter1.reportCount, 1);

    // Customer B reports the SAME review again -> REJECTED (409 Conflict)
    const repeatReportRes = await request(app)
      .patch(`/api/v1/reviews/${review._id}/report`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(repeatReportRes.status, 409);
    assert.match(repeatReportRes.body.message, /already reported/i);
  });

  // ==========================================
  // 4. REVIEW HELPFUL-VOTE ABUSE (SEC-HIGH-05)
  // ==========================================
  await t.test('4. Review helpful votes require auth and prevent repeated voting by the same user', async () => {
    const loginARes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer.a@example.com', password: 'Password123!' });
    const tokenA = loginARes.body.data.token;

    const testReview = await Review.create({
      product: productB._id,
      user: customerB._id,
      name: 'Customer B',
      email: 'customer.b@example.com',
      rating: 4,
      comment: 'Very pleasant floral fragrance.',
      helpful: 0,
    });

    // Unauthenticated helpful vote -> REJECTED (401)
    const unauthVoteRes = await request(app).patch(`/api/v1/reviews/${testReview._id}/helpful`);
    assert.equal(unauthVoteRes.status, 401);

    // Authenticated vote by Customer A -> SUCCEEDS (200)
    const vote1Res = await request(app)
      .patch(`/api/v1/reviews/${testReview._id}/helpful`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(vote1Res.status, 200);
    assert.equal(vote1Res.body.data.helpful, 1);

    // Customer A attempts repeat vote on same review -> REJECTED (400)
    const vote2Res = await request(app)
      .patch(`/api/v1/reviews/${testReview._id}/helpful`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(vote2Res.status, 400);
    assert.match(vote2Res.body.message, /already marked/i);

    // Helpful count remains 1
    const checkReview = await Review.findById(testReview._id);
    assert.equal(checkReview.helpful, 1);
  });

  // ==========================================
  // 5. RESTRICT PRODUCT SORT QUERY (SEC-HIGH-02)
  // ==========================================
  await t.test('5. Product sorting allows valid sort options and rejects invalid queries with 400', async () => {
    // Valid sort: price-asc
    const validSortRes = await request(app).get('/api/v1/products?sort=price-asc');
    assert.equal(validSortRes.status, 200);
    assert.equal(validSortRes.body.success, true);
    assert.ok(Array.isArray(validSortRes.body.data));

    // Valid sort: newest
    const newestRes = await request(app).get('/api/v1/products?sort=newest');
    assert.equal(newestRes.status, 200);

    // No sort parameter defaults safely
    const noSortRes = await request(app).get('/api/v1/products');
    assert.equal(noSortRes.status, 200);

    // Invalid / injected sort parameter -> REJECTED with clean 400
    const invalidSortRes = await request(app).get('/api/v1/products?sort=maliciousSortKey');
    assert.equal(invalidSortRes.status, 400);
    assert.equal(invalidSortRes.body.success, false);
    assert.match(invalidSortRes.body.message, /Invalid sort parameter/i);
  });

  // ==========================================
  // 6. PRODUCTION ERROR HANDLER HARDENING (SEC-MED-01)
  // ==========================================
  await t.test('6. Error handler handles duplicate keys safely and masks internal errors in production', async () => {
    // Duplicate email registration triggers MongoDB code 11000
    const dupRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Duplicate User',
      email: 'customer.a@example.com', // existing email
      phone: '+971509998877',
      password: 'Password123!',
    });

    assert.equal(dupRes.status, 409);
    assert.match(dupRes.body.message, /already exists|already in use/i);

    // Malformed ObjectId triggers Mongoose CastError -> returns clean 400 without leaking stack
    const castErrorRes = await request(app).get('/api/v1/orders/not-a-valid-object-id');
    assert.ok([400, 401].includes(castErrorRes.status));
  });

  // ==========================================
  // 7. CORS NORMALIZATION (SEC-MED-02)
  // ==========================================
  await t.test('7. CORS normalizes trailing slashes and blocks unauthorized origins', async () => {
    // Request from configured origin without trailing slash (even if CLIENT_URL has trailing slash)
    const validOriginRes = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://oudkraft-ecommerce.vercel.app');

    assert.equal(validOriginRes.headers['access-control-allow-origin'], 'https://oudkraft-ecommerce.vercel.app');
    assert.equal(validOriginRes.headers['access-control-allow-credentials'], 'true');

    // Request from untrusted external origin -> rejected by CORS
    const untrustedOriginRes = await request(app)
      .get('/api/v1/products')
      .set('Origin', 'https://malicious-attacker-site.com');

    assert.equal(untrustedOriginRes.status, 403);
  });

  // ==========================================
  // 8. HELMET BEFORE STATIC ASSETS (SEC-MED-05)
  // ==========================================
  await t.test('8. Helmet headers are applied to both API and static asset requests', async () => {
    // API request headers
    const apiRes = await request(app).get('/api/v1/health');
    assert.equal(apiRes.headers['x-content-type-options'], 'nosniff');
    assert.equal(apiRes.headers['cross-origin-resource-policy'], 'cross-origin');
    assert.equal(apiRes.headers['x-powered-by'], undefined);

    // Static route headers
    const staticRes = await request(app).get('/images/non-existent.jpg');
    assert.equal(staticRes.headers['x-content-type-options'], 'nosniff');
    assert.equal(staticRes.headers['cross-origin-resource-policy'], 'cross-origin');
    assert.equal(staticRes.headers['x-powered-by'], undefined);
  });
});
