import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Users,
  Clock,
  AlertCircle,
  RotateCw,
  Plus,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import { getDashboard } from '../../services/admin';

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'shipped':
    case 'out for delivery':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'processing':
    case 'confirmed':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-stone-50 text-stone-700 border-stone-200';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-AE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return 'AED 0.00';
  return `AED ${Number(amount).toFixed(2)}`;
};

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboard();
      if (res && res.data) {
        setData(res.data);
      } else {
        throw new Error('Received unexpected dashboard data format');
      }
    } catch (err) {
      setError(err?.message || 'Unable to retrieve dashboard metrics. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
            Executive Overview
          </span>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#171311]">
            Perfume House Analytics
          </h2>
          <p className="text-sm text-[#5b5b5b]">
            Real-time status of product inventory, client orders, and sales activity.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-full border border-[#e3d9c4] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0D3B2E] shadow-sm transition-all hover:bg-[#efe4d0]/60 active:scale-95 disabled:opacity-60"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-sm">Dashboard Data Failed to Load</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700 transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-8 animate-pulse">
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-3xl border border-[#e3d9c4]/70 bg-white/70 p-6 shadow-sm"
              />
            ))}
          </div>

          {/* Skeleton Quick Actions */}
          <div className="h-28 rounded-3xl border border-[#e3d9c4]/70 bg-white/70 p-6 shadow-sm" />

          {/* Skeleton Table */}
          <div className="h-80 rounded-3xl border border-[#e3d9c4]/70 bg-white/70 p-6 shadow-sm" />
        </div>
      )}

      {/* Main Dashboard Content */}
      {(!loading || data) && (
        <>
          {/* 1. Four Metric Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Products */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="relative overflow-hidden rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5b5b]">
                  Total Products
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D3B2E]/10 text-[#0D3B2E]">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-[#171311]">
                {stats.totalProducts ?? 0}
              </p>
              <p className="mt-1 text-xs text-[#5b5b5b]">
                Fragrances in catalog
              </p>
            </motion.div>

            {/* Total Orders */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5b5b]">
                  Total Orders
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C6A15B]/20 text-[#0D3B2E]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-[#171311]">
                {stats.totalOrders ?? 0}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Store orders placed</span>
              </div>
            </motion.div>

            {/* Total Customers */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="relative overflow-hidden rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5b5b]">
                  Total Customers
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D3B2E]/10 text-[#0D3B2E]">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-[#171311]">
                {stats.totalCustomers ?? 0}
              </p>
              <p className="mt-1 text-xs text-[#5b5b5b]">
                Registered client profiles
              </p>
            </motion.div>

            {/* Pending Orders */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5b5b]">
                  Pending Orders
                </p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  (stats.pendingOrders || 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                }`}>
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-[#171311]">
                {stats.pendingOrders ?? 0}
              </p>
              <p className={`mt-1 text-xs font-medium ${
                (stats.pendingOrders || 0) > 0 ? 'text-amber-700 font-semibold' : 'text-[#5b5b5b]'
              }`}>
                {(stats.pendingOrders || 0) > 0 ? 'Awaiting fulfillment' : 'All orders processed'}
              </p>
            </motion.div>
          </div>

          {/* 2. Quick Actions Banner */}
          <div className="rounded-3xl border border-[#e3d9c4] bg-[#0D3B2E] p-6 sm:p-7 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                  Administrative Shortcuts
                </span>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-white">
                  Quick Management Actions
                </h3>
                <p className="mt-1 text-xs text-[#efe4d0]/80">
                  Direct pathways for catalog creation, order updates, and customer directory lookups.
                </p>
              </div>

              {/* Action Buttons (Marked clearly as Phase 3 actions) */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled
                  title="Product addition will be available in Phase 3"
                  className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-full border border-[#C6A15B]/40 bg-[#C6A15B]/15 px-4 py-2.5 text-xs font-semibold text-[#C6A15B] opacity-80"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Product</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#C6A15B]/70 font-normal">
                    (Phase 3)
                  </span>
                </button>

                <Link
                  to="/admin/products"
                  title="Manage fragrance products"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-semibold text-[#efe4d0] hover:bg-white/20 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Package className="h-3.5 w-3.5 text-[#C6A15B]" />
                  <span>View Products</span>
                </Link>

                <Link
                  to="/admin/orders"
                  title="Manage customer orders"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-semibold text-[#efe4d0] hover:bg-white/20 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-[#C6A15B]" />
                  <span>View Orders</span>
                </Link>

                <Link
                  to="/admin/customers"
                  title="Manage registered customer directory"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-semibold text-[#efe4d0] hover:bg-white/20 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  <Users className="h-3.5 w-3.5 text-[#C6A15B]" />
                  <span>View Customers</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Recent Orders Section */}
          <div className="rounded-3xl border border-[#e3d9c4] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e3d9c4]/60 pb-5">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#171311]">
                  Recent Orders
                </h3>
                <p className="mt-0.5 text-xs text-[#5b5b5b]">
                  Showing the latest 10 customer orders placed across the UAE.
                </p>
              </div>
              <span className="self-start sm:self-auto rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-1 text-xs font-medium text-[#0D3B2E]">
                {recentOrders.length} {recentOrders.length === 1 ? 'Order' : 'Orders'} Recorded
              </span>
            </div>

            {/* Empty State */}
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f3ea] text-[#C6A15B]">
                  <Inbox className="h-8 w-8" />
                </div>
                <h4 className="mt-4 font-serif text-lg font-semibold text-[#171311]">
                  No Recent Orders Found
                </h4>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#5b5b5b]">
                  When customers complete checkout for Oud Kraft flacons and gift boxes, orders will immediately populate this live table.
                </p>
              </div>
            ) : (
              /* Responsive Table with safe horizontal scroll */
              <div className="mt-4 -mx-6 sm:-mx-8 overflow-x-auto">
                <div className="inline-block min-w-full align-middle px-6 sm:px-8">
                  <table className="min-w-full divide-y divide-[#e3d9c4]/60 text-left text-xs">
                    <thead>
                      <tr className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5b5b5b]">
                        <th scope="col" className="py-3.5 pr-4 pl-2">Order #</th>
                        <th scope="col" className="px-4 py-3.5">Customer</th>
                        <th scope="col" className="px-4 py-3.5">Destination</th>
                        <th scope="col" className="px-4 py-3.5">Items</th>
                        <th scope="col" className="px-4 py-3.5">Total</th>
                        <th scope="col" className="px-4 py-3.5">Date</th>
                        <th scope="col" className="px-4 py-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3d9c4]/40">
                      {recentOrders.map((order) => {
                        const itemCount = (order.items || []).reduce(
                          (acc, it) => acc + (it.quantity || 1),
                          0
                        );
                        return (
                          <tr
                            key={order._id || order.orderNumber}
                            className="hover:bg-[#f8f3ea]/40 transition-colors"
                          >
                            {/* Order Number */}
                            <td className="py-4 pr-4 pl-2 font-mono font-medium text-[#0D3B2E]">
                              {order.orderNumber || order._id?.slice(-8) || 'N/A'}
                            </td>

                            {/* Customer Information */}
                            <td className="px-4 py-4">
                              <p className="font-semibold text-[#171311]">
                                {order.customer?.name || 'Guest Client'}
                              </p>
                              <p className="text-[11px] text-[#5b5b5b]">
                                {order.customer?.email || '—'}
                              </p>
                              {order.customer?.phone && (
                                <p className="text-[10px] text-[#5b5b5b]/80">
                                  {order.customer.phone}
                                </p>
                              )}
                            </td>

                            {/* Delivery Emirate */}
                            <td className="px-4 py-4 text-[#171311]">
                              <span className="font-medium">
                                {order.deliveryAddress?.emirate || 'UAE'}
                              </span>
                              {order.deliveryAddress?.area && (
                                <span className="block text-[11px] text-[#5b5b5b]">
                                  {order.deliveryAddress.area}
                                </span>
                              )}
                            </td>

                            {/* Items count */}
                            <td className="px-4 py-4 text-[#5b5b5b]">
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#f8f3ea] px-2.5 py-1 text-[11px] font-medium text-[#0D3B2E]">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              </span>
                            </td>

                            {/* Total formatted in AED */}
                            <td className="px-4 py-4 font-semibold text-[#171311]">
                              {formatCurrency(order.total)}
                            </td>

                            {/* Order Date */}
                            <td className="px-4 py-4 text-[#5b5b5b] whitespace-nowrap">
                              {formatDate(order.createdAt)}
                            </td>

                            {/* Status Badge */}
                            <td className="px-4 py-4 text-right whitespace-nowrap">
                              <span
                                className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeClass(
                                  order.status
                                )}`}
                              >
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
