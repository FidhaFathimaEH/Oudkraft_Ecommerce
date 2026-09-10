import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { getCart, saveCart } from '../services/cart';
import { deliveryConfig } from '../config/businessConfig';
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
} from 'lucide-react';

export const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  const delivery =
    subtotal >= deliveryConfig.freeDeliveryThreshold
      ? 0
      : cartItems.length > 0
        ? deliveryConfig.abuDhabiFee
        : 0;

  const total = subtotal + delivery;

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  const updateQuantity = (product, delta) => {
    const nextCart = cartItems
      .map((item) => {
        if (
  (item._id || item.id) === (product._id || product.id) &&
  item.size === product.size
) {
          return {
            ...item,
            quantity: Math.max(0, Number(item.quantity || 0) + delta),
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCartItems(nextCart);
    saveCart(nextCart);
  };

  const removeItem = (product) => {
    const nextCart = cartItems.filter(
  (item) =>
    !(
      (item._id || item.id) === (product._id || product.id) &&
      item.size === product.size
    )
);

    setCartItems(nextCart);
    saveCart(nextCart);
  };

  const clearCart = () => {
    setCartItems([]);
    saveCart([]);
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">
              Your bag
            </p>

            <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">
              Shopping Cart
            </h1>

            {cartItems.length > 0 && (
              <p className="mt-2 text-sm text-[#5b5b5b]">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
              </p>
            )}
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="rounded-full border border-[#e3d9c4] bg-white px-4 py-2 text-sm font-medium text-[#8a3d3d] transition hover:bg-[#F8F4EC]"
            >
              Clear cart
            </button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item._id || item.id}-${item.size}`}
                  className="flex flex-col gap-4 rounded-[24px] border border-[#e3d9c4] bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                >
                  <Link
                    to={`/product/${item.slug}`}
                    className="shrink-0"
                  >
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="h-32 w-full rounded-[18px] object-cover sm:h-24 sm:w-24"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/product/${item.slug}`}
                          className="text-lg font-semibold text-[#0D3B2E] transition hover:text-[#C6A15B]"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-1 text-sm text-[#5b5b5b]">
                          {item.category} • {item.size}
                        </p>

                        {item.fragranceFamily && (
                          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#C6A15B]">
                            {item.fragranceFamily}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        className="rounded-full bg-[#F8F4EC] p-2 text-[#0D3B2E] transition hover:bg-[#eadfca] hover:text-[#8a3d3d]"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-full border border-[#e3d9c4] px-2 py-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, -1)}
                          className="rounded-full p-2 transition hover:bg-[#F8F4EC]"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-[36px] text-center text-sm font-semibold text-[#0D3B2E]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item, 1)}
                          className="rounded-full p-2 transition hover:bg-[#F8F4EC]"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#111111]">
                          AED{' '}
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toFixed(2)}
                        </p>

                        <p className="text-sm text-[#8a8a8a]">
                          AED {Number(item.price || 0).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                to="/shop"
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#e3d9c4] px-5 py-3 text-sm font-semibold text-[#0D3B2E] transition hover:bg-[#F8F4EC]"
              >
                <ArrowLeft size={16} />
                Continue shopping
              </Link>
            </div>

            <div className="h-fit rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-6 text-white shadow-sm lg:sticky lg:top-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2">
                  <ShoppingBag size={18} className="text-[#C6A15B]" />
                </div>

                <h2 className="text-xl font-semibold">
                  Order summary
                </h2>
              </div>

              <div className="mt-6 space-y-4 text-sm text-[#efe4d0]">
                <div className="flex justify-between gap-4">
                  <span>Subtotal</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Delivery</span>
                  <span>
                    {delivery === 0
                      ? 'Free'
                      : `AED ${delivery.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Discount</span>
                  <span>AED 0.00</span>
                </div>

                {subtotal > 0 &&
                  subtotal < deliveryConfig.freeDeliveryThreshold && (
                    <div className="rounded-[16px] bg-white/10 p-3 text-xs leading-5 text-[#efe4d0]">
                      Add AED{' '}
                      {(
                        deliveryConfig.freeDeliveryThreshold - subtotal
                      ).toFixed(2)}{' '}
                      more to unlock free delivery.
                    </div>
                  )}

                <div className="mt-4 flex justify-between border-t border-white/20 pt-4 text-base font-semibold text-white">
                  <span>Total</span>
                  <span>AED {total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#C6A15B] px-5 py-3 font-semibold text-[#0D3B2E] transition hover:bg-[#d4b570]"
              >
                Proceed to checkout
                <ArrowRight size={16} />
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-[#d8d0c0]">
                Secure checkout and elegant gift-ready packaging available.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F4EC]">
              <ShoppingBag size={26} className="text-[#C6A15B]" />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-[#0D3B2E]">
              Your cart is empty.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-[#5b5b5b]">
              Begin with a signature scent or explore the collection for
              gifting options.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D3B2E] px-6 py-3 font-semibold text-white transition hover:bg-[#123F34]"
            >
              Continue shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
};