import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCart, saveCart, updateCartItem } from '../services/cart';
import { isWishlisted, toggleWishlistItem } from '../services/wishlist';

export const ProductCard = ({ product, onQuickView, onAddToCart: onAddToCartProp }) => {
  const [saved, setSaved] = useState(isWishlisted(product.id));
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    const updateWishState = () => setSaved(isWishlisted(product.id));
    window.addEventListener('wishlist-changed', updateWishState);
    updateWishState();
    return () => window.removeEventListener('wishlist-changed', updateWishState);
  }, [product.id]);

  const toggleWishlist = () => {
    toggleWishlistItem(product.id);
    setSaved((current) => !current);
  };

  const addToCart = () => {
    if (onAddToCartProp) {
      onAddToCartProp(product);
      setCartMessage('Added');
      setTimeout(() => setCartMessage(''), 900);
      return;
    }

    const cart = getCart();
    const nextCart = updateCartItem(cart, { ...product, size: product.size }, 1);
    saveCart(nextCart);
    setCartMessage('Added');
    setTimeout(() => setCartMessage(''), 900);
  };

  return (
    <motion.article whileHover={{ y: -8, scale: 1.01, boxShadow: '0 28px 70px -24px rgba(13,59,46,0.35)' }} transition={{ duration: 0.3 }} className="group overflow-hidden rounded-[32px] border border-[#e7d7b9] bg-white shadow-[0_20px_60px_-30px_rgba(13,59,46,0.25)]">
      <div className="relative">
        <Link to={`/product/${product.slug}`}>
          <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} src={product.images[0]} alt={product.name} className="h-72 w-full object-cover" />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-[#0D3B2E] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">{product.bestseller ? 'Best Seller' : 'New'}</div>
        {product.discount ? <div className="absolute left-4 top-14 rounded-full bg-[#C6A15B] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">{product.discount} off</div> : null}
        <motion.button whileTap={{ scale: 0.94 }} onClick={toggleWishlist} className="absolute right-4 top-4 rounded-full border border-[#e8dfcf] bg-white/90 p-2 text-[#0D3B2E]" aria-label="Toggle wishlist">
          <Heart size={16} fill={saved ? '#C6A15B' : 'none'} />
        </motion.button>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-[#6b6b6b]">
          <span>{product.gender}</span>
          <div className="flex items-center gap-1 text-[#C6A15B]"><Star size={14} fill="currentColor" /> {product.rating}</div>
        </div>
        <Link to={`/product/${product.slug}`}><h3 className="mt-3 text-xl font-semibold text-[#0D3B2E]">{product.name}</h3></Link>
        <p className="mt-2 text-sm text-[#5d5d5d]">{product.category} • {product.size}</p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-[#111111]">AED {product.price}</p>
            {product.oldPrice ? <p className="text-sm text-[#8a8a8a] line-through">AED {product.oldPrice}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.96 }} onClick={addToCart} className="flex items-center gap-2 rounded-full bg-[#0D3B2E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123F34]">
              <ShoppingBag size={14} /> {cartMessage || 'Add'}
            </motion.button>
            {onQuickView ? (
              <button type="button" onClick={() => onQuickView(product)} className="rounded-full border border-[#e3d9c4] px-3 py-2 text-sm text-[#0D3B2E]">Quick view</button>
            ) : (
              <Link to={`/product/${product.slug}`} className="rounded-full border border-[#e3d9c4] px-3 py-2 text-sm text-[#0D3B2E]">Quick view</Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
