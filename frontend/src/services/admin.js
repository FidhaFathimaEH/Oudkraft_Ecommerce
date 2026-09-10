const BASE = '/api/v1';

const req = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const adminLogin = (email, password) =>
  req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const adminLogout = () =>
  req('/auth/logout', { method: 'POST' });

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

// Customers
export const getCustomers = () => req('/admin/customers');
