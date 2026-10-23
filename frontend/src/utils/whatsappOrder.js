import { businessConfig, deliveryConfig } from '../config/businessConfig.js';

const PLACEHOLDER_DIGITS = '971501234567';

/**
 * Sanitizes and returns the business WhatsApp number in international digits-only format.
 * Strips all non-digit characters such as '+', spaces, and hyphens.
 *
 * Checks VITE_WHATSAPP_NUMBER environment variable first, then businessConfig.whatsapp.
 * If the value is missing, empty, or matches the demo placeholder (+971501234567),
 * it returns an empty string to ensure customers are never directed to a fake number.
 *
 * @returns {string} Digits-only verified phone number, or empty string if unconfigured
 */
export const getCleanWhatsAppNumber = (overrideNumber) => {
  if (overrideNumber !== undefined) {
    const cleanOverride = String(overrideNumber || '').replace(/\D/g, '');
    if (!cleanOverride || cleanOverride === PLACEHOLDER_DIGITS || cleanOverride.length < 7) {
      return '';
    }
    return cleanOverride;
  }

  const envNumber =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_NUMBER) ||
    (typeof globalThis !== 'undefined' && globalThis.process?.env?.VITE_WHATSAPP_NUMBER) ||
    '';
  const rawNumber = envNumber || businessConfig?.whatsapp || '';
  const clean = String(rawNumber).replace(/\D/g, '');

  if (!clean || clean === PLACEHOLDER_DIGITS || clean.length < 7) {
    return '';
  }

  return clean;
};

/**
 * Checks whether a valid, verified business WhatsApp number is configured.
 * Returns false if missing or if only the demo placeholder is present.
 * @param {string} [overrideNumber]
 * @returns {boolean}
 */
export const isWhatsAppConfigured = (overrideNumber) => {
  return Boolean(getCleanWhatsAppNumber(overrideNumber));
};

/**
 * Formats a clean, professional WhatsApp order request message for a single product.
 *
 * @param {object} params
 * @param {object} params.product - Product object with name, price, sku/id, slug
 * @param {string} [params.size] - Selected variant / bottle size
 * @param {number} [params.quantity=1] - Quantity requested
 * @param {object} [params.customer] - Optional customer details { name, phone, email }
 * @param {object} [params.deliveryAddress] - Optional delivery address { emirate, area, street, building, apartment, instructions }
 * @param {string} [params.orderReference] - Optional existing order/cart reference
 * @returns {string} Plain-text message formatted for WhatsApp
 */
export const formatSingleProductOrderMessage = ({
  product,
  size,
  quantity = 1,
  customer = null,
  deliveryAddress = null,
  orderReference = null,
}) => {
  const currency = businessConfig?.currency || 'AED';
  const unitPrice = Number(product?.price || 0);
  const qty = Math.max(1, Number(quantity || 1));
  const subtotal = unitPrice * qty;
  const selectedSize = size || product?.size || '100 ml';
  const sku = product?.sku || product?._id || product?.id || '';

  const lines = [
    `*OUD KRAFT — WhatsApp Order Request*`,
    `Hello Oud Kraft, I would like to place an order for the following fragrance:`,
    '',
    `*Product:* ${product?.name || 'Fragrance'}`,
  ];

  if (selectedSize) {
    lines.push(`*Size / Variant:* ${selectedSize}`);
  }

  if (sku) {
    lines.push(`*Item Ref / SKU:* ${sku}`);
  }

  lines.push(`*Quantity:* ${qty}`);
  lines.push(`*Unit Price:* ${currency} ${unitPrice.toFixed(2)}`);
  lines.push(`*Item Subtotal:* ${currency} ${subtotal.toFixed(2)}`);

  // Delivery estimation if delivery emirate is known
  if (deliveryAddress?.emirate) {
    const isFree = subtotal >= (deliveryConfig?.freeDeliveryThreshold || 250);
    const fee = isFree
      ? 0
      : deliveryAddress.emirate.toLowerCase() === 'abu dhabi'
      ? deliveryConfig?.abuDhabiFee || 20
      : deliveryConfig?.otherEmiratesFee || 35;
    const total = subtotal + fee;

    lines.push(`*Delivery Fee (${deliveryAddress.emirate}):* ${isFree ? 'Free' : `${currency} ${fee.toFixed(2)}`}`);
    lines.push(`*Estimated Order Total:* ${currency} ${total.toFixed(2)}`);
  }

  if (customer && (customer.name || customer.phone || customer.email)) {
    lines.push('');
    lines.push(`*Customer Details:*`);
    if (customer.name) lines.push(`• Name: ${customer.name}`);
    if (customer.phone) lines.push(`• Contact Phone: ${customer.phone}`);
    if (customer.email) lines.push(`• Email: ${customer.email}`);
  }

  if (deliveryAddress && (deliveryAddress.emirate || deliveryAddress.street || deliveryAddress.area || deliveryAddress.building)) {
    lines.push('');
    lines.push(`*Delivery Details:*`);
    if (deliveryAddress.emirate) lines.push(`• Emirate: ${deliveryAddress.emirate}`);
    if (deliveryAddress.area) lines.push(`• Area: ${deliveryAddress.area}`);
    if (deliveryAddress.street) lines.push(`• Street: ${deliveryAddress.street}`);
    if (deliveryAddress.building) lines.push(`• Building/Villa: ${deliveryAddress.building}`);
    if (deliveryAddress.apartment) lines.push(`• Flat/Apartment: ${deliveryAddress.apartment}`);
    if (deliveryAddress.instructions) lines.push(`• Instructions: ${deliveryAddress.instructions}`);
    lines.push(`• Payment Method: Cash on Delivery (COD)`);
  } else {
    lines.push('');
    lines.push(`*Delivery & Payment Details (Please provide):*`);
    lines.push(`• Full Name: `);
    lines.push(`• Contact Phone: `);
    lines.push(`• Emirate & Area: `);
    lines.push(`• Street / Building / Villa: `);
    lines.push(`• Payment: Cash on Delivery (COD)`);
  }

  if (orderReference) {
    lines.push('');
    lines.push(`*Reference / Order #:* ${orderReference}`);
  }

  if (typeof window !== 'undefined' && product?.slug) {
    lines.push('');
    lines.push(`*Product Link:* ${window.location.origin}/product/${product.slug}`);
  }

  lines.push('');
  lines.push(`_Your order is not confirmed until Oud Kraft replies on WhatsApp. The business will confirm availability, delivery details and Cash on Delivery manually._`);

  return lines.join('\n');
};

/**
 * Formats a clean WhatsApp order request message for multi-item cart orders.
 *
 * @param {object} params
 * @param {Array} params.cartItems - Array of cart item objects
 * @param {number} params.subtotal - Cart subtotal in AED
 * @param {number|null} [params.deliveryFee] - Optional delivery fee
 * @param {number|null} [params.total] - Optional order total
 * @param {object} [params.customer] - Optional customer details { name, phone, email }
 * @param {object} [params.deliveryAddress] - Optional delivery address
 * @param {string} [params.orderReference] - Optional existing order/cart reference
 * @returns {string} Plain-text message formatted for WhatsApp
 */
export const formatCartOrderMessage = ({
  cartItems = [],
  subtotal = 0,
  deliveryFee = null,
  total = null,
  customer = null,
  deliveryAddress = null,
  orderReference = null,
}) => {
  const currency = businessConfig?.currency || 'AED';

  const lines = [
    `*OUD KRAFT — WhatsApp Order Request*`,
    `Hello Oud Kraft, I would like to place an order for the following items in my bag:`,
    '',
    `*Bag Items (${cartItems.length}):*`,
  ];

  cartItems.forEach((item, index) => {
    const itemPrice = Number(item.price || 0);
    const itemQty = Math.max(1, Number(item.quantity || 1));
    const itemSubtotal = itemPrice * itemQty;
    const size = item.size ? ` (${item.size})` : '';
    const sku = item.sku || item.id || item._id ? ` [Ref: ${item.sku || item.id || item._id}]` : '';

    lines.push(`${index + 1}. *${item.name}*${size}`);
    lines.push(`   • Qty: ${itemQty} × ${currency} ${itemPrice.toFixed(2)} = ${currency} ${itemSubtotal.toFixed(2)}${sku}`);
  });

  lines.push('');
  lines.push(`*Subtotal:* ${currency} ${Number(subtotal || 0).toFixed(2)}`);

  if (deliveryFee !== null && deliveryFee !== undefined) {
    const feeDisplay = Number(deliveryFee) === 0 ? 'Free' : `${currency} ${Number(deliveryFee).toFixed(2)}`;
    lines.push(`*Delivery Fee:* ${feeDisplay}`);
  }

  if (total !== null && total !== undefined) {
    lines.push(`*Order Total:* ${currency} ${Number(total).toFixed(2)}`);
  }

  if (customer && (customer.name || customer.phone || customer.email)) {
    lines.push('');
    lines.push(`*Customer Details:*`);
    if (customer.name) lines.push(`• Name: ${customer.name}`);
    if (customer.phone) lines.push(`• Contact Phone: ${customer.phone}`);
    if (customer.email) lines.push(`• Email: ${customer.email}`);
  }

  if (deliveryAddress && (deliveryAddress.emirate || deliveryAddress.street || deliveryAddress.area || deliveryAddress.building)) {
    lines.push('');
    lines.push(`*Delivery Details:*`);
    if (deliveryAddress.emirate) lines.push(`• Emirate: ${deliveryAddress.emirate}`);
    if (deliveryAddress.area) lines.push(`• Area: ${deliveryAddress.area}`);
    if (deliveryAddress.street) lines.push(`• Street: ${deliveryAddress.street}`);
    if (deliveryAddress.building) lines.push(`• Building/Villa: ${deliveryAddress.building}`);
    if (deliveryAddress.apartment) lines.push(`• Flat/Apartment: ${deliveryAddress.apartment}`);
    if (deliveryAddress.instructions) lines.push(`• Instructions: ${deliveryAddress.instructions}`);
    lines.push(`• Payment Method: Cash on Delivery (COD)`);
  } else {
    lines.push('');
    lines.push(`*Delivery & Payment Details (Please provide):*`);
    lines.push(`• Full Name: `);
    lines.push(`• Contact Phone: `);
    lines.push(`• Emirate & Area: `);
    lines.push(`• Street / Building / Villa: `);
    lines.push(`• Payment: Cash on Delivery (COD)`);
  }

  if (orderReference) {
    lines.push('');
    lines.push(`*Reference / Order #:* ${orderReference}`);
  }

  if (typeof window !== 'undefined') {
    lines.push('');
    lines.push(`*Website:* ${window.location.origin}`);
  }

  lines.push('');
  lines.push(`_Your order is not confirmed until Oud Kraft replies on WhatsApp. The business will confirm availability, delivery details and Cash on Delivery manually._`);

  return lines.join('\n');
};

/**
 * Builds a direct https://wa.me/ URL with a properly URL-encoded prefilled message.
 *
 * @param {string} messageText
 * @param {string} [overrideNumber]
 * @returns {string|null} URL string or null if business number is unconfigured
 */
export const buildWhatsAppUrl = (messageText, overrideNumber) => {
  const number = getCleanWhatsAppNumber(overrideNumber);
  if (!number) {
    return null;
  }
  const encoded = encodeURIComponent(messageText);
  return `https://wa.me/${number}?text=${encoded}`;
};

/**
 * Opens WhatsApp with the prefilled message in a new window/tab.
 * If number is missing, triggers the onMissingNumber callback or alerts gracefully.
 *
 * @param {string} messageText
 * @param {Function} [onMissingNumber]
 * @param {string} [overrideNumber]
 * @returns {boolean} Whether the window was opened
 */
export const openWhatsAppOrder = (messageText, onMissingNumber, overrideNumber) => {
  const url = buildWhatsAppUrl(messageText, overrideNumber);
  if (!url) {
    if (typeof onMissingNumber === 'function') {
      onMissingNumber();
    }
    return false;
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
};
