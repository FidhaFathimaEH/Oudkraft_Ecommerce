import { getApiBaseUrl } from '../config/apiConfig';
import { getAuthToken, setAuthToken } from './auth';

const req = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${baseUrl}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const adminLogin = async (email, password) => {
  const data = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  const token = data?.data?.token || data?.token;
  if (token) setAuthToken(token);
  return data;
};

export const adminLogout = async () => {
  try {
    return await req('/auth/logout', { method: 'POST' });
  } finally {
    setAuthToken(null);
  }
};

export const getMe = () => req('/auth/me');

// Dashboard
export const getDashboard = () => req('/admin/dashboard');

// Products
export const getAdminProducts = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return req(`/products${qs ? `?${qs}` : ''}`);
};

export const getAdminProductById = (id) => req(`/products/${id}`);

export const createProduct = (body) =>
  req('/products', { method: 'POST', body: JSON.stringify(body) });

export const updateProduct = (id, body) =>
  req(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const deleteProduct = (id) =>
  req(`/products/${id}`, { method: 'DELETE' });

// Orders
export const getAdminOrders = () => req('/orders');

export const getAdminOrderById = (id) => req(`/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  req(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const recordConfirmedWhatsAppOrder = (orderData) =>
  req('/orders/admin-record', { method: 'POST', body: JSON.stringify(orderData) });

export const downloadOrderInvoice = async (orderId, fallbackInvoiceNumber = '') => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${baseUrl}/orders/${orderId}/invoice`, {
    method: 'GET',
    credentials: 'include',
    headers: { ...authHeaders },
  });

  if (!res.ok) {
    let errMessage = 'Failed to generate PDF invoice.';
    try {
      const errJson = await res.json();
      errMessage = errJson.message || errMessage;
    } catch {
      // Ignore if not json
    }
    throw new Error(errMessage);
  }

  let filename = `Oud-Kraft-Invoice-${fallbackInvoiceNumber || orderId}.pdf`;
  const disposition = res.headers.get('content-disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);

  return { success: true, filename };
};

// Customers
export const getCustomers = () => req('/admin/customers');
