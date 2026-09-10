import { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Eye,
  RotateCw,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
} from 'lucide-react';
import { getCustomers } from '../../services/admin';
import { CustomerDetailsModal } from '../../components/admin/CustomerDetailsModal';

const STATUS_FILTERS = ['All', 'Active', 'Inactive'];
const ITEMS_PER_PAGE = 10;

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

const getInitials = (name) => {
  if (!name) return 'C';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  // Load customers from API
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomers();

      // Backend returns: { success: true, count: N, data: { customers: [...], count: N } }
      if (res && res.data && Array.isArray(res.data.customers)) {
        setCustomers(res.data.customers);
      } else if (res && Array.isArray(res.data)) {
        setCustomers(res.data);
      } else if (res && Array.isArray(res.customers)) {
        setCustomers(res.customers);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err.message || 'Failed to load customers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      // 1. Status Filter
      if (statusFilter === 'Active' && !cust.isActive) return false;
      if (statusFilter === 'Inactive' && cust.isActive) return false;

      // 2. Search Query (name, email, phone, _id)
      if (debouncedSearch) {
        const name = (cust.name || '').toLowerCase();
        const email = (cust.email || '').toLowerCase();
        const phone = (cust.phone || '').toLowerCase();
        const id = (cust._id || '').toLowerCase();

        return (
          name.includes(debouncedSearch) ||
          email.includes(debouncedSearch) ||
          phone.includes(debouncedSearch) ||
          id.includes(debouncedSearch)
        );
      }

      return true;
    });
  }, [customers, statusFilter, debouncedSearch]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [customers]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const handleOpenDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e3d9c4] pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#C6A15B] uppercase block mb-1">
            Clientele Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#171311]">
            Customers Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5b5b5b]">
            Review registered customer profiles, contact info, and membership standing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadCustomers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] bg-white px-4 py-2 text-xs font-semibold text-[#171311] hover:border-[#C6A15B] hover:text-[#0D3B2E] transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh customer list"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#C6A15B]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Customers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
            {loading && customers.length === 0 ? '—' : stats.total}
          </p>
          <p className="mt-1 text-xs text-[#5b5b5b]">
            Registered store clients
          </p>
        </motion.div>

        {/* Active Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="relative overflow-hidden rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5b5b]">
              Active Clients
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-serif text-3xl font-bold text-[#171311]">
            {loading && customers.length === 0 ? '—' : stats.active}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Accounts in good standing</span>
          </div>
        </motion.div>

        {/* Inactive Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="relative overflow-hidden rounded-3xl border border-[#e3d9c4] bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5b5b]">
              Inactive / Suspended
            </p>
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              stats.inactive > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
            }`}>
              <UserX className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-serif text-3xl font-bold text-[#171311]">
            {loading && customers.length === 0 ? '—' : stats.inactive}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-[#5b5b5b]">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Deactivated profiles</span>
          </div>
        </motion.div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#e3d9c4] bg-white p-4 sm:p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b5b5b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, phone..."
            className="w-full rounded-full border border-[#e3d9c4] bg-[#f8f3ea]/50 py-2.5 pl-10 pr-10 text-xs text-[#171311] placeholder:text-[#5b5b5b]/60 focus:border-[#0D3B2E] focus:bg-white focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5b5b5b] hover:text-[#171311]"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#5b5b5b] mr-1">
            <Filter className="h-3.5 w-3.5 text-[#C6A15B]" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filter:</span>
          </div>

          {STATUS_FILTERS.map((status) => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusFilterChange(status)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#0D3B2E] text-[#C6A15B] shadow-sm'
                    : 'bg-[#f8f3ea] text-[#171311] hover:bg-[#efe4d0]'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Customer Table Section */}
      <div className="rounded-3xl border border-[#e3d9c4] bg-white p-6 sm:p-8 shadow-sm">
        {/* Table Title / Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e3d9c4]/60 pb-5">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#171311]">
              Registered Clientele
            </h3>
            <p className="mt-0.5 text-xs text-[#5b5b5b]">
              Showing {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer profile' : 'customer profiles'}
              {statusFilter !== 'All' ? ` with ${statusFilter} status` : ''}
              {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}.
            </p>
          </div>

          <span className="self-start sm:self-auto rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-1 text-xs font-medium text-[#0D3B2E]">
            {filteredCustomers.length} Records Found
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <p className="font-semibold">Unable to fetch customer directory</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadCustomers}
              className="rounded-lg bg-rose-100 px-3 py-1.5 font-semibold text-rose-900 hover:bg-rose-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center justify-between rounded-2xl border border-[#e3d9c4]/40 bg-[#f8f3ea]/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#e3d9c4]/50" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-32 rounded bg-[#e3d9c4]/60" />
                    <div className="h-2.5 w-44 rounded bg-[#e3d9c4]/40" />
                  </div>
                </div>
                <div className="h-4 w-28 rounded bg-[#e3d9c4]/50" />
                <div className="h-6 w-20 rounded-full bg-[#e3d9c4]/50" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f8f3ea] text-[#C6A15B]">
              <Users className="h-8 w-8" />
            </div>
            <h4 className="mt-4 font-serif text-lg font-semibold text-[#171311]">
              No Customers Found
            </h4>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#5b5b5b]">
              {debouncedSearch || statusFilter !== 'All'
                ? 'No client profiles match your current search and filter criteria.'
                : 'When customers register an account with Oud Kraft, their profiles will appear here.'}
            </p>
            {(debouncedSearch || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="mt-4 rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123F34] transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Customer Table */}
        {!loading && !error && filteredCustomers.length > 0 && (
          <>
            <div className="mt-6 -mx-6 sm:-mx-8 overflow-x-auto">
              <div className="inline-block min-w-full align-middle px-6 sm:px-8">
                <table className="min-w-full divide-y divide-[#e3d9c4]/60 text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5b5b5b]">
                      <th scope="col" className="py-3.5 pr-4 pl-2">Customer</th>
                      <th scope="col" className="px-4 py-3.5">Contact Details</th>
                      <th scope="col" className="px-4 py-3.5">Joined Date</th>
                      <th scope="col" className="px-4 py-3.5">Status</th>
                      <th scope="col" className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3d9c4]/40">
                    {paginatedCustomers.map((customer) => (
                      <tr
                        key={customer._id}
                        className="hover:bg-[#f8f3ea]/40 transition-colors"
                      >
                        {/* Name & Initials */}
                        <td className="py-4 pr-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0D3B2E] text-[#C6A15B] font-serif font-bold text-xs shadow-sm">
                              {getInitials(customer.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#171311] text-sm">
                                {customer.name || 'Unnamed Client'}
                              </p>
                              <p className="font-mono text-[10px] text-[#5b5b5b]">
                                ID: {customer._id ? `${customer._id.slice(0, 8)}...` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact Information */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[#171311]">
                              <Mail className="h-3 w-3 text-[#C6A15B]" />
                              <a
                                href={`mailto:${customer.email}`}
                                className="hover:underline hover:text-[#0D3B2E]"
                              >
                                {customer.email || '—'}
                              </a>
                            </div>
                            {customer.phone ? (
                              <div className="flex items-center gap-1.5 text-[#5b5b5b]">
                                <Phone className="h-3 w-3 text-[#C6A15B]" />
                                <a
                                  href={`tel:${customer.phone}`}
                                  className="hover:underline hover:text-[#0D3B2E]"
                                >
                                  {customer.phone}
                                </a>
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#5b5b5b]/60">No phone provided</p>
                            )}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-4 text-[#5b5b5b] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#C6A15B]" />
                            <span>{formatDate(customer.createdAt)}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              customer.isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-stone-200 bg-stone-100 text-stone-700'
                            }`}
                          >
                            {customer.isActive ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                                <span>Inactive</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(customer)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#e3d9c4] bg-[#f8f3ea]/50 px-3.5 py-1.5 text-xs font-semibold text-[#0D3B2E] hover:border-[#0D3B2E] hover:bg-[#0D3B2E] hover:text-[#C6A15B] transition-all shadow-sm active:scale-95"
                            title="View customer profile details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e3d9c4]/60 pt-4 text-xs text-[#5b5b5b]">
                <p>
                  Showing{' '}
                  <span className="font-semibold text-[#171311]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-[#171311]">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#171311]">
                    {filteredCustomers.length}
                  </span>{' '}
                  customers
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e3d9c4] bg-white text-[#171311] hover:bg-[#f8f3ea] disabled:opacity-40 disabled:hover:bg-white transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-2 font-medium text-[#171311]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e3d9c4] bg-white text-[#171311] hover:bg-[#f8f3ea] disabled:opacity-40 disabled:hover:bg-white transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};
