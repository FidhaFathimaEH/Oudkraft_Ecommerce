import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-AE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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

export const CustomerDetailsModal = ({ customer, isOpen, onClose }) => {
  if (!isOpen || !customer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25 }}
          className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl border border-[#e3d9c4] bg-[#f8f3ea] shadow-2xl flex flex-col"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-[#e3d9c4] bg-white px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D3B2E] text-[#C6A15B] font-serif font-bold text-base shadow-sm">
                {getInitials(customer.name)}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#171311]">
                  {customer.name || 'Client Profile'}
                </h3>
                <p className="font-mono text-[10px] text-[#5b5b5b]">
                  ID: {customer._id}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#5b5b5b] hover:bg-[#f8f3ea] hover:text-[#171311] transition-colors"
              aria-label="Close profile"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Info */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Status Card */}
            <div className="flex items-center justify-between rounded-2xl border border-[#e3d9c4] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {customer.isActive ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-[#171311]">Account Standing</p>
                  <p className="text-[11px] text-[#5b5b5b]">
                    {customer.isActive ? 'Active client in good standing' : 'Account inactive or suspended'}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  customer.isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-stone-200 bg-stone-100 text-stone-700'
                }`}
              >
                {customer.isActive ? 'Active Client' : 'Inactive'}
              </span>
            </div>

            {/* Contact Details Card */}
            <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                Contact Information
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b] block">Full Name</span>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#171311]">
                    <User className="h-4 w-4 text-[#C6A15B]" />
                    <span>{customer.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b] block">Email Address</span>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#171311]">
                      <Mail className="h-4 w-4 text-[#C6A15B]" />
                      <span className="break-all">{customer.email}</span>
                    </div>
                    {customer.email && (
                      <a
                        href={`mailto:${customer.email}`}
                        className="rounded-lg bg-[#f8f3ea] px-2.5 py-1 text-[11px] font-semibold text-[#0D3B2E] hover:bg-[#efe4d0] transition-colors"
                      >
                        Send Email
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#5b5b5b] block">Phone Number</span>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#171311]">
                      <Phone className="h-4 w-4 text-[#C6A15B]" />
                      <span>{customer.phone || '—'}</span>
                    </div>
                    {customer.phone && (
                      <a
                        href={`tel:${customer.phone}`}
                        className="rounded-lg bg-[#f8f3ea] px-2.5 py-1 text-[11px] font-semibold text-[#0D3B2E] hover:bg-[#efe4d0] transition-colors"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration History */}
            <div className="rounded-2xl border border-[#e3d9c4] bg-white p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
                Membership History
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#5b5b5b]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#C6A15B]" />
                    <span>Registered On</span>
                  </span>
                  <span className="font-medium text-[#171311]">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#5b5b5b]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#C6A15B]" />
                    <span>Role Classification</span>
                  </span>
                  <span className="rounded-full bg-[#f8f3ea] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#0D3B2E]">
                    Customer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end border-t border-[#e3d9c4] bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#0D3B2E] bg-[#0D3B2E] px-6 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-[#123F34] transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

CustomerDetailsModal.propTypes = {
  customer: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
