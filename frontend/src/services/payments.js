import { getApiBaseUrl } from '../config/apiConfig';

export const paymentMethods = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Pay securely via Stripe Checkout (Visa, Mastercard, Amex, Apple Pay).',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay cash upon delivery across Abu Dhabi and all UAE emirates.',
  },
];

/**
 * Requests a Stripe Checkout Session for a pending order.
 * @param {string} orderId - The internal order ID created by the backend
 * @returns {Promise<{ sessionId: string, sessionUrl: string, orderId: string, orderNumber: string }>}
 */
export const createCheckoutSession = async (orderId) => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/payments/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Unable to initialize payment session. Please try again.'
    );
  }

  if (!result.success || !result.data?.sessionUrl) {
    throw new Error(
      result.message || 'Failed to generate secure checkout session.'
    );
  }

  return result.data;
};

export const submitPayment = async (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: 'ready', payload }), 400);
  });
};
