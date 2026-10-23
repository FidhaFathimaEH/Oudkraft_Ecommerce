import { getApiBaseUrl } from '../config/apiConfig';
import { getAuthToken } from './auth';

// Online Stripe payments are temporarily disabled for initial launch.
// All helper functions and Stripe integration code are preserved below for future activation.
export const paymentMethods = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay cash upon delivery across Abu Dhabi and all UAE emirates.',
  },
];

/**
 * Requests a Stripe Checkout Session for a pending order.
 * @param {string} orderId - The internal order ID created by the backend
 * @param {string} [customerEmail] - Customer email for guest order verification
 * @returns {Promise<{ sessionId: string, sessionUrl: string, orderId: string, orderNumber: string }>}
 */
export const createCheckoutSession = async (orderId, customerEmail) => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = { orderId };
  if (customerEmail) {
    payload.customerEmail = customerEmail;
  }

  const response = await fetch(`${baseUrl}/payments/create-checkout-session`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
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
