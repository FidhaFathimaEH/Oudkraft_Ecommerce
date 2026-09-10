import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const routeTitleMap = {
  '/admin/dashboard': {
    title: 'Dashboard Overview',
    subtitle: 'Store performance metrics, inventory alerts & recent activity',
  },
  '/admin/products': {
    title: 'Product Catalog',
    subtitle: 'Manage Oud Kraft perfume inventory and fragrance listings',
  },
  '/admin/orders': {
    title: 'Orders Management',
    subtitle: 'Customer orders, dispatch statuses and fulfillment tracking',
  },
  '/admin/customers': {
    title: 'Customer Directory',
    subtitle: 'Registered customer profiles and client relationships',
  },
};

export const AdminHeader = ({ onOpenSidebar }) => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();

  const currentRouteMeta = routeTitleMap[location.pathname] || {
    title: 'Admin Console',
    subtitle: 'Oud Kraft administrative management suite',
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-[#e3d9c4] bg-[#f8f3ea]/90 px-4 backdrop-blur-md sm:px-8">
      {/* Left side: Hamburger button + Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3d9c4] bg-white text-[#0D3B2E] shadow-sm hover:bg-[#efe4d0]/50 transition-colors lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#171311]">
              {currentRouteMeta.title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-[#C6A15B]/40 bg-[#C6A15B]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0D3B2E]">
              <Sparkles className="h-2.5 w-2.5 text-[#C6A15B]" />
              Live Console
            </span>
          </div>
          <p className="hidden sm:block text-xs text-[#5b5b5b] line-clamp-1">
            {currentRouteMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Admin profile & quick logout */}
      <div className="flex items-center gap-3">
        {/* User Card */}
        <div className="flex items-center gap-2.5 rounded-full border border-[#e3d9c4] bg-white px-3.5 py-1.5 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D3B2E] text-[#C6A15B] text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold leading-tight text-[#171311]">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] font-medium text-[#C6A15B] uppercase tracking-wider">
              {user?.role || 'Admin'}
            </p>
          </div>
        </div>

        {/* Header Sign Out Action */}
        <button
          type="button"
          onClick={logout}
          title="Sign out of Admin Console"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e3d9c4] bg-white text-[#5b5b5b] shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
          aria-label="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

AdminHeader.propTypes = {
  onOpenSidebar: PropTypes.func.isRequired,
};
