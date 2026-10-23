import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileCheck,
  MessageCircle,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const WhatsAppHandoffModal = ({
  isOpen,
  onClose,
  order,
  invoiceFilename,
}) => {
  if (!isOpen || !order) return null;

  const rawPhone = order.customer?.phone || '';
  const cleanPhone = String(rawPhone).replace(/\D/g, '');
  const hasValidPhone = cleanPhone.length >= 7;

  // Format international URL only if digits are available; never substitute business number
  const customerWhatsAppUrl = hasValidPhone ? `https://wa.me/${cleanPhone}` : '';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-2xl sm:p-8"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-[#5b5b5b] transition hover:bg-[#F8F4EC] hover:text-[#0D3B2E]"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#123F34] text-[#C6A15B]">
              <FileCheck size={28} />
            </div>

            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-semibold text-[#0D3B2E]">
              <CheckCircle2 size={13} className="text-[#C6A15B]" />
              PDF Invoice Ready
            </span>

            <h3 className="mt-2 font-serif text-2xl font-bold text-[#0D3B2E]">
              Invoice Downloaded Successfully
            </h3>

            {invoiceFilename ? (
              <p className="mt-1 font-mono text-xs font-semibold text-[#C6A15B] break-all">
                {invoiceFilename}
              </p>
            ) : null}

            <p className="mt-3 text-xs leading-5 text-[#5b5b5b]">
              Confirmed order for{' '}
              <strong className="text-[#0D3B2E]">{order.customer?.name}</strong>{' '}
              ({order.orderNumber || order._id}). Follow the steps below to complete the WhatsApp handoff:
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="mt-5 space-y-2.5 rounded-[20px] bg-[#F8F4EC] p-4 text-left text-xs text-[#0D3B2E]">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E] text-[10px] font-bold text-white">
                1
              </span>
              <p className="leading-5">
                The branded invoice has been saved to your browser downloads folder.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E] text-[10px] font-bold text-white">
                2
              </span>
              <p className="leading-5">
                Click <strong>“Open Customer WhatsApp”</strong> below to open the chat window with{' '}
                <strong className="text-[#0D3B2E]">{order.customer?.name}</strong>.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E] text-[10px] font-bold text-white">
                3
              </span>
              <p className="leading-5">
                Attach the downloaded PDF invoice directly to the WhatsApp conversation.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E] text-[10px] font-bold text-white">
                4
              </span>
              <p className="leading-5">
                Review the conversation details and manually press <strong>Send</strong>.
              </p>
            </div>
          </div>

          {/* Transparency Alert */}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 leading-relaxed">
            <Info size={16} className="shrink-0 text-amber-700 mt-0.5" />
            <p>
              <strong>Important:</strong> Opening WhatsApp does not automatically send messages or deliver files. You must manually attach the invoice and click send.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {customerWhatsAppUrl ? (
              <a
                href={customerWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-sm transition hover:bg-[#20ba59]"
              >
                <MessageCircle size={16} />
                Open Customer WhatsApp
                <ExternalLink size={13} />
              </a>
            ) : (
              <div className="flex-1 rounded-full bg-stone-100 px-4 py-3 text-center text-xs text-stone-500">
                Customer phone not formatted for direct link ({rawPhone || 'Missing'})
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#0D3B2E] px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#0D3B2E] transition hover:bg-[#F8F4EC]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

WhatsAppHandoffModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  invoiceFilename: PropTypes.string,
};
