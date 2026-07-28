import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getCart, saveCart, updateCartItem } from '../services/cart';

export const ProductCard = ({ product }) => {
  const [wishlist, setWishlist] = useState([]);
  const [cartMessage, setCartMessage] = useState('');
  const cartCount = useMemo(() => getCart().reduce((sum, item) => sum + item.quantity, 0), [cartMessage]);

  const toggleWishlist = () => {
    const next = wishlist.includes(product.id) ? wishlist.filter((item) => item !== product.id) : [...wishlist, product.id];
    setWishlist(next);
  };

  const addToCart = () => {
    const cart = getCart();
    const nextCart = updateCartItem(cart, { ...product, size: product.size }, 1);
    saveCart(nextCart);
    setCartMessage('Added');
    setTimeout(() => setCartMessage(''), 900);
  };

  return (
    <article className="group overflow-hidden rounded-[32px] border border-[#e7d7b9] bg-white shadow-[0_20px_60px_-30px_rgba(13,59,46,0.25)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_-25px_rgba(13,59,46,0.35)]">
      <div className="relative">
        <Link to={`/product/${product.slug}`}>
          <img src={product.images[0]} alt={product.name} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-[#0D3B2E] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">{product.bestSeller ? 'Best Seller' : 'New'}</div>
        <button onClick={toggleWishlist} className="absolute right-4 top-4 rounded-full border border-[#e8dfcf] bg-white/90 p-2 text-[#0D3B2E]" aria-label="Toggle wishlist">
          <Heart size={16} fill={wishlist.includes(product.id) ? '#C6A15B' : 'none'} />
        </button>
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
          <button onClick={addToCart} className="flex items-center gap-2 rounded-full bg-[#0D3B2E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123F34]">
            <ShoppingBag size={14} /> {cartMessage || 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
};
