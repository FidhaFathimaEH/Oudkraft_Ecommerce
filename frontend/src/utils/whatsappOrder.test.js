import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCleanWhatsAppNumber,
  isWhatsAppConfigured,
  formatSingleProductOrderMessage,
  formatCartOrderMessage,
  buildWhatsAppUrl,
} from './whatsappOrder.js';

test('WhatsApp ordering utilities verification', async (t) => {
  await t.test('1. Unconfigured / placeholder number protection', () => {
    // When empty override or placeholder +971501234567 is passed,
    // getCleanWhatsAppNumber must return empty string and isWhatsAppConfigured must be false.
    assert.equal(getCleanWhatsAppNumber(''), '');
    assert.equal(getCleanWhatsAppNumber('+971501234567'), '');
    assert.equal(getCleanWhatsAppNumber('971501234567'), '');
    assert.equal(isWhatsAppConfigured(''), false);
    assert.equal(isWhatsAppConfigured('+971501234567'), false);
    assert.equal(buildWhatsAppUrl('Test message', ''), null);

    // Active configuration resolves to the official business number
    assert.equal(getCleanWhatsAppNumber(), '971509834317');
    assert.equal(isWhatsAppConfigured(), true);
    assert.ok(buildWhatsAppUrl('Test message').startsWith('https://wa.me/971509834317?text=Test%20message'));
  });

  await t.test('2. Verified WhatsApp number configuration formatting', () => {
    const verifiedNumber = '+971 50 987 6543';
    const cleanNumber = getCleanWhatsAppNumber(verifiedNumber);

    assert.equal(cleanNumber, '971509876543');
    assert.match(cleanNumber, /^[0-9]+$/);
    assert.equal(cleanNumber.includes('+'), false);
    assert.equal(cleanNumber.includes(' '), false);
    assert.equal(cleanNumber.includes('-'), false);
    assert.equal(isWhatsAppConfigured(verifiedNumber), true);

    const testUrl = buildWhatsAppUrl('Test message', verifiedNumber);
    assert.ok(testUrl.startsWith('https://wa.me/971509876543?text=Test%20message'));
  });

  await t.test('3. Single product WhatsApp order formatting and URL encoding', () => {
    const product = {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      name: 'Royal Cambodian Oud',
      slug: 'royal-cambodian-oud',
      price: 450,
      sku: 'OK-RCO-100',
    };

    const message = formatSingleProductOrderMessage({
      product,
      size: '100 ml',
      quantity: 2,
      customer: {
        name: 'Amina Al Shamsi',
        phone: '+971501234567',
        email: 'amina@example.com',
      },
      deliveryAddress: {
        emirate: 'Abu Dhabi',
        area: 'Al Bateen',
        street: 'Corniche Road',
        building: 'Seaview Tower',
        apartment: 'Apt 1202',
      },
    });

    assert.ok(message.includes('Royal Cambodian Oud'));
    assert.ok(message.includes('100 ml'));
    assert.ok(message.includes('OK-RCO-100'));
    assert.ok(message.includes('*Quantity:* 2'));
    assert.ok(message.includes('Unit Price:* AED 450.00'));
    assert.ok(message.includes('Item Subtotal:* AED 900.00'));
    assert.ok(message.includes('Amina Al Shamsi'));
    assert.ok(message.includes('Corniche Road'));
    assert.ok(message.includes('Your order is not confirmed until Oud Kraft replies on WhatsApp'));

    const verifiedNumber = '971509834317';
    const url = buildWhatsAppUrl(message, verifiedNumber);
    assert.ok(url.startsWith('https://wa.me/971509834317?text='));
    assert.equal(url.includes('wa.me/+'), false);
    assert.equal(url.includes('\n'), false);
  });

  await t.test('4. Multi-item cart WhatsApp order formatting and calculation accuracy', () => {
    const cartItems = [
      {
        _id: 'prod1',
        name: 'Musk Tahara Premium',
        size: '100 ml',
        price: 200,
        quantity: 1,
      },
      {
        _id: 'prod2',
        name: 'Amber Sublime',
        size: '50 ml',
        price: 150,
        quantity: 2,
      },
    ];

    const subtotal = 500; // 200*1 + 150*2 = 500
    const deliveryFee = 0; // >= 250 AED is free
    const total = 500;

    const message = formatCartOrderMessage({
      cartItems,
      subtotal,
      deliveryFee,
      total,
      customer: {
        name: 'Sultan Al Qasimi',
        phone: '+971507778899',
      },
      deliveryAddress: {
        emirate: 'Dubai',
        street: 'Sheikh Zayed Rd',
      },
    });

    assert.ok(message.includes('Bag Items (2):'));
    assert.ok(message.includes('Musk Tahara Premium'));
    assert.ok(message.includes('(100 ml)'));
    assert.ok(message.includes('Amber Sublime'));
    assert.ok(message.includes('(50 ml)'));
    assert.ok(message.includes('Subtotal:* AED 500.00'));
    assert.ok(message.includes('Delivery Fee:* Free'));
    assert.ok(message.includes('Order Total:* AED 500.00'));
    assert.ok(message.includes('Sultan Al Qasimi'));
    assert.ok(message.includes('Sheikh Zayed Rd'));
    assert.ok(message.includes('Your order is not confirmed until Oud Kraft replies on WhatsApp'));

    const verifiedNumber = '971509834317';
    const url = buildWhatsAppUrl(message, verifiedNumber);
    assert.ok(url.startsWith('https://wa.me/971509834317?text='));
    assert.equal(url.includes('wa.me/+'), false);
    assert.equal(url.includes('\n'), false);
  });
});
