import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { getCart } from '../services/cart';
import { deliveryConfig } from '../config/businessConfig';
import {
  formatCartOrderMessage,
  buildWhatsAppUrl,
  isWhatsAppConfigured,
} from '../utils/whatsappOrder';
import { WhatsAppOrderNoticeModal } from '../components/WhatsAppOrderNoticeModal';

export const CheckoutPage = () => {
  const [cartItems] = useState(() => getCart());

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    emirate: 'Abu Dhabi',
    area: '',
    street: '',
    building: '',
    apartment: '',
    landmark: '',
    instructions: '',
  });

  const [errors, setErrors] = useState({});
  const [noticeModal, setNoticeModal] = useState({
    isOpen: false,
    type: 'prepared',
    url: '',
  });

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const delivery =
    subtotal >= deliveryConfig.freeDeliveryThreshold
      ? 0
      : deliveryConfig.abuDhabiFee;

  const total = subtotal + delivery;

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: '',
      submit: '',
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = 'Enter a valid email address.';
    }

    const phone = form.phone.replace(/\s+/g, '');

    if (!phone) {
      nextErrors.phone = 'Phone number is required.';
    } else if (
      !/^(?:\+971|00971|971|0)?5[0-9]{8}$/.test(phone)
    ) {
      nextErrors.phone =
        'Enter a UAE number such as +971 50 123 4567.';
    }

    if (!form.emirate) {
      nextErrors.emirate = 'Select an emirate.';
    }

    if (!form.area.trim()) {
      nextErrors.area = 'Area is required.';
    }

    if (!form.street.trim()) {
      nextErrors.street = 'Street is required.';
    }

    if (!form.building.trim()) {
      nextErrors.building = 'Building / Villa is required.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleWhatsAppCheckout = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    if (cartItems.length === 0) {
      setErrors({
        submit: 'Your cart is empty. Please add a product before checkout.',
      });
      return;
    }

    if (!validate()) {
      return;
    }

    if (!isWhatsAppConfigured()) {
      setNoticeModal({
        isOpen: true,
        type: 'missing',
        url: '',
      });
      return;
    }

    const messageText = formatCartOrderMessage({
      cartItems,
      subtotal,
      deliveryFee: delivery,
      total,
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      },
      deliveryAddress: {
        emirate: form.emirate,
        area: form.area.trim(),
        street: form.street.trim(),
        building: form.building.trim(),
        apartment: form.apartment.trim(),
        landmark: form.landmark.trim(),
        instructions: form.instructions.trim(),
      },
    });

    const url = buildWhatsAppUrl(messageText);
    if (url) {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      setNoticeModal({
        isOpen: true,
        type: 'prepared',
        url,
      });
    } else {
      setNoticeModal({
        isOpen: true,
        type: 'missing',
        url: '',
      });
    }
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">
            Checkout
          </p>

          <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">
            Secure order overview
          </h1>
        </div>

        {errors.submit ? (
          <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errors.submit}
          </div>
        ) : null}

        {cartItems.length === 0 ? (
          <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-[#0D3B2E]">
              Your cart is empty.
            </h2>

            <p className="mt-3 text-[#5b5b5b]">
              Add a fragrance to your cart before proceeding to
              checkout.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-[#0D3B2E] px-6 py-3 font-semibold text-white"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <form
              onSubmit={handleWhatsAppCheckout}
              className="space-y-6 rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm"
            >
              {/* Customer Information */}
              <div>
                <h2 className="text-xl font-semibold text-[#0D3B2E]">
                  Customer information
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Full name
                    </label>

                    <input
                      value={form.name}
                      onChange={(e) =>
                        updateForm('name', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    />

                    {errors.name ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Email
                    </label>

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        updateForm('email', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    />

                    {errors.email ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      UAE mobile number
                    </label>

                    <input
                      value={form.phone}
                      onChange={(e) =>
                        updateForm('phone', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                      placeholder="+971 50 123 4567"
                    />

                    {errors.phone ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="text-xl font-semibold text-[#0D3B2E]">
                  Delivery address
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Emirate
                    </label>

                    <select
                      value={form.emirate}
                      onChange={(e) =>
                        updateForm('emirate', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    >
                      {deliveryConfig.supportedEmirates.map(
                        (emirate) => (
                          <option key={emirate} value={emirate}>
                            {emirate}
                          </option>
                        )
                      )}
                    </select>

                    {errors.emirate ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.emirate}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Area
                    </label>

                    <input
                      value={form.area}
                      onChange={(e) =>
                        updateForm('area', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    />

                    {errors.area ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.area}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Street
                    </label>

                    <input
                      value={form.street}
                      onChange={(e) =>
                        updateForm('street', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    />

                    {errors.street ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.street}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Building / Villa
                    </label>

                    <input
                      value={form.building}
                      onChange={(e) =>
                        updateForm('building', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    />

                    {errors.building ? (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.building}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Apartment / Flat
                    </label>

                    <input
                      value={form.apartment}
                      onChange={(e) =>
                        updateForm('apartment', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Landmark
                    </label>

                    <input
                      value={form.landmark}
                      onChange={(e) =>
                        updateForm('landmark', e.target.value)
                      }
                      className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">
                      Additional instructions
                    </label>

                    <textarea
                      value={form.instructions}
                      onChange={(e) =>
                        updateForm('instructions', e.target.value)
                      }
                      className="w-full rounded-[24px] border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Order via WhatsApp Button */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C6A15B] px-6 py-4 font-semibold text-[#0D3B2E] transition hover:bg-[#d4b570] shadow-md active:scale-98"
                >
                  <MessageCircle size={20} className="text-[#0D3B2E]" />
                  Order on WhatsApp
                </button>

                <div className="rounded-[16px] border border-[#e3d9c4] bg-[#F8F4EC] p-3.5 text-center text-xs leading-5 text-[#0D3B2E]">
                  <strong>Note:</strong> Your order is not confirmed until Oud Kraft replies on WhatsApp. The business will confirm availability, delivery details and Cash on Delivery manually.
                </div>

                <div className="mt-2 text-center">
                  <Link
                    to="/cart"
                    className="inline-flex items-center text-sm font-medium text-[#5b5b5b] transition hover:text-[#0D3B2E]"
                  >
                    ← Return to Shopping Bag
                  </Link>
                </div>
              </div>
            </form>

            {/* Order Summary */}
            <aside className="h-fit rounded-[28px] border border-[#e3d9c4] bg-[#123F34] p-6 text-white shadow-sm">
              <h2 className="text-xl font-semibold">
                Order summary
              </h2>

              <div className="mt-6 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id || item._id}-${item.size}`}
                    className="flex items-center justify-between gap-4 text-sm text-[#efe4d0]"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span>
                      AED{' '}
                      {Number(item.price) *
                        Number(item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-white/20 pt-4 text-sm text-[#efe4d0]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>AED {subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {delivery === 0
                      ? 'Free'
                      : `AED ${delivery}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>AED 0</span>
                </div>

                <div className="flex justify-between border-t border-white/20 pt-3 text-base font-semibold text-white">
                  <span>Total</span>
                  <span>AED {total}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <WhatsAppOrderNoticeModal
        isOpen={noticeModal.isOpen}
        onClose={() => setNoticeModal((m) => ({ ...m, isOpen: false }))}
        type={noticeModal.type}
        whatsAppUrl={noticeModal.url}
      />
    </Layout>
  );
};