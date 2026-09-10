import PropTypes from 'prop-types';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f3ea]">
        <div className="relative flex items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-[#e3d9c4] border-t-[#0D3B2E]" />
          <div className="absolute h-7 w-7 rounded-full bg-[#0D3B2E]/10" />
        </div>
        <p className="mt-4 font-serif text-lg tracking-wider text-[#0D3B2E]">
          Oud Kraft Admin
        </p>
        <p className="text-xs uppercase tracking-[0.25em] text-[#C6A15B]">
          Verifying credentials...
        </p>
      </div>
    );
  }

  // Not logged in -> redirect to admin login with location state
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Logged in but not an admin (failsafe check)
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

AdminRoute.propTypes = {
  children: PropTypes.node,
};
