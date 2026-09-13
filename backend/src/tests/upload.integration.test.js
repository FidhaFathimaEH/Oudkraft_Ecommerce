const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('Upload endpoints: authentication, authorization, validation, and controlled configuration error', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-upload-test');
  process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-for-upload-test-phase';

  // Ensure Cloudinary credentials are empty for this test so we can test the controlled error
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  const { connectDB, disconnectDB } = require('../config/database');
  const User = require('../models/User');
  const app = require('../app');

  await connectDB();
  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // 1. Unauthenticated request should return 401
  const unauthRes = await request(app).post('/api/v1/uploads/image');
  assert.equal(unauthRes.status, 401);

  // 2. Create customer user and login
  await User.create({
    name: 'Regular Customer',
    email: 'customer@example.com',
    phone: '+971500000002',
    password: 'Password123!',
  });

  const customerAgent = request.agent(app);
  const customerLogin = await customerAgent.post('/api/v1/auth/login').send({
    email: 'customer@example.com',
    password: 'Password123!',
  });
  assert.equal(customerLogin.status, 200);

  // Non-admin customer should receive 403 Forbidden
  const customerUploadRes = await customerAgent
    .post('/api/v1/uploads/image')
    .attach('image', Buffer.from('fake image content'), 'test.jpg');
  assert.equal(customerUploadRes.status, 403);

  // 3. Create admin user and login
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+971500000003',
    password: 'Password123!',
    role: 'admin',
  });
  assert.equal(adminUser.role, 'admin');

  const adminAgent = request.agent(app);
  const adminLogin = await adminAgent.post('/api/v1/auth/login').send({
    email: 'admin@example.com',
    password: 'Password123!',
  });
  assert.equal(adminLogin.status, 200);

  // 4. Missing file in request should return 400 Bad Request
  const missingFileRes = await adminAgent.post('/api/v1/uploads/image');
  assert.equal(missingFileRes.status, 400);
  assert.match(missingFileRes.body.message, /Please provide an image file/i);

  // 5. Invalid file type (e.g. text file) should be rejected with 400
  const invalidTypeRes = await adminAgent
    .post('/api/v1/uploads/image')
    .attach('image', Buffer.from('plain text'), { filename: 'notes.txt', contentType: 'text/plain' });
  assert.equal(invalidTypeRes.status, 400);
  assert.match(invalidTypeRes.body.message, /Only JPEG, PNG, WebP/i);

  // 6. Valid image file when Cloudinary credentials are not configured should return controlled 503
  const dummyJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const missingConfigRes = await adminAgent
    .post('/api/v1/uploads/image')
    .attach('image', dummyJpg, { filename: 'perfume.jpg', contentType: 'image/jpeg' });
  assert.equal(missingConfigRes.status, 503);
  assert.match(missingConfigRes.body.message, /Cloudinary storage credentials are not configured/i);

  // 7. Multiple uploads endpoint with missing config returns controlled 503
  const missingConfigMultiRes = await adminAgent
    .post('/api/v1/uploads')
    .attach('images', dummyJpg, { filename: 'perfume1.jpg', contentType: 'image/jpeg' })
    .attach('images', dummyJpg, { filename: 'perfume2.jpg', contentType: 'image/jpeg' });
  assert.equal(missingConfigMultiRes.status, 503);
  assert.match(missingConfigMultiRes.body.message, /Cloudinary storage credentials are not configured/i);
});
