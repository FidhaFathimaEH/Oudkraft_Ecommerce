import { getApiBaseUrl } from '../config/apiConfig';

let inMemoryToken = null;
const TOKEN_KEY = 'oudkraft_auth_token';

/**
 * Retrieves the active access token from in-memory cache or tab-scoped sessionStorage.
 * Avoids persistent localStorage exposure.
 */
export const getAuthToken = () => {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const stored = window.sessionStorage.getItem(TOKEN_KEY);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    } catch {
      // sessionStorage inaccessible (e.g. private browsing storage restrictions)
    }
  }
  return null;
};

/**
 * Updates or clears the active access token in memory and tab-scoped sessionStorage.
 */
export const setAuthToken = (token) => {
  inMemoryToken = token || null;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      if (token) {
        window.sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        window.sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // sessionStorage inaccessible
    }
  }
  return inMemoryToken;
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem('oudkraft-user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const saveUser = (user) => {
  if (typeof window !== 'undefined') {
    if (user) {
      window.localStorage.setItem('oudkraft-user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('oudkraft-user');
    }
  }
  return user;
};

export const logoutUser = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    setAuthToken(null);
    saveUser(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('checkout');
        window.sessionStorage.removeItem('oudkraft_pending_order');
      } catch {
        // ignore storage error
      }
    }
  }
};

export const registerUser = async ({ name, fullName, email, phone, password }) => {
  try {
    const baseUrl = getApiBaseUrl();
    const clientName = (name || fullName || '').trim();
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: clientName,
        email: (email || '').trim(),
        phone: (phone || '').trim(),
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      let errorMsg = data.message || 'Registration failed';
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errorMsg = data.errors.map((e) => e.message).join('. ');
      }
      return { success: false, error: errorMsg };
    }

    const user = data.data?.user || data.user;
    const token = data.data?.token || data.token;
    if (token) setAuthToken(token);
    saveUser(user);
    return { success: true, user, message: data.message || 'Account created successfully.' };
  } catch (err) {
    console.error('Registration network error:', err);
    return { success: false, error: err.message || 'Network error. Please try again.' };
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: (email || '').trim(),
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      let errorMsg = data.message || 'Login failed';
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errorMsg = data.errors.map((e) => e.message).join('. ');
      }
      return { success: false, error: errorMsg };
    }

    const user = data.data?.user || data.user;
    const token = data.data?.token || data.token;
    if (token) setAuthToken(token);
    saveUser(user);
    return { success: true, user, message: data.message || 'Logged in successfully.' };
  } catch (err) {
    console.error('Login network error:', err);
    return { success: false, error: err.message || 'Network error. Please try again.' };
  }
};

export const getCurrentUser = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/auth/me`, {
      headers,
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data?.user) {
      saveUser(data.data.user);
      return data.data.user;
    }
  } catch {
    // fallback to stored user if offline or request fails
  }
  return getStoredUser();
};
