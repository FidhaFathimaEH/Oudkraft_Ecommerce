import { getApiBaseUrl } from '../config/apiConfig';

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
    await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    saveUser(null);
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
    const res = await fetch(`${baseUrl}/auth/me`, {
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
