import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.pageYOffset > 900);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="border-t border-[#e1d4bc] bg-[#f7efe4]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-[#4f4f4f] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-serif text-lg text-[#16382d]">Oud Kraft</p>
        <div className="flex items-center gap-4">
          <p>Luxury fragrance atelier</p>
          <p>By <a href="https://silviajcn.vercel.app/" target="_blank" rel="noreferrer" className="font-semibold text-[#16382d]">Silvi</a> 💚</p>
        </div>
      </div>

      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={scrollToTop}
          className="mx-auto mb-4 flex items-center gap-2 rounded-full border border-[#d7c29c] bg-white/80 px-4 py-2 text-sm font-semibold text-[#16382d] shadow-sm"
        >
          Back to top
        </motion.button>
      )}
    </div>
  );
};