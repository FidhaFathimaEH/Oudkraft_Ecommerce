import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { useState } from 'react';

export const ProductGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <div>
      <div className="overflow-hidden rounded-[32px] border border-[#e3d9c4] bg-[linear-gradient(135deg,#fcf8f1_0%,#f4e9d7_100%)] p-3 shadow-[0_25px_70px_-40px_rgba(13,59,46,0.45)] sm:p-4">
        <motion.div layout className="relative overflow-hidden rounded-[24px]">
          <motion.img
            key={product.images[selectedImage]}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            src={product.images[selectedImage]}
            alt={product.name}
            className="h-[430px] w-full rounded-[24px] object-cover sm:h-[520px]"
          />
          <button
            onClick={() => setIsZoomOpen(true)}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-[#17362c] backdrop-blur"
          >
            <Maximize2 size={16} /> Zoom
          </button>
        </motion.div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {product.images.map((image, index) => (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={`${product.slug}-${index}`}
            onClick={() => setSelectedImage(index)}
            className={`overflow-hidden rounded-[20px] border ${selectedImage === index ? 'border-[#C6A15B]' : 'border-[#e3d9c4]'}`}
          >
            <img src={image} alt={`${product.name} view ${index + 1}`} className="h-24 w-full object-cover" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {isZoomOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#07120f]/80 px-4 py-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-4xl rounded-[28px] bg-white p-3 shadow-2xl"
            >
              <button
                onClick={() => setIsZoomOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#17362c]"
              >
                <X size={18} />
              </button>
              <img src={product.images[selectedImage]} alt={product.name} className="max-h-[80vh] w-full rounded-[24px] object-contain" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
