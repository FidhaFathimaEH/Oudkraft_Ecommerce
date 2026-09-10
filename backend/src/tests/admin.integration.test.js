const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('Phase 1 Admin: default role, role preservation, and admin middleware protection', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-admin-test');
  process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-for-admin-phase';

  const { connectDB, disconnectDB } = require('../config/database');
  const User = require('../models/User');
  const app = require('../app');
  
  await connectDB();
  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // 1. Verify default role is 'customer'
  const customerUser = await User.create({
    name: 'Customer Bob',
    email: 'bob@example.com',
    phone: '+971500000001',
    password: 'Password123!',
  });
  assert.equal(customerUser.role, 'customer');

  // 2. Verify that toSafeObject preserves role
  const safeObj = customerUser.toSafeObject();
  assert.equal(safeObj.role, 'customer');
  assert.equal(safeObj.password, undefined);

  // 3. Login to get agent cookie
  const agent = request.agent(app);
  const loginRes = await agent.post('/api/v1/auth/login').send({
    email: 'bob@example.com',
    password: 'Password123!',
  });
  assert.equal(loginRes.status, 200);
  
  // 4. Test admin middleware - access denied for standard customer (403)
  const forbiddenRes = await agent.get('/api/v1/admin/verify');
  assert.equal(forbiddenRes.status, 403);
  assert.equal(forbiddenRes.body.success, false);
  assert.match(forbiddenRes.body.message, /Access denied/);

  // 5. Test admin middleware - unauthenticated access denied (401)
  const unauthAgent = request(app);
  const unauthRes = await unauthAgent.get('/api/v1/admin/verify');
  assert.equal(unauthRes.status, 401);

  // 6. Promote customer to admin and check role preservation and middleware access
  const dbUser = await User.findOne({ email: 'bob@example.com' }).select('+role');
  dbUser.role = 'admin';
  await dbUser.save();

  // Verify role is saved and toSafeObject preserves 'admin' role
  const updatedSafeObj = dbUser.toSafeObject();
  assert.equal(updatedSafeObj.role, 'admin');

  // 7. Login again as Bob (now admin) and access the admin route successfully
  const adminAgent = request.agent(app);
  const adminLogin = await adminAgent.post('/api/v1/auth/login').send({
    email: 'bob@example.com',
    password: 'Password123!',
  });
  assert.equal(adminLogin.status, 200);
  assert.equal(adminLogin.body.data.user.role, 'admin');

  const adminRouteRes = await adminAgent.get('/api/v1/admin/verify');
  assert.equal(adminRouteRes.status, 200);
  assert.equal(adminRouteRes.body.success, true);
  assert.equal(adminRouteRes.body.message, 'Admin access verified');
});
