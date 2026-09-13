const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('Product creation, image array preservation, hero ordering, and update', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-product-test');
  process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-for-product-test-phase';

  const { connectDB, disconnectDB } = require('../config/database');
  const User = require('../models/User');
  const Product = require('../models/Product');
  const app = require('../app');

  await connectDB();
  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  // 1. Create admin user and login
  await User.create({
    name: 'Admin Tester',
    email: 'admintester@example.com',
    phone: '+971500000004',
    password: 'Password123!',
    role: 'admin',
  });

  const adminAgent = request.agent(app);
  const loginRes = await adminAgent.post('/api/v1/auth/login').send({
    email: 'admintester@example.com',
    password: 'Password123!',
  });
  assert.equal(loginRes.status, 200);

  // 2. Create product with multiple image URLs
  const createRes = await adminAgent.post('/api/v1/products').send({
    name: 'Royal Cambodian Oud',
    slug: 'royal-cambodian-oud',
    brand: 'Oud Kraft',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    fragranceFamily: 'Oud',
    size: '100 ml',
    price: 650,
    stock: 15,
    images: [
      'https://res.cloudinary.com/oudkraft/image/upload/v1/hero_photo.jpg',
      'https://res.cloudinary.com/oudkraft/image/upload/v1/bottle_side.jpg',
      'https://res.cloudinary.com/oudkraft/image/upload/v1/packaging.jpg',
    ],
  });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.success, true);
  const createdId = createRes.body.data._id;
  assert.equal(createRes.body.data.images.length, 3);
  assert.equal(createRes.body.data.images[0], 'https://res.cloudinary.com/oudkraft/image/upload/v1/hero_photo.jpg');

  // 3. Customer fetch product by slug (public endpoint)
  const getRes = await request(app).get('/api/v1/products/royal-cambodian-oud');
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.data.images[0], 'https://res.cloudinary.com/oudkraft/image/upload/v1/hero_photo.jpg');

  // 4. Update product to reorder images (choosing the 2nd photo as the new Hero Flacon)
  const reorderedImages = [
    'https://res.cloudinary.com/oudkraft/image/upload/v1/bottle_side.jpg', // Now hero
    'https://res.cloudinary.com/oudkraft/image/upload/v1/hero_photo.jpg',
    'https://res.cloudinary.com/oudkraft/image/upload/v1/packaging.jpg',
  ];

  const updateRes = await adminAgent.patch(`/api/v1/products/${createdId}`).send({
    images: reorderedImages,
  });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.images[0], 'https://res.cloudinary.com/oudkraft/image/upload/v1/bottle_side.jpg');

  // 5. Verify persistent update in database
  const dbProduct = await Product.findById(createdId).lean();
  assert.equal(dbProduct.images[0], 'https://res.cloudinary.com/oudkraft/image/upload/v1/bottle_side.jpg');
  assert.equal(dbProduct.images.length, 3);

  // 6. Verify legacy numeric image formatting works via public endpoint
  await Product.create({
    name: 'Legacy Oud',
    slug: 'legacy-oud',
    category: 'Eau de Parfum',
    gender: 'Unisex',
    price: 300,
    stock: 5,
    images: [1, 2], // legacy numeric indices
  });

  const legacyRes = await request(app).get('/api/v1/products/legacy-oud');
  assert.equal(legacyRes.status, 200);
  assert.equal(legacyRes.body.data.images[0], '/images/perfumes/perfume1.jpeg');
  assert.equal(legacyRes.body.data.images[1], '/images/perfumes/perfume2.jpeg');
});
