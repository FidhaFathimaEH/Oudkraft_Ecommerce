const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { generateInvoicePdf, getOrGenerateInvoiceNumber } = require('../services/invoiceService');

let mongoServer;
let adminToken;
let customerToken;
let testProduct;

test('Branded PDF Invoice Generator and Admin WhatsApp Workflow', async (t) => {
  t.before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create Admin User
    await User.create({
      name: 'Oud Kraft Admin',
      email: 'admin@oudkraft.ae',
      phone: '+971509990001',
      password: 'Password123!',
      role: 'admin',
    });

    // Create Normal Customer User
    await User.create({
      name: 'Fatima Al Mansoori',
      email: 'fatima@client.ae',
      phone: '+971509990002',
      password: 'Password123!',
      role: 'customer',
    });

    // Generate tokens via login
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@oudkraft.ae', password: 'Password123!' });
    adminToken = adminLogin.body.token || adminLogin.body.data?.token;

    const customerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'fatima@client.ae', password: 'Password123!' });
    customerToken = customerLogin.body.token || customerLogin.body.data?.token;

    // Create a catalog test product
    testProduct = await Product.create({
      name: 'Royal Cambodian Oud Extract',
      slug: 'royal-cambodian-oud-extract',
      sku: 'OK-RCO-100',
      description: 'Aged wild Cambodian agarwood oil crafted with exquisite artisanal distillation.',
      price: 650,
      stock: 25,
      category: 'Oud Oils',
      gender: 'Unisex',
      size: '100 ml',
      images: ['https://oudkraft.ae/images/cambodian-oud.jpg'],
    });
  });

  t.after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  await t.test('1. Invoice Service: Generates valid PDF buffer for single item order', async () => {
    const mockOrder = {
      orderNumber: 'OK-20261023-1001',
      createdAt: new Date(),
      customer: {
        name: 'Rashid Al Nuaimi',
        phone: '+971 50 111 2233',
        email: 'rashid@client.ae',
      },
      deliveryAddress: {
        emirate: 'Abu Dhabi',
        area: 'Al Bateen',
        street: 'Corniche West St',
        building: 'Villa 14',
      },
      items: [
        {
          name: 'Royal Cambodian Oud Extract',
          size: '100 ml',
          quantity: 1,
          price: 650,
          subtotal: 650,
          sku: 'OK-RCO-100',
        },
      ],
      subtotal: 650,
      deliveryFee: 0,
      discount: 0,
      total: 650,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'Confirmed',
    };

    const result = await generateInvoicePdf(mockOrder);

    assert.ok(result.buffer instanceof Buffer);
    assert.ok(result.buffer.length > 1000);

    // Verify PDF Magic Header (%PDF-) and EOF
    const pdfHeader = result.buffer.subarray(0, 5).toString('ascii');
    assert.equal(pdfHeader, '%PDF-');
    assert.ok(result.buffer.includes(Buffer.from('%%EOF')));

    // Verify PDF structure contains page catalog and font resources
    const pdfString = result.buffer.toString('latin1');
    assert.ok(pdfString.includes('/Type /Page'));
    assert.ok(pdfString.includes('/Type /Catalog'));
    assert.ok(pdfString.includes('Oud Kraft Invoice'));
    assert.ok(pdfString.includes('Oud Kraft Perfumes LLC'));
    assert.equal(result.invoiceNumber.startsWith('INV-'), true);
  });

  await t.test('2. Invoice Service: Multi-item order with discounts, delivery fee, and stable invoice numbers', async () => {
    const mockOrder = {
      orderNumber: 'OK-20261023-1002',
      createdAt: new Date('2026-10-23T14:30:00Z'),
      customer: {
        name: 'Mariam Al Qubaisi',
        phone: '+971 52 444 5566',
        email: 'mariam@client.ae',
      },
      deliveryAddress: {
        emirate: 'Dubai',
        area: 'Downtown Dubai',
        street: 'Financial Center Rd',
        building: 'Burj Residences',
        apartment: 'Suite 2401',
      },
      items: [
        {
          name: 'Taif Rose Sublime',
          size: '50 ml',
          quantity: 2,
          price: 320,
          subtotal: 640,
        },
        {
          name: 'Ambergris Imperial',
          size: '100 ml',
          quantity: 1,
          price: 480,
          subtotal: 480,
        },
      ],
      subtotal: 1120,
      deliveryFee: 0, // >= 250 AED Free
      discount: 100,
      total: 1020,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'Confirmed',
    };

    const invoiceNum1 = getOrGenerateInvoiceNumber(mockOrder);
    const invoiceNum2 = getOrGenerateInvoiceNumber(mockOrder);
    assert.equal(invoiceNum1, invoiceNum2, 'Invoice numbers must be deterministic and stable');
    assert.ok(invoiceNum1.startsWith('INV-2026-'));

    const result = await generateInvoicePdf(mockOrder);
    assert.equal(result.invoiceNumber, invoiceNum1);
    assert.ok(result.buffer instanceof Buffer);
    assert.equal(result.buffer.subarray(0, 5).toString('ascii'), '%PDF-');
    assert.ok(result.buffer.includes(Buffer.from('%%EOF')));
  });

  await t.test('3. Invoice Service: Handles multipage items and long descriptions without clipping', async () => {
    const longItems = [];
    for (let i = 1; i <= 15; i++) {
      longItems.push({
        name: `Oud Kraft Artisanal Reserve Perfume Blend Edition ${i} - Extended Maceration Formula`,
        size: '100 ml',
        quantity: 1,
        price: 350,
        subtotal: 350,
        sku: `OK-EXT-${100 + i}`,
      });
    }

    const mockOrder = {
      orderNumber: 'OK-20261023-LONG',
      createdAt: new Date(),
      customer: {
        name: 'Sultan Mohammed bin Rashid Al Maktoum Cultural Foundation VIP Concierge Office',
        phone: '+971 50 999 8877',
      },
      deliveryAddress: {
        emirate: 'Abu Dhabi',
        area: 'Saadiyat Cultural District',
        street: 'Museum Way Boulevard',
        building: 'Palace Pavilion North Wing Reception Building Gate 3',
        instructions: 'Deliver strictly to VIP reception concierge desk between 10am and 4pm.',
      },
      items: longItems,
      subtotal: 15 * 350,
      deliveryFee: 0,
      discount: 0,
      total: 15 * 350,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'Confirmed',
    };

    const result = await generateInvoicePdf(mockOrder);
    assert.ok(result.buffer.length > 2000);

    const pdfString = result.buffer.toString('latin1');
    const pageMatches = (pdfString.match(/\/Type \/Page\b/g) || []).length;
    assert.ok(pageMatches >= 2, `Multipage invoice should contain at least 2 pages, found ${pageMatches}`);
  });

  await t.test('4. Security: Rejects invoice download without authentication (401)', async () => {
    // Create an order in DB
    const order = await Order.create({
      orderNumber: 'OK-TEST-SEC-1',
      customer: { name: 'Test Client', phone: '+971501234567', email: 'test@sec.com' },
      deliveryAddress: { emirate: 'Abu Dhabi' },
      items: [{ product: testProduct._id, name: 'Royal Cambodian Oud', size: '100 ml', quantity: 1, price: 650, subtotal: 650 }],
      subtotal: 650,
      deliveryFee: 0,
      total: 650,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'Confirmed',
    });

    const res = await request(app).get(`/api/v1/orders/${order._id}/invoice`);
    assert.equal(res.status, 401);
  });

  await t.test('5. Security: Rejects invoice download by normal non-admin customer (403)', async () => {
    const order = await Order.create({
      orderNumber: 'OK-TEST-SEC-2',
      customer: { name: 'Customer Two', phone: '+971501234568', email: 'two@sec.com' },
      deliveryAddress: { emirate: 'Dubai' },
      items: [{ product: testProduct._id, name: 'Royal Cambodian Oud', size: '100 ml', quantity: 1, price: 650, subtotal: 650 }],
      subtotal: 650,
      deliveryFee: 0,
      total: 650,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'Confirmed',
    });

    const res = await request(app)
      .get(`/api/v1/orders/${order._id}/invoice`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.equal(res.status, 403, 'Normal customer must not be able to generate or download invoices');
  });

  await t.test('6. API: Admin successfully downloads invoice with correct headers and persistence', async () => {
    const order = await Order.create({
      orderNumber: 'OK-TEST-ADMIN-1',
      customer: { name: 'Hazza Al Mansoori', phone: '+971508889999', email: 'hazza@space.ae' },
      deliveryAddress: { emirate: 'Abu Dhabi', area: 'Al Marina', street: 'Corniche' },
      items: [{ product: testProduct._id, name: 'Royal Cambodian Oud Extract', size: '100 ml', quantity: 2, price: 650, subtotal: 1300 }],
      subtotal: 1300,
      deliveryFee: 0,
      total: 1300,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'Confirmed',
    });

    const res = await request(app)
      .get(`/api/v1/orders/${order._id}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'application/pdf');
    assert.ok(res.headers['content-disposition'].includes('attachment; filename="Oud-Kraft-Invoice-'));
    assert.ok(res.body instanceof Buffer);

    // Verify invoice number was persisted in DB
    const updatedOrder = await Order.findById(order._id);
    assert.ok(updatedOrder.invoiceNumber);
    assert.ok(updatedOrder.invoiceIssuedAt);

    const firstInvoiceNumber = updatedOrder.invoiceNumber;

    // Subsequent download must preserve the exact same invoice number
    const res2 = await request(app)
      .get(`/api/v1/orders/${order._id}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res2.status, 200);
    assert.ok(res2.headers['content-disposition'].includes(`Oud-Kraft-Invoice-${firstInvoiceNumber}.pdf`));

    const checkOrderAgain = await Order.findById(order._id);
    assert.equal(checkOrderAgain.invoiceNumber, firstInvoiceNumber, 'Invoice number must remain identical upon re-download');
  });

  await t.test('7. API: Rejects cancelled order invoice generation with 400', async () => {
    const cancelledOrder = await Order.create({
      orderNumber: 'OK-CANCELLED-1',
      customer: { name: 'Cancelled Order Client', phone: '+971501110000', email: 'cancelled@client.ae' },
      deliveryAddress: { emirate: 'Sharjah' },
      items: [{ product: testProduct._id, name: 'Royal Cambodian Oud', size: '100 ml', quantity: 1, price: 650, subtotal: 650 }],
      subtotal: 650,
      deliveryFee: 0,
      total: 650,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: 'Cancelled',
    });

    const res = await request(app)
      .get(`/api/v1/orders/${cancelledOrder._id}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('cancelled order'));
  });

  await t.test('8. Admin Workflow: Record confirmed WhatsApp order and immediately generate invoice', async () => {
    const whatsappPayload = {
      customer: {
        name: 'Shaikha Al Nahyan',
        phone: '+971 50 777 6655',
        email: 'concierge.client@palace.ae',
      },
      deliveryAddress: {
        emirate: 'Abu Dhabi',
        area: 'Al Karamah',
        street: 'Delma St',
        building: 'Royal Residence',
      },
      items: [
        {
          name: 'Artisanal Cambodian Oud Pure',
          size: '100 ml',
          quantity: 2,
          price: 750,
        },
      ],
      deliveryFee: 0,
      discount: 50,
      notes: 'Confirmed via WhatsApp concierge chat at 3:15 PM.',
    };

    const recordRes = await request(app)
      .post('/api/v1/orders/admin-record')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(whatsappPayload);

    assert.equal(recordRes.status, 201);
    assert.equal(recordRes.body.success, true);
    assert.equal(recordRes.body.data.customer.name, 'Shaikha Al Nahyan');
    assert.equal(recordRes.body.data.subtotal, 1500);
    assert.equal(recordRes.body.data.discount, 50);
    assert.equal(recordRes.body.data.total, 1450);
    assert.equal(recordRes.body.data.status, 'Confirmed');
    assert.equal(recordRes.body.data.paymentMethod, 'cash_on_delivery');
    assert.equal(recordRes.body.data.paymentStatus, 'pending');

    const createdOrderId = recordRes.body.data._id;

    // Immediately generate invoice for recorded order
    const invoiceRes = await request(app)
      .get(`/api/v1/orders/${createdOrderId}/invoice`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(invoiceRes.status, 200);
    assert.equal(invoiceRes.headers['content-type'], 'application/pdf');
    assert.ok(invoiceRes.body instanceof Buffer);
    assert.equal(invoiceRes.body.subarray(0, 5).toString('ascii'), '%PDF-');
    assert.ok(invoiceRes.body.includes(Buffer.from('%%EOF')));
  });
});
