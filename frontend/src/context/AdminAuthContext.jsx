import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { adminLogin, adminLogout, getMe } from '../services/admin';

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check and restore admin session on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMe();
      const userData = response?.data?.user;

      if (userData && userData.role === 'admin') {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      // 401 or network error indicates unauthenticated / expired session
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminLogin(email, password);
      const userData = response?.data?.user;

      if (!userData || userData.role !== 'admin') {
        // A non-admin user authenticated successfully on the backend,
        // but must NOT be granted access to the admin panel.
        try {
          await adminLogout();
        } catch {
          // ignore logout failure
        }
        setUser(null);
        const forbiddenMsg = 'Access denied. Administrator privileges required.';
        setError(forbiddenMsg);
        return { success: false, error: forbiddenMsg };
      }

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err?.message || 'Invalid email or password';
      setError(errorMsg);
      setUser(null);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await adminLogout();
    } catch (err) {
      console.error('Error during admin logout:', err);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = useMemo(() => {
    return Boolean(user && user.role === 'admin');
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated,
      login,
      logout,
      checkAuth,
      clearError,
    }),
    [user, loading, error, isAuthenticated, login, logout, checkAuth, clearError]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

AdminAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

