import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Star, Truck, ShieldCheck, MessageCircle, Share2, Sparkles, BadgeCheck, Gem, Clock3 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { ProductGallery } from '../components/ProductGallery';
import { ReviewsSection } from '../components/ReviewsSection';
import { QuestionsSection } from '../components/QuestionsSection';
import { getProductBySlug, getProducts } from '../services/products';
import { businessConfig, deliveryConfig } from '../config/businessConfig';
import { getCart, saveCart, updateCartItem } from '../services/cart';
import { isWishlisted, toggleWishlistItem } from '../services/wishlist';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const sizeOptions = ['100 ml', '50 ml', 'Travel Trio'];

export const ProductPage = () => {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('100 ml');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(isWishlisted(product?.id));
  const recentlyViewedSlugs = useRecentlyViewed(product?.slug);
  const relatedProducts = useMemo(() => getProducts().filter((item) => item.id !== product?.id).slice(0, 3), [product]);
  const recentlyViewed = useMemo(() => getProducts().filter((item) => recentlyViewedSlugs.includes(item.slug) && item.slug !== product?.slug).slice(0, 4), [recentlyViewedSlugs, product]);

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold text-[#0D3B2E]">This fragrance is not available right now.</h1>
          <p className="mt-3 text-[#5b5b5b]">Please browse the collection for similar scents.</p>
          <Link to="/shop" className="mt-6 inline-flex rounded-full bg-[#0D3B2E] px-6 py-3 text-white">Back to shop</Link>
        </div>
      </Layout>
    );
  }

  const addToCart = () => {
    const nextCart = updateCartItem(getCart(), { ...product, size: selectedSize }, quantity);
    saveCart(nextCart);
    setMessage('Added to cart');
    setTimeout(() => setMessage(''), 1200);
  };

  useEffect(() => {
    setSaved(isWishlisted(product.id));
    const updateWishState = () => setSaved(isWishlisted(product.id));
    window.addEventListener('wishlist-changed', updateWishState);
    return () => window.removeEventListener('wishlist-changed', updateWishState);
  }, [product.id]);

  const toggleWishlist = () => {
    toggleWishlistItem(product.id);
    setSaved((current) => !current);
  };

  return (
    <Layout>
      <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-[#0D3B2E]"><ArrowLeft size={16} /> Back to shop</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery product={product} />

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.08 }} className="rounded-[32px] border border-[#e3d9c4] bg-white p-6 shadow-[0_25px_70px_-40px_rgba(13,59,46,0.45)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">{product.category}</p>
                <h1 className="mt-2 font-serif text-3xl text-[#0D3B2E]">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={toggleWishlist} className={`rounded-full border p-3 ${saved ? 'border-[#C6A15B] bg-[#F8F4EC] text-[#C6A15B]' : 'border-[#e3d9c4] text-[#0D3B2E]'}`} aria-label="Add to wishlist">
                  <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} className="rounded-full border border-[#e3d9c4] p-3 text-[#0D3B2E]" aria-label="Share fragrance">
                  <Share2 size={18} />
                </motion.button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#5b5b5b]">
              <div className="flex items-center gap-1 text-[#C6A15B]"><Star size={14} fill="currentColor" /> {product.rating}</div>
              <span>{product.reviewCount} reviews</span>
              <span className="rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0D3B2E]">{product.stock > 0 ? 'In stock' : 'Sold out'}</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#5b5b5b]">{product.inspiration}</p>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-3xl font-semibold text-[#111111]">AED {product.price}</p>
                {product.oldPrice ? <p className="text-sm text-[#8a8a8a] line-through">AED {product.oldPrice}</p> : null}
              </div>
              {product.discount ? <div className="rounded-full bg-[#17362c] px-3 py-2 text-sm font-semibold text-[#e0be7f]">Save {product.discount}</div> : null}
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Size</label>
              <div className="mt-3 flex flex-wrap gap-3">
                {sizeOptions.map((size) => (
                  <motion.button key={size} whileTap={{ scale: 0.97 }} onClick={() => setSelectedSize(size)} className={`rounded-full px-4 py-2 text-sm ${selectedSize === size ? 'bg-[#0D3B2E] text-white' : 'bg-[#F8F4EC] text-[#0D3B2E]'}`}>{size}</motion.button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-[#e3d9c4] px-3 py-2">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-2 text-xl">−</button>
                <span className="min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity((value) => value + 1)} className="px-2 text-xl">+</button>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addToCart} className="flex items-center gap-2 rounded-full bg-[#0D3B2E] px-5 py-3 font-semibold text-white"> <ShoppingBag size={16} /> Add to cart</motion.button>
              <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} href={`https://wa.me/${businessConfig.whatsapp}`} className="flex items-center gap-2 rounded-full border border-[#e3d9c4] px-5 py-3 font-semibold text-[#0D3B2E]"> <MessageCircle size={16} /> Buy Now</motion.a>
            </div>
            {message ? <p className="mt-4 text-sm text-[#123F34]">{message}</p> : null}

            <div className="mt-8 grid gap-4 rounded-[24px] border border-[#e9e0cb] bg-[#F8F4EC] p-4 md:grid-cols-3">
              <div className="flex items-center gap-3"><Truck size={18} className="text-[#C6A15B]" /><div><h3 className="font-semibold text-[#0D3B2E]">Delivery in Abu Dhabi</h3><p className="text-sm text-[#5b5b5b]">AED {deliveryConfig.abuDhabiFee} local handling fee.</p></div></div>
              <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-[#C6A15B]" /><div><h3 className="font-semibold text-[#0D3B2E]">Authenticity guarantee</h3><p className="text-sm text-[#5b5b5b]">100% original Oud Kraft fragrances with certificate of authenticity.</p></div></div>
              <div className="flex items-center gap-3"><MessageCircle size={18} className="text-[#C6A15B]" /><div><h3 className="font-semibold text-[#0D3B2E]">Easy support</h3><p className="text-sm text-[#5b5b5b]">Contact us for gifting and fragrance advice.</p></div></div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#e3d9c4] bg-[#fefcf8] p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]"><Sparkles size={14} /> Premium details</div>
              <p className="mt-3 leading-7 text-[#5b5b5b]">{product.detailedDescription}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] bg-white/80 p-4"><div className="flex items-center gap-2 text-[#17362c] font-semibold"><Gem size={16} /> Ingredients</div><p className="mt-2 text-sm leading-7 text-[#5b5b5b]">{product.ingredients.join(', ')}</p></div>
                <div className="rounded-[20px] bg-white/80 p-4"><div className="flex items-center gap-2 text-[#17362c] font-semibold"><Clock3 size={16} /> How to use</div><p className="mt-2 text-sm leading-7 text-[#5b5b5b]">{product.usage}</p></div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Top notes</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.topNotes.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Heart notes</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.middleNotes?.join(', ') || product.heartNotes.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Base notes</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.baseNotes.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">Fragrance family</h3>
                <p className="mt-2 text-[#5b5b5b]">{product.fragranceFamily}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <ReviewsSection product={product} />
      <QuestionsSection product={product} />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e3d9c4] bg-[#f8f2e9] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]"><Sparkles size={16} /> Why fragrance lovers choose Oud Kraft</div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] bg-white/70 p-4"><div className="flex items-center gap-2 text-[#17362c] font-semibold"><BadgeCheck size={16} /> Premium ingredients</div><p className="mt-2 text-sm leading-7 text-[#5b5b5b]">Rare woods, resins and florals crafted with care and balance.</p></div>
            <div className="rounded-[20px] bg-white/70 p-4"><div className="flex items-center gap-2 text-[#17362c] font-semibold"><BadgeCheck size={16} /> Long lasting wear</div><p className="mt-2 text-sm leading-7 text-[#5b5b5b]">Designed to unfold gradually and remain memorable throughout the day.</p></div>
            <div className="rounded-[20px] bg-white/70 p-4"><div className="flex items-center gap-2 text-[#17362c] font-semibold"><BadgeCheck size={16} /> Luxury delivery</div><p className="mt-2 text-sm leading-7 text-[#5b5b5b]">Elegant packaging and fast service across the UAE.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {relatedProducts.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.06 }}>
              <ProductCard product={item} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-3xl text-[#17362c]">Recently viewed</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {recentlyViewed.map((item) => (
              <Link key={item.id} to={`/product/${item.slug}`} className="rounded-[20px] border border-[#e3d9c4] p-4 transition hover:-translate-y-1 hover:shadow-md">
                <img src={item.images[0]} alt={item.name} className="h-32 w-full rounded-[16px] object-cover" />
                <p className="mt-3 text-sm font-semibold text-[#17362c]">{item.name}</p>
                <p className="mt-1 text-sm text-[#6c6c6c]">AED {item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};
