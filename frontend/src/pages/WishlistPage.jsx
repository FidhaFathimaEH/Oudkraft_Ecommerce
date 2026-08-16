import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { getProducts } from '../services/products';
import {
  getWishlist,
  toggleWishlistItem,
} from '../services/wishlist';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistPage = () => {
  const [wishlistIds, setWishlistIds] = useState(getWishlist());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(
          'Failed to load wishlist products:',
          error
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const syncWishlist = () => {
      setWishlistIds(getWishlist());
    };

    window.addEventListener(
      'wishlist-changed',
      syncWishlist
    );

    return () => {
      window.removeEventListener(
        'wishlist-changed',
        syncWishlist
      );
    };
  }, []);

  const wishlistProducts = products.filter((product) => {
    const productId = product._id || product.id;

    return wishlistIds.includes(productId);
  });

  const toggle = (id) => {
    toggleWishlistItem(id);
    setWishlistIds(getWishlist());
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">
            Saved scents
          </p>

          <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">
            Wishlist
          </h1>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
            <p className="text-[#5b5b5b]">
              Loading your wishlist...
            </p>
          </div>
        ) : wishlistProducts.length > 0 ? (
          /* Wishlist Products */
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {wishlistProducts.map((product) => {
              const productId = product._id || product.id;

              return (
                <div
                  key={productId}
                  className="rounded-[24px] border border-[#e3d9c4] bg-white p-4 shadow-sm"
                >
                  {/* Product Image */}
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="h-56 w-full rounded-[18px] object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-[#0D3B2E]">
                        {product.name}
                      </h2>

                      <p className="mt-2 text-sm text-[#5b5b5b]">
                        {product.category} • {product.size}
                      </p>
                    </div>

                    {/* Remove From Wishlist */}
                    <button
                      type="button"
                      onClick={() => toggle(productId)}
                      className="rounded-full border border-[#e3d9c4] p-2 text-[#0D3B2E]"
                      aria-label="Remove from wishlist"
                    >
                      <Heart
                        size={16}
                        fill="#C6A15B"
                        color="#C6A15B"
                      />
                    </button>
                  </div>

                  {/* Price & View Button */}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-semibold text-[#111111]">
                      AED {product.price}
                    </p>

                    <Link
                      to={`/product/${product.slug}`}
                      className="flex items-center gap-2 rounded-full bg-[#0D3B2E] px-4 py-2 text-sm font-medium text-white"
                    >
                      <ShoppingBag size={14} />
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Wishlist */
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-[#0D3B2E]">
              Wishlist is empty.
            </h2>

            <p className="mt-3 text-[#5b5b5b]">
              Save your favourite fragrances and come back to them
              any time.
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
};