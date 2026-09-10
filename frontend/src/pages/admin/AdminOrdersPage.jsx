import { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RotateCw,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  CreditCard,
  Inbox,
} from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '../../services/admin';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';

const ORDER_STATUSES = [
  'All',
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const UPDATEABLE_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

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

const getPaymentStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'pending':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'failed':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    case 'refunded':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    default:
      return 'bg-stone-50 text-stone-700 border-stone-200';
  }
};

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return 'AED 0.00';
  return `AED ${Number(amount).toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-AE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const ITEMS_PER_PAGE = 10;

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Updating order tracking
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState(null);

  const [, startTransition] = useTransition();

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(searchQuery.trim().toLowerCase());
        setCurrentPage(1);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminOrders();

      if (res && res.data) {
        setOrders(res.data);
      } else {
        throw new Error('Unexpected orders response format');
      }
    } catch (err) {
      setError(err?.message || 'Failed to retrieve orders. Please check connection and try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Toast timeout
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Handle status update
  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    setUpdatingOrderId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      const updatedOrder = res?.data;

      // Update local state immediately without full page reload
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
      );

      // If details modal is open for this order, update it too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }

      setFeedback({
        type: 'success',
        message: `Order #${updatedOrder?.orderNumber || orderId.slice(-8)} updated to ${newStatus}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to update order status. Please try again.',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Open Details Modal
  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Filtered & Searched orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'All' && order.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Search query filter
      if (debouncedSearch) {
        const orderNum = (order.orderNumber || '').toLowerCase();
        const custName = (order.customer?.name || '').toLowerCase();
        const custEmail = (order.customer?.email || '').toLowerCase();
        const custPhone = (order.customer?.phone || '').toLowerCase();
        const emirate = (order.deliveryAddress?.emirate || '').toLowerCase();
        const area = (order.deliveryAddress?.area || '').toLowerCase();

        const match =
          orderNum.includes(debouncedSearch) ||
          custName.includes(debouncedSearch) ||
          custEmail.includes(debouncedSearch) ||
          custPhone.includes(debouncedSearch) ||
          emirate.includes(debouncedSearch) ||
          area.includes(debouncedSearch);

        if (!match) return false;
      }

      return true;
    });
  }, [orders, statusFilter, debouncedSearch]);

  // Client-side pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
            Sales &amp; Fulfillment
          </span>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#171311]">
            Customer Orders
          </h2>
          <p className="text-sm text-[#5b5b5b]">
            Track delivery dispatch, client orders, and payment statuses across the UAE.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            title="Refresh orders list"
            className="inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0D3B2E] shadow-sm hover:bg-[#efe4d0]/60 transition-colors disabled:opacity-50 active:scale-95"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-xs font-medium shadow-sm ${
              feedback.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-stone-500 hover:text-stone-800"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e3d9c4] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b5b5b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, client name, email, phone, or emirate..."
            className="w-full rounded-full border border-[#e3d9c4] bg-[#f8f3ea]/50 py-2 pl-10 pr-9 text-xs text-[#171311] placeholder-[#5b5b5b]/60 outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b5b5b] hover:text-[#171311]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#5b5b5b] shrink-0">
            <Filter className="h-3.5 w-3.5 text-[#C6A15B]" />
            <span className="hidden sm:inline">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-full border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-2 text-xs font-medium text-[#171311] outline-none transition-all focus:border-[#0D3B2E] focus:bg-white focus:ring-1 focus:ring-[#0D3B2E]"
          >
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>

          {(searchQuery || statusFilter !== 'All') && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[#e3d9c4] bg-[#f8f3ea] px-3 py-2 text-xs font-semibold text-[#0D3B2E] hover:bg-[#efe4d0] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-sm">Failed to Load Orders</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700 transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-stone-200" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-[#f8f3ea]/70" />
            ))}
          </div>
        </div>
      )}

      {/* Orders Table & Cards */}
      {!loading && !error && (
        <div className="rounded-3xl border border-[#e3d9c4] bg-white shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f3ea] text-[#C6A15B]">
                {orders.length === 0 ? (
                  <ShoppingBag className="h-8 w-8" />
                ) : (
                  <Inbox className="h-8 w-8" />
                )}
              </div>
              <h4 className="mt-4 font-serif text-xl font-bold text-[#171311]">
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
              </h4>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#5b5b5b]">
                {orders.length === 0
                  ? 'Client orders placed through checkout will be tracked and managed here.'
                  : 'Try adjusting your search terms or clearing your status filter to reveal orders.'}
              </p>
              {(searchQuery || statusFilter !== 'All') && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-full border border-[#e3d9c4] bg-[#f8f3ea] px-4 py-2 text-xs font-semibold text-[#0D3B2E] hover:bg-[#efe4d0] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Responsive Table with horizontal scroll wrapper */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e3d9c4]/60 text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f3ea]/40 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5b5b5b]">
                      <th scope="col" className="py-4 pl-6 pr-3">Order #</th>
                      <th scope="col" className="px-3 py-4">Customer</th>
                      <th scope="col" className="px-3 py-4">Date</th>
                      <th scope="col" className="px-3 py-4">Items</th>
                      <th scope="col" className="px-3 py-4">Total</th>
                      <th scope="col" className="px-3 py-4">Payment</th>
                      <th scope="col" className="px-3 py-4">Fulfillment Status</th>
                      <th scope="col" className="py-4 pl-3 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3d9c4]/40">
                    {paginatedOrders.map((order) => {
                      const itemCount = (order.items || []).reduce(
                        (acc, it) => acc + (it.quantity || 1),
                        0
                      );
                      const isRowUpdating = updatingOrderId === order._id;

                      return (
                        <tr
                          key={order._id || order.orderNumber}
                          className="hover:bg-[#f8f3ea]/30 transition-colors"
                        >
                          {/* Order Number */}
                          <td className="py-4 pl-6 pr-3 font-mono font-medium text-[#0D3B2E]">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(order)}
                              className="hover:underline text-left"
                            >
                              {order.orderNumber || order._id?.slice(-8) || '—'}
                            </button>
                          </td>

                          {/* Customer */}
                          <td className="px-3 py-4">
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

                          {/* Date */}
                          <td className="px-3 py-4 text-[#5b5b5b] whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-[#C6A15B]" />
                              <span>{formatDate(order.createdAt)}</span>
                            </span>
                          </td>

                          {/* Items Count */}
                          <td className="px-3 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f8f3ea] px-2.5 py-1 text-[11px] font-medium text-[#0D3B2E]">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                          </td>

                          {/* Total */}
                          <td className="px-3 py-4 font-semibold text-[#171311] whitespace-nowrap">
                            {formatCurrency(order.total)}
                          </td>

                          {/* Payment Status */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getPaymentStatusBadgeClass(
                                  order.paymentStatus
                                )}`}
                              >
                                {order.paymentStatus || 'pending'}
                              </span>
                              <span className="text-[10px] text-[#5b5b5b] flex items-center gap-1">
                                <CreditCard className="h-2.5 w-2.5" />
                                <span>{order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Card'}</span>
                              </span>
                            </div>
                          </td>

                          {/* Status with Interactive Dropdown */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {isRowUpdating ? (
                                <div className="flex items-center gap-1 text-[11px] text-[#C6A15B]">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <select
                                  value={order.status || 'Pending'}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                  disabled={isRowUpdating}
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold outline-none transition-all cursor-pointer ${getStatusBadgeClass(
                                    order.status
                                  )}`}
                                >
                                  {UPDATEABLE_STATUSES.map((st) => (
                                    <option key={st} value={st} className="bg-white text-[#171311]">
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(order)}
                              title="View Order Details"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3d9c4] px-2.5 py-1.5 text-xs font-semibold text-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-white transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden md:inline">Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e3d9c4]/60 px-6 py-4 bg-[#f8f3ea]/20">
                  <p className="text-xs text-[#5b5b5b]">
                    Showing Page <strong className="text-[#171311]">{currentPage}</strong> of{' '}
                    <strong className="text-[#171311]">{totalPages}</strong> ({filteredOrders.length} total orders)
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex h-8 items-center gap-1 rounded-full border border-[#e3d9c4] bg-white px-3 text-xs font-medium text-[#171311] hover:bg-[#efe4d0]/60 transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="flex h-8 items-center gap-1 rounded-full border border-[#e3d9c4] bg-white px-3 text-xs font-medium text-[#171311] hover:bg-[#efe4d0]/60 transition-colors disabled:opacity-40"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={updatingOrderId === selectedOrder?._id}
      />
    </div>
  );
};
