import PropTypes from 'prop-types';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  X,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import oudKraftLogo from '../../assets/logo/oud-kraft-logo.png';

const navItems = [
  {
    name: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    name: 'Products',
    to: '/admin/products',
    icon: Package,
    enabled: true,
  },
  {
    name: 'Orders',
    to: '/admin/orders',
    icon: ShoppingBag,
    enabled: true,
  },
  {
    name: 'Customers',
    to: '/admin/customers',
    icon: Users,
    enabled: true,
  },
];

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-[#082820] text-white">
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between border-b border-[#C6A15B]/20 p-5">
          <Link
            to="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#C6A15B]/40 bg-[#0D3B2E] p-1 shadow-md transition-transform group-hover:scale-105">
              <img
                src={oudKraftLogo}
                alt="Oud Kraft"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <span className="block font-serif text-lg font-semibold tracking-wide text-white">
                Oud Kraft
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#C6A15B]">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#efe4d0]/60 hover:bg-[#0D3B2E] hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="px-4 py-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#efe4d0]/50">
            Navigation
          </p>
          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              if (!item.enabled) {
                return (
                  <div
                    key={item.name}
                    className="flex cursor-not-allowed items-center justify-between rounded-xl px-3.5 py-3 text-xs font-medium text-[#efe4d0]/40 transition-colors"
                    title={`${item.name} management is scheduled for Phase 3`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 opacity-50" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full border border-[#C6A15B]/20 bg-[#0D3B2E]/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#C6A15B]/70">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive: linkActive }) =>
                    `flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-medium transition-all ${
                      linkActive || isActive
                        ? 'bg-[#0D3B2E] text-[#C6A15B] shadow-inner font-semibold border-l-2 border-[#C6A15B]'
                        : 'text-[#efe4d0]/80 hover:bg-[#0D3B2E]/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="border-t border-[#C6A15B]/20 p-4 space-y-2">
        {/* Current Admin Quick Info */}
        <div className="rounded-xl border border-[#C6A15B]/15 bg-[#0D3B2E]/70 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6A15B]/20 text-[#C6A15B]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || 'Administrator'}
              </p>
              <p className="truncate text-[10px] text-[#efe4d0]/60">
                {user?.email || 'admin@oudkraft.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Public Storefront Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs text-[#efe4d0]/80 hover:bg-[#0D3B2E] hover:text-[#C6A15B] transition-colors"
        >
          <Store className="h-4 w-4" />
          <span>View Public Storefront</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-[#C6A15B]/20 lg:z-30">
        {navContent}
      </aside>

      {/* Mobile Slide-out Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs shadow-2xl transition-transform duration-300">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

AdminSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
