const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

test('authentication lifecycle: registration, login, protection, profile update, and password change', async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('oudkraft-auth-test');
  process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough';

  const { connectDB, disconnectDB } = require('../config/database');
  const app = require('../app');
  await connectDB();
  t.after(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  const agent = request.agent(app);
  const unauthenticatedProfile = await agent.get('/api/v1/users/profile');
  assert.equal(unauthenticatedProfile.status, 401);

  const registration = await agent.post('/api/v1/auth/register').send({
    name: 'Aisha Khan', email: 'aisha@example.com', phone: '+919876543210', password: 'SecurePass1',
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.body.success, true);
  assert.equal(registration.body.data.user.email, 'aisha@example.com');
  assert.equal(registration.body.data.user.password, undefined);

  const protectedProfile = await agent.get('/api/v1/users/profile');
  assert.equal(protectedProfile.status, 200);
  assert.equal(protectedProfile.body.data.user.name, 'Aisha Khan');

  const updated = await agent.put('/api/v1/users/profile').send({ name: 'Aisha Noor Khan', avatar: 'https://cdn.example.com/aisha.jpg' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.user.name, 'Aisha Noor Khan');

  const changed = await agent.put('/api/v1/users/change-password').send({ currentPassword: 'SecurePass1', newPassword: 'NewSecurePass2' });
  assert.equal(changed.status, 200);

  const afterChange = await agent.get('/api/v1/auth/me');
  assert.equal(afterChange.status, 401);

  const login = await agent.post('/api/v1/auth/login').send({ email: 'aisha@example.com', password: 'NewSecurePass2' });
  assert.equal(login.status, 200);
  assert.equal(login.body.data.user.password, undefined);

  const logout = await agent.post('/api/v1/auth/logout');
  assert.equal(logout.status, 200);
  const afterLogout = await agent.get('/api/v1/auth/me');
  assert.equal(afterLogout.status, 401);
});
