import { getApiBaseUrl } from '../config/apiConfig';
import { getAuthToken } from './auth';

export const createOrderPreview = (cartItems, customer, deliveryAddress) => ({
  id: `OK-${Math.floor(100000 + Math.random() * 900000)}`,
  items: cartItems,
  customer,
  deliveryAddress,
  status: 'Confirmed',
  createdAt: new Date().toISOString(),
});

/**
 * Fetches the authenticated customer's order history from the server.
 * Authenticates via Bearer token and/or HTTP-only session cookie.
 */
export const getMyOrders = async (params = {}) => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page);
  if (params.limit) searchParams.append('limit', params.limit);
  const query = searchParams.toString();

  const response = await fetch(`${baseUrl}/orders/my-orders${query ? `?${query}` : ''}`, {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load your orders.');
  }

  return data;
};

/**
 * Fetches details for an individual order with ownership authorization.
 */
export const getCustomerOrderById = async (orderId) => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${baseUrl}/orders/${orderId}`, {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load order details.');
  }

  return data;
};
