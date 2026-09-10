import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Package,
  ShoppingBag,
  Clock,
  Loader2,
  FileText,
} from 'lucide-react';

const ORDER_STATUSES = [
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
    return d.toLocaleString('en-AE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

export const OrderDetailsModal = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
  isUpdatingStatus,
}) => {
  if (!isOpen || !order) return null;

  const customer = order.customer || {};
  const deliveryAddress = order.deliveryAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const handleStatusSelect = (e) => {
    const newStatus = e.target.value;
    if (newStatus && newStatus !== order.status && onStatusChange) {
      onStatusChange(order._id, newStatus);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25 }}
          className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-[#e3d9c4] bg-[#f8f3ea] shadow-2xl flex flex-col"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-[#e3d9c4] bg-white px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D3B2E] text-[#C6A15B] shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171311]">
                    Order #{order.orderNumber || order._id?.slice(-8)}
                  </h3>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#5b5b5b]">
                  <Calendar className="h-3.5 w-3.5 text-[#C6A15B]" />
                  <span>Placed on {formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#5b5b5b] hover:bg-[#f8f3ea] hover:text-[#171311] transition-colors"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Interior */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Status Changer Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#C6A15B]/30 bg-[#0D3B2E] p-4 text-white shadow-sm">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-[#C6A15B] shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#C6A15B]">
                    Fulfillment Status
                  </p>
                  <p className="text-xs text-[#efe4d0]">
                    Update dispatch and delivery tracking for this order.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isUpdatingStatus && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#C6A15B]" />
                )}
                <select
                  value={order.status || 'Pending'}
                  onChange={handleStatusSelect}
                  disabled={isUpdatingStatus}
                  className="rounded-xl border border-[#C6A15B]/40 bg-[#082820] px-3 py-2 text-xs font-semibold text-white outline-none transition-all focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B] disabled:opacity-60"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-[#082820] text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid: Customer + Delivery + Payment Info */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* 1. Customer Information */}
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-[#e3d9c4]/60 pb-2.5">
                  <User className="h-4 w-4 text-[#C6A15B]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0D3B2E]">
                    Client Details
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b]">Name</span>
                    <p className="font-semibold text-[#171311]">
                      {customer.name || 'Guest Client'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b]">Email</span>
                    <p className="font-medium text-[#171311] break-all flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-[#C6A15B] shrink-0" />
                      <span>{customer.email || '—'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b]">Phone</span>
                    <p className="font-medium text-[#171311] flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-[#C6A15B] shrink-0" />
                      <span>{customer.phone || '—'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-[#e3d9c4]/60 pb-2.5">
                  <MapPin className="h-4 w-4 text-[#C6A15B]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0D3B2E]">
                    Delivery Address
                  </h4>
                </div>
                <div className="space-y-1.5 text-xs text-[#171311]">
                  <p className="font-semibold text-[#0D3B2E]">
                    {deliveryAddress.emirate || 'United Arab Emirates'}
                  </p>
                  {deliveryAddress.area && (
                    <p className="text-[#5b5b5b]">Area: <strong className="text-[#171311]">{deliveryAddress.area}</strong></p>
                  )}
                  {deliveryAddress.street && (
                    <p className="text-[#5b5b5b]">Street: {deliveryAddress.street}</p>
                  )}
                  {(deliveryAddress.building || deliveryAddress.apartment) && (
                    <p className="text-[#5b5b5b]">
                      {[deliveryAddress.building && `Bldg: ${deliveryAddress.building}`, deliveryAddress.apartment && `Apt: ${deliveryAddress.apartment}`]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {deliveryAddress.landmark && (
                    <p className="text-[11px] text-[#C6A15B]">
                      Landmark: {deliveryAddress.landmark}
                    </p>
                  )}
                  {deliveryAddress.instructions && (
                    <p className="mt-2 rounded-lg bg-[#f8f3ea] p-2 text-[11px] italic text-[#5b5b5b]">
                      &quot;{deliveryAddress.instructions}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Payment & Settlement */}
              <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-[#e3d9c4]/60 pb-2.5">
                  <CreditCard className="h-4 w-4 text-[#C6A15B]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0D3B2E]">
                    Payment
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b]">Method</span>
                    <p className="font-semibold text-[#171311] capitalize">
                      {order.paymentMethod === 'cash_on_delivery'
                        ? 'Cash on Delivery (COD)'
                        : order.paymentMethod || 'Credit / Debit Card'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b]">Payment Status</span>
                    <div className="mt-1">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getPaymentStatusBadgeClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus || 'pending'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b]">Order ID</span>
                    <p className="font-mono text-[11px] text-[#5b5b5b] break-all">
                      {order._id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchased Items Section */}
            <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#e3d9c4]/60 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#C6A15B]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0D3B2E]">
                    Ordered Items ({items.length})
                  </h4>
                </div>
                <span className="text-xs text-[#5b5b5b]">
                  {items.reduce((sum, item) => sum + (item.quantity || 1), 0)} units total
                </span>
              </div>

              {items.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#5b5b5b]">
                  No item breakdown recorded for this order.
                </p>
              ) : (
                <div className="divide-y divide-[#e3d9c4]/40">
                  {items.map((item, idx) => {
                    const lineSubtotal = item.subtotal != null
                      ? item.subtotal
                      : (item.price || 0) * (item.quantity || 1);

                    return (
                      <div
                        key={item._id || item.product || idx}
                        className="flex items-center justify-between py-3.5 gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e3d9c4] bg-white p-1">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="h-5 w-5 text-[#C6A15B]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#171311] truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#5b5b5b]">
                              Size: {item.size || '100 ml'} &bull; Qty: {item.quantity} &times; {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-semibold text-xs text-[#171311]">
                            {formatCurrency(lineSubtotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pricing Summary Breakdown */}
            <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-[#e3d9c4]/60 pb-3">
                <FileText className="h-4 w-4 text-[#C6A15B]" />
                <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0D3B2E]">
                  Financial Breakdown
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#5b5b5b]">
                  <span>Subtotal</span>
                  <span className="text-[#171311] font-medium">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-[#5b5b5b]">
                  <span>Delivery Fee</span>
                  <span className="text-[#171311] font-medium">
                    {order.deliveryFee === 0
                      ? 'Complimentary'
                      : formatCurrency(order.deliveryFee)}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Promotional Discount</span>
                    <span>- {formatCurrency(order.discount)}</span>
                  </div>
                )}

                <div className="border-t border-[#e3d9c4]/60 pt-3 flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#0D3B2E]">
                    Total Amount
                  </span>
                  <span className="font-serif text-xl font-bold text-[#171311]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end border-t border-[#e3d9c4] bg-white px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-[#123F34] transition-colors shadow-sm"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

OrderDetailsModal.propTypes = {
  order: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func,
  isUpdatingStatus: PropTypes.bool,
};
