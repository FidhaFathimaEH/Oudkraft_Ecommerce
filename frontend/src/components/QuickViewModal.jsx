import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag } from 'lucide-react';

export const QuickViewModal = ({ product, open, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 sm:p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[28px] sm:rounded-[32px] bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#eae4d6] p-4 sm:p-5">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#C6A15B]">Quick View</p>
                <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold text-[#17362c]">{product.name}</h2>
              </div>
              <button onClick={onClose} className="rounded-full bg-[#f8f2e9] p-2 text-[#17362c]" aria-label="Close quick view"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto grid gap-5 p-4 sm:p-5 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#e3d9c4] bg-[#f8f2e9]">
                <img src={product.images[0]} alt={product.name} loading="lazy" className="h-56 sm:h-full w-full object-cover" />
              </div>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 text-sm text-[#5b5b5b]">
                  <Star size={16} className="text-[#C6A15B]" /> <span>{product.rating} · {product.reviewCount} reviews</span>
                </div>
                <p className="text-lg font-semibold text-[#0D3B2E]">AED {product.price}</p>
                {product.oldPrice ? <p className="text-sm text-[#8a8a8a] line-through">AED {product.oldPrice}</p> : null}
                <p className="text-sm leading-7 text-[#5b5b5b]">{product.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-[#e3d9c4] bg-[#fcfaf6] p-3.5 sm:p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]">Occasion</p>
                    <p className="mt-1.5 sm:mt-2 text-sm text-[#17362c]">{product.occasion}</p>
                  </div>
                  <div className="rounded-[20px] border border-[#e3d9c4] bg-[#fcfaf6] p-3.5 sm:p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]">Season</p>
                    <p className="mt-1.5 sm:mt-2 text-sm text-[#17362c]">{product.season}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                  <button onClick={() => { onAddToCart(product); onClose(); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D3B2E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123F34] w-full sm:w-auto">
                    <ShoppingBag size={16} /> Add to cart
                  </button>
                  <Link to={`/product/${product.slug}`} onClick={onClose} className="inline-flex items-center justify-center rounded-full border border-[#e3d9c4] px-4 py-3 text-sm font-semibold text-[#0D3B2E] w-full sm:w-auto">View full details</Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
