import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { getCart, saveCart } from '../services/cart';
import { deliveryConfig } from '../config/businessConfig';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export const CartPage = () => {
  const [cartItems, setCartItems] = useState(getCart());
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const delivery = subtotal >= deliveryConfig.freeDeliveryThreshold ? 0 : deliveryConfig.abuDhabiFee;
  const total = subtotal + delivery;

  const updateQuantity = (product, delta) => {
    const next = cartItems.map((item) => item.id === product.id && item.size === product.size ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0);
    setCartItems(next);
    saveCart(next);
  };

  const removeItem = (product) => {
    const next = cartItems.filter((item) => !(item.id === product.id && item.size === product.size));
    setCartItems(next);
    saveCart(next);
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">Your bag</p>
            <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">Cart</h1>
          </div>
          <p className="text-sm text-[#5b5b5b]">Delivery and checkout details are ready for your client presentation.</p>
        </div>
        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex flex-col gap-4 rounded-[24px] border border-[#e3d9c4] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <img src={item.images?.[0]} alt={item.name} className="h-24 w-full rounded-[18px] object-cover sm:w-24" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-[#0D3B2E]">{item.name}</h2>
                        <p className="mt-1 text-sm text-[#5b5b5b]">{item.category} • {item.size}</p>
                      </div>
                      <button onClick={() => removeItem(item)} className="rounded-full bg-[#F8F4EC] p-2 text-[#0D3B2E]"><Trash2 size={16} /></button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-full border border-[#e3d9c4] px-2 py-2">
                        <button onClick={() => updateQuantity(item, -1)} className="rounded-full p-2 hover:bg-[#F8F4EC]"><Minus size={14} /></button>
                        <span className="min-w-[30px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, 1)} className="rounded-full p-2 hover:bg-[#F8F4EC]"><Plus size={14} /></button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#111111]">AED {item.price * item.quantity}</p>
                        <p className="text-sm text-[#8a8a8a]">AED {item.price} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-6 text-white shadow-sm">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <div className="mt-6 space-y-3 text-sm text-[#efe4d0]">
                <div className="flex justify-between"><span>Subtotal</span><span>AED {subtotal}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? 'Free' : `AED ${delivery}`}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>AED 0</span></div>
                <div className="mt-4 flex justify-between border-t border-white/20 pt-4 text-base font-semibold text-white"><span>Total</span><span>AED {total}</span></div>
              </div>
              <Link to="/checkout" className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#C6A15B] px-5 py-3 font-semibold text-[#0D3B2E]">Proceed to checkout <ArrowRight size={16} /></Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-[#0D3B2E]">Your cart is empty.</h2>
            <p className="mt-3 text-[#5b5b5b]">Begin with a signature scent or explore the collection for gifting options.</p>
            <Link to="/shop" className="mt-6 inline-flex rounded-full bg-[#0D3B2E] px-6 py-3 text-white">Continue shopping</Link>
          </div>
        )}
      </section>
    </Layout>
  );
};
