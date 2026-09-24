const Stripe = require('stripe');
const { stripe: stripeConfig } = require('./env');

let cachedStripeInstance = null;

/**
 * Checks whether Stripe server-side credentials are configured.
 * @returns {boolean}
 */
const isStripeConfigured = () => {
  return Boolean(
    stripeConfig &&
    typeof stripeConfig.secretKey === 'string' &&
    stripeConfig.secretKey.trim().length > 0
  );
};

/**
 * Returns an initialized Stripe client.
 * Throws a controlled 503 error if the secret key is missing without crashing on module import.
 *
 * @returns {Stripe}
 */
const getStripe = () => {
  if (!isStripeConfigured()) {
    const error = new Error('Stripe secret key is not configured on the server.');
    error.statusCode = 503;
    error.isConfigError = true;
    throw error;
  }

  if (!cachedStripeInstance) {
    cachedStripeInstance = new Stripe(stripeConfig.secretKey.trim());
  }

  return cachedStripeInstance;
};

/**
 * Testing helper: allow injecting a mock Stripe instance.
 * @param {object|null} mockInstance
 */
const setStripeClient = (mockInstance) => {
  cachedStripeInstance = mockInstance;
};

module.exports = {
  getStripe,
  isStripeConfigured,
  setStripeClient,
};
