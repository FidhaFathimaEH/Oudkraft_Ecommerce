import PropTypes from 'prop-types';
import { MessageCircle, CheckCircle, AlertTriangle, ExternalLink, X } from 'lucide-react';

export const WhatsAppOrderNoticeModal = ({
  isOpen,
  onClose,
  type = 'prepared', // 'prepared' | 'missing'
  whatsAppUrl = '',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-5 top-5 rounded-full p-2 text-[#5b5b5b] transition hover:bg-[#F8F4EC] hover:text-[#0D3B2E]"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {type === 'missing' ? (
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle size={28} />
            </div>

            <p className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-[#C6A15B]">
              Concierge Notice
            </p>

            <h3 className="mt-2 text-center font-serif text-2xl text-[#0D3B2E]">
              WhatsApp Ordering Unavailable
            </h3>

            <p className="mt-4 text-center text-sm leading-6 text-[#5b5b5b]">
              Our direct WhatsApp concierge service is currently undergoing routine configuration.
              Please reach out directly to our concierge team at <strong>hello@oudkraft.ae</strong> or visit our Contact page.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-[#0D3B2E] px-6 py-3 font-semibold text-white transition hover:bg-[#123F34] sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#123F34] text-[#C6A15B]">
              <MessageCircle size={28} />
            </div>

            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-semibold text-[#0D3B2E]">
                <CheckCircle size={14} className="text-[#C6A15B]" />
                Step 2 of 2: Send Message in WhatsApp
              </span>
            </div>

            <h3 className="mt-3 text-center font-serif text-2xl text-[#0D3B2E]">
              Order Prepared in WhatsApp
            </h3>

            <p className="mt-3 text-center text-sm leading-6 text-[#5b5b5b]">
              Your order summary has been prefilled in WhatsApp. To proceed:
            </p>

            <div className="mt-4 space-y-2 rounded-[20px] bg-[#F8F4EC] p-4 text-left text-xs leading-5 text-[#0D3B2E]">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E] text-[10px] font-bold text-white">
                  1
                </span>
                <span>Review the prefilled message and click <strong>Send</strong> in WhatsApp.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E] text-[10px] font-bold text-white">
                  2
                </span>
                <span>Our boutique concierge will review your request and confirm availability, delivery details and Cash on Delivery manually.</span>
              </div>
            </div>

            <div className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50/70 p-3 text-center text-xs text-amber-900 leading-5">
              <strong>Please Note:</strong> Your order is not confirmed until Oud Kraft replies on WhatsApp. The business will confirm availability, delivery details and Cash on Delivery manually.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#20ba59]"
                >
                  <ExternalLink size={16} />
                  Re-open WhatsApp
                </a>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#0D3B2E] px-6 py-3 font-semibold text-[#0D3B2E] transition hover:bg-[#F8F4EC]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

WhatsAppOrderNoticeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['prepared', 'missing']),
  whatsAppUrl: PropTypes.string,
};
