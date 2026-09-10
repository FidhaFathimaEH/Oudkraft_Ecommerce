import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  MessageCircle,
  Share2,
  Sparkles,
  BadgeCheck,
  Gem,
  Clock3,
} from 'lucide-react';

import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { ProductGallery } from '../components/ProductGallery';
import { ReviewsSection } from '../components/ReviewsSection';
import { QuestionsSection } from '../components/QuestionsSection';

import {
  getProductBySlug,
  getProducts,
} from '../services/products';

import { businessConfig, deliveryConfig } from '../config/businessConfig';
import { getCart, saveCart, updateCartItem } from '../services/cart';
import {
  isWishlisted,
  toggleWishlistItem,
} from '../services/wishlist';

import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const sizeOptions = ['100 ml', '50 ml', 'Travel Trio'];

export const ProductPage = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('100 ml');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  const recentlyViewedSlugs = useRecentlyViewed(product?.slug);

  /*
   * Load the product from the backend.
   */
  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getProductBySlug(slug);

        if (!cancelled) {
          setProduct(data);

          if (data) {
            setSaved(isWishlisted(data._id || data.id));
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);

        if (!cancelled) {
          setError(
            err.message || 'Failed to load product'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /*
   * Load related products from the backend.
   */
  useEffect(() => {
    let cancelled = false;

    const loadRelatedProducts = async () => {
      try {
        const products = await getProducts({
          limit: 10,
        });

        if (!cancelled && Array.isArray(products)) {
          setRelatedProducts(products);
        }
      } catch (err) {
        console.error(
          'Failed to load related products:',
          err
        );
      }
    };

    loadRelatedProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Remove the current product from related products.
   */
  const filteredRelatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    const currentId = product._id || product.id;

    return relatedProducts
      .filter((item) => {
        const itemId = item._id || item.id;
        return itemId !== currentId;
      })
      .slice(0, 3);
  }, [relatedProducts, product]);

  /*
   * Recently viewed products.
   *
   * We load the products from the API and match them
   * against the locally stored recently-viewed slugs.
   */
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadRecentlyViewed = async () => {
      if (
        !recentlyViewedSlugs ||
        recentlyViewedSlugs.length === 0
      ) {
        setRecentProducts([]);
        return;
      }

      try {
        const products = await getProducts({
          limit: 100,
        });

        if (!cancelled && Array.isArray(products)) {
          const currentSlug = product?.slug;

          const filtered = products
            .filter((item) =>
              recentlyViewedSlugs.includes(item.slug)
            )
            .filter((item) => item.slug !== currentSlug)
            .slice(0, 4);

          setRecentProducts(filtered);
        }
      } catch (err) {
        console.error(
          'Failed to load recently viewed products:',
          err
        );
      }
    };

    loadRecentlyViewed();

    return () => {
      cancelled = true;
    };
  }, [recentlyViewedSlugs, product]);

  /*
   * Wishlist state synchronization.
   */
  useEffect(() => {
    if (!product) {
      return undefined;
    }

    const productId = product._id || product.id;

    setSaved(isWishlisted(productId));

    const updateWishState = () => {
      setSaved(isWishlisted(productId));
    };

    window.addEventListener(
      'wishlist-changed',
      updateWishState
    );

    return () => {
      window.removeEventListener(
        'wishlist-changed',
        updateWishState
      );
    };
  }, [product]);

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e3d9c4] border-t-[#0D3B2E]" />

          <p className="mt-5 text-sm text-[#5b5b5b]">
            Loading fragrance...
          </p>
        </div>
      </Layout>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-3xl font-semibold text-[#0D3B2E]">
            Something went wrong
          </h1>

          <p className="mt-3 text-[#5b5b5b]">
            {error}
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-[#0D3B2E] px-6 py-3 text-white"
          >
            Back to shop
          </Link>
        </div>
      </Layout>
    );
  }

  /*
   * Product not found.
   */
  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-3xl font-semibold text-[#0D3B2E]">
            This fragrance is not available right now.
          </h1>

          <p className="mt-3 text-[#5b5b5b]">
            Please browse the collection for similar scents.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-[#0D3B2E] px-6 py-3 text-white"
          >
            Back to shop
          </Link>
        </div>
      </Layout>
    );
  }

  const productId = product._id || product.id;

  /*
   * Some older mock products used different field names.
   * These fallbacks allow the MongoDB product to work
   * without breaking the existing UI.
   */
  const inspiration =
    product.inspiration ||
    product.story ||
    'A refined fragrance crafted by Oud Kraft.';

  const detailedDescription =
    product.detailedDescription ||
    product.story ||
    'A premium fragrance designed for an elegant everyday experience.';

  const usage =
    product.usage ||
    product.howToWear ||
    'Apply to warm skin and let the fragrance develop naturally.';

  const heartNotes =
    product.middleNotes ||
    product.heartNotes ||
    [];

  const ingredients = Array.isArray(product.ingredients)
    ? product.ingredients
    : [];

  const topNotes = Array.isArray(product.topNotes)
    ? product.topNotes
    : [];

  const baseNotes = Array.isArray(product.baseNotes)
    ? product.baseNotes
    : [];

  const images = Array.isArray(product.images)
    ? product.images
    : [];

  /*
   * Add product to cart.
   */
  const addToCart = () => {
    const cartProduct = {
      ...product,
      id: productId,
      size: selectedSize,
    };

    const nextCart = updateCartItem(
      getCart(),
      cartProduct,
      quantity
    );

    saveCart(nextCart);

    setMessage('Added to cart');

    setTimeout(() => {
      setMessage('');
    }, 1200);
  };

  /*
   * Wishlist.
   */
  const toggleWishlist = () => {
    toggleWishlistItem(productId);
    setSaved((current) => !current);
  };

  /*
   * WhatsApp buy-now link.
   */
  const whatsappNumber = businessConfig?.whatsapp || '';

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : '#';

  return (
    <Layout>
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0D3B2E]"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery product={product} />

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.08,
            }}
            className="rounded-[32px] border border-[#e3d9c4] bg-white p-6 shadow-[0_25px_70px_-40px_rgba(13,59,46,0.45)] sm:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">
                  {product.category}
                </p>

                <h1 className="mt-2 font-serif text-3xl text-[#0D3B2E]">
                  {product.name}
                </h1>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleWishlist}
                  className={`rounded-full border p-3 ${
                    saved
                      ? 'border-[#C6A15B] bg-[#F8F4EC] text-[#C6A15B]'
                      : 'border-[#e3d9c4] text-[#0D3B2E]'
                  }`}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={18}
                    fill={
                      saved
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-[#e3d9c4] p-3 text-[#0D3B2E]"
                  aria-label="Share fragrance"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: inspiration,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard?.writeText(
                        window.location.href
                      );
                      setMessage(
                        'Product link copied'
                      );

                      setTimeout(() => {
                        setMessage('');
                      }, 1200);
                    }
                  }}
                >
                  <Share2 size={18} />
                </motion.button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#5b5b5b]">
              <div className="flex items-center gap-1 text-[#C6A15B]">
                <Star
                  size={14}
                  fill="currentColor"
                />
                {product.rating ?? 'N/A'}
              </div>

              <span>
                {product.reviewCount ?? 0} reviews
              </span>

              <span className="rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0D3B2E]">
                {product.stock > 0
                  ? 'In stock'
                  : 'Sold out'}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#5b5b5b]">
              {inspiration}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-3xl font-semibold text-[#111111]">
                  AED {product.price}
                </p>

                {product.oldPrice ? (
                  <p className="text-sm text-[#8a8a8a] line-through">
                    AED {product.oldPrice}
                  </p>
                ) : null}
              </div>

              {product.discount ? (
                <div className="rounded-full bg-[#17362c] px-3 py-2 text-sm font-semibold text-[#e0be7f]">
                  Save {product.discount}
                </div>
              ) : null}
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Size
              </label>

              <div className="mt-3 flex flex-wrap gap-3">
                {sizeOptions.map((size) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setSelectedSize(size)
                    }
                    className={`rounded-full px-4 py-2 text-sm ${
                      selectedSize === size
                        ? 'bg-[#0D3B2E] text-white'
                        : 'bg-[#F8F4EC] text-[#0D3B2E]'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-[#e3d9c4] px-3 py-2">
                <button
                  onClick={() =>
                    setQuantity((value) =>
                      Math.max(1, value - 1)
                    )
                  }
                  className="px-2 text-xl"
                >
                  −
                </button>

                <span className="min-w-[40px] text-center">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(
                      (value) => value + 1
                    )
                  }
                  className="px-2 text-xl"
                >
                  +
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addToCart}
                disabled={product.stock <= 0}
                className="flex items-center gap-2 rounded-full bg-[#0D3B2E] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={16} />
                {product.stock > 0
                  ? 'Add to cart'
                  : 'Sold out'}
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-[#e3d9c4] px-5 py-3 font-semibold text-[#0D3B2E]"
              >
                <MessageCircle size={16} />
                Buy Now
              </motion.a>
            </div>

            {message ? (
              <p className="mt-4 text-sm text-[#123F34]">
                {message}
              </p>
            ) : null}

            <div className="mt-8 grid gap-4 rounded-[24px] border border-[#e9e0cb] bg-[#F8F4EC] p-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck
                  size={18}
                  className="text-[#C6A15B]"
                />

                <div>
                  <h3 className="font-semibold text-[#0D3B2E]">
                    Delivery in Abu Dhabi
                  </h3>

                  <p className="text-sm text-[#5b5b5b]">
                    AED{' '}
                    {deliveryConfig?.abuDhabiFee ?? 0}{' '}
                    local handling fee.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={18}
                  className="text-[#C6A15B]"
                />

                <div>
                  <h3 className="font-semibold text-[#0D3B2E]">
                    Authenticity guarantee
                  </h3>

                  <p className="text-sm text-[#5b5b5b]">
                    100% original Oud Kraft fragrances
                    with certificate of authenticity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle
                  size={18}
                  className="text-[#C6A15B]"
                />

                <div>
                  <h3 className="font-semibold text-[#0D3B2E]">
                    Easy support
                  </h3>

                  <p className="text-sm text-[#5b5b5b]">
                    Contact us for gifting and
                    fragrance advice.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#e3d9c4] bg-[#fefcf8] p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                <Sparkles size={14} />
                Premium details
              </div>

              <p className="mt-3 leading-7 text-[#5b5b5b]">
                {detailedDescription}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] bg-white/80 p-4">
                  <div className="flex items-center gap-2 font-semibold text-[#17362c]">
                    <Gem size={16} />
                    Ingredients
                  </div>

                  <p className="mt-2 text-sm leading-7 text-[#5b5b5b]">
                    {ingredients.length > 0
                      ? ingredients.join(', ')
                      : 'Premium fragrance ingredients.'}
                  </p>
                </div>

                <div className="rounded-[20px] bg-white/80 p-4">
                  <div className="flex items-center gap-2 font-semibold text-[#17362c]">
                    <Clock3 size={16} />
                    How to use
                  </div>

                  <p className="mt-2 text-sm leading-7 text-[#5b5b5b]">
                    {usage}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                  Top notes
                </h3>

                <p className="mt-2 text-[#5b5b5b]">
                  {topNotes.length > 0
                    ? topNotes.join(', ')
                    : 'Not specified'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                  Heart notes
                </h3>

                <p className="mt-2 text-[#5b5b5b]">
                  {heartNotes.length > 0
                    ? heartNotes.join(', ')
                    : 'Not specified'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                  Base notes
                </h3>

                <p className="mt-2 text-[#5b5b5b]">
                  {baseNotes.length > 0
                    ? baseNotes.join(', ')
                    : 'Not specified'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                  Fragrance family
                </h3>

                <p className="mt-2 text-[#5b5b5b]">
                  {product.fragranceFamily ||
                    'Not specified'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <ReviewsSection product={product} />

      <QuestionsSection product={product} />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e3d9c4] bg-[#f8f2e9] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]">
            <Sparkles size={16} />
            Why fragrance lovers choose Oud Kraft
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] bg-white/70 p-4">
              <div className="flex items-center gap-2 font-semibold text-[#17362c]">
                <BadgeCheck size={16} />
                Premium ingredients
              </div>

              <p className="mt-2 text-sm leading-7 text-[#5b5b5b]">
                Rare woods, resins and florals crafted
                with care and balance.
              </p>
            </div>

            <div className="rounded-[20px] bg-white/70 p-4">
              <div className="flex items-center gap-2 font-semibold text-[#17362c]">
                <BadgeCheck size={16} />
                Long lasting wear
              </div>

              <p className="mt-2 text-sm leading-7 text-[#5b5b5b]">
                Designed to unfold gradually and
                remain memorable throughout the day.
              </p>
            </div>

            <div className="rounded-[20px] bg-white/70 p-4">
              <div className="flex items-center gap-2 font-semibold text-[#17362c]">
                <BadgeCheck size={16} />
                Luxury delivery
              </div>

              <p className="mt-2 text-sm leading-7 text-[#5b5b5b]">
                Elegant packaging and fast service
                across the UAE.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {filteredRelatedProducts.map(
            (item, index) => (
              <motion.div
                key={item._id || item.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
              >
                <ProductCard product={item} />
              </motion.div>
            )
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-3xl text-[#17362c]">
            Recently viewed
          </h2>

          {recentProducts.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-4">
              {recentProducts.map((item) => (
                <Link
                  key={item._id || item.id}
                  to={`/product/${item.slug}`}
                  className="rounded-[20px] border border-[#e3d9c4] p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="h-32 w-full rounded-[16px] object-cover"
                  />

                  <p className="mt-3 text-sm font-semibold text-[#17362c]">
                    {item.name}
                  </p>

                  <p className="mt-1 text-sm text-[#6c6c6c]">
                    AED {item.price}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#6c6c6c]">
              Your recently viewed fragrances will
              appear here.
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
};