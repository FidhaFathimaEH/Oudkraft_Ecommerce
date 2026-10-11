import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { getMyOrders } from '../services/orders';
import { getCurrentUser, getStoredUser } from '../services/auth';

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

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Delivered',
      };
    case 'shipped':
    case 'out for delivery':
      return {
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        label: status,
      };
    case 'processing':
    case 'confirmed':
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        label: status,
      };
    case 'cancelled':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        label: 'Cancelled',
      };
    case 'pending':
    default:
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: status || 'Pending',
      };
  }
};

const getPaymentBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Paid',
      };
    case 'failed':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        label: 'Payment Failed',
      };
    case 'refunded':
      return {
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        label: 'Refunded',
      };
    case 'pending':
    default:
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Payment Pending',
      };
  }
};

export const OrdersPage = () => {
  const [user, setUser] = useState(getStoredUser());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const res = await getMyOrders();
      if (res && res.data) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order history.');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!isMounted) return;
        if (currentUser) {
          setUser(currentUser);
          fetchOrders();
        } else {
          setUser(null);
          setOrders([]);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setOrders([]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">
              Client Portal
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-[#0D3B2E] font-bold">
              Your Order History
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b5b]">
              Track your bespoke fragrance acquisitions and UAE courier dispatch status.
            </p>
          </div>

          {user && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#e3d9c4] bg-white px-4 py-2 text-xs font-medium text-[#0D3B2E] shadow-sm hover:bg-[#F8F4EC] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#C6A15B] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          )}
        </div>

        {/* Content States */}
        {!user && !loading ? (
          /* Unauthenticated State */
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8F4EC] text-[#0D3B2E]">
              <ShoppingBag className="h-8 w-8 text-[#C6A15B]" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-bold text-[#0D3B2E]">
              Sign in to view orders
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b5b] leading-relaxed">
              Order history is securely reserved for authenticated clients. Please sign in to access your personal collection portfolio and delivery tracking.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#123F34] transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-6 py-2.5 text-xs font-semibold text-[#0D3B2E] hover:bg-[#efe4d0] transition-colors"
              >
                <span>Browse Fragrances</span>
              </Link>
            </div>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#e3d9c4] bg-white p-16 text-center shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[#C6A15B]" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#0D3B2E]">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="rounded-[28px] border border-rose-200 bg-rose-50/60 p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
            <p className="mt-2 text-sm font-semibold text-rose-800">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0D3B2E] px-5 py-2 text-xs font-semibold text-white hover:bg-[#123F34] transition-colors"
            >
              <span>Try Again</span>
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders State */
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8F4EC] text-[#0D3B2E]">
              <Package className="h-8 w-8 text-[#C6A15B]" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-bold text-[#0D3B2E]">
              No Orders Placed Yet
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#5b5b5b] leading-relaxed">
              You haven&apos;t placed any orders with this account yet. Discover our private collection of artisanal flacons and rare Dehn Al Oud.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#123F34] transition-colors"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Real Customer Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const paymentBadge = getPaymentBadge(order.paymentStatus);
              const itemCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

              return (
                <div
                  key={order._id || order.orderNumber}
                  className="overflow-hidden rounded-[24px] border border-[#e3d9c4] bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e3d9c4] bg-[#F8F4EC]/60 px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#0D3B2E]">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#5b5b5b]">
                        • Placed on {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusBadge.bg}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${paymentBadge.bg}`}
                      >
                        {paymentBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items & Details */}
                  <div className="p-6">
                    <div className="divide-y divide-[#e3d9c4]/50">
                      {order.items?.map((item, idx) => (
                        <div
                          key={item.product || idx}
                          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-12 w-12 rounded-xl object-cover border border-[#e3d9c4]"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e3d9c4] bg-[#F8F4EC] text-[#0D3B2E]">
                                <Package className="h-5 w-5 text-[#C6A15B]" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-[#0D3B2E]">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-[#5b5b5b]">
                                Size: {item.size || '100 ml'} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <div className="text-right pl-4">
                            <span className="text-xs font-semibold text-[#171311]">
                              AED {item.subtotal ? item.subtotal.toFixed(2) : (item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Breakdown */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#e3d9c4] pt-4 text-xs">
                      <div className="flex items-center gap-2 text-[#5b5b5b]">
                        <MapPin className="h-3.5 w-3.5 text-[#C6A15B]" />
                        <span>
                          Delivery: {order.deliveryAddress?.emirate || 'UAE'}
                          {order.deliveryAddress?.area ? `, ${order.deliveryAddress.area}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-[#5b5b5b]">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                        <div className="text-right">
                          <span className="text-[11px] text-[#5b5b5b] mr-2">Total</span>
                          <span className="font-serif text-lg font-bold text-[#0D3B2E]">
                            AED {order.total ? order.total.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};