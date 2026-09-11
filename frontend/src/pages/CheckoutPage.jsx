import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { getCart, saveCart } from '../services/cart';
import { deliveryConfig } from '../config/businessConfig';
import { paymentMethods } from '../services/payments';
import { getApiBaseUrl } from '../config/apiConfig';

export const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState(() => getCart());

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
    paymentMethod: 'card',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

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

  const normalizePaymentMethod = (method) => {
    if (
      method === 'cash_on_delivery' ||
      method === 'cod' ||
      method === 'cash'
    ) {
      return 'cash_on_delivery';
    }

    return 'card';
  };

  const createOrder = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (cartItems.length === 0) {
      setErrors({
        submit:
          'Your cart is empty. Please add a product before checkout.',
      });

      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const orderItems = cartItems.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        slug: item.slug || '',
        image: item.images?.[0] || item.image || '',
        size: item.size || '100 ml',
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      const payload = {
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
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

        items: orderItems,

        subtotal,
        deliveryFee: delivery,
        discount: 0,
        total,

        paymentMethod: normalizePaymentMethod(
          form.paymentMethod
        ),
      };

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Unable to create your order. Please try again.'
        );
      }

      if (!result.success || !result.data) {
        throw new Error(
          result.message || 'The order could not be created.'
        );
      }

      const createdOrder = result.data;

      saveCart([]);
      setCartItems([]);
      setOrderSuccess(createdOrder);
    } catch (error) {
      console.error('Order creation failed:', error);

      setErrors({
        submit:
          error.message ||
          'Something went wrong while placing your order. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <Layout>
        <section className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full rounded-[32px] border border-[#e3d9c4] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#123F34] text-3xl text-[#C6A15B]">
              ✓
            </div>

            <p className="mt-6 text-sm uppercase tracking-[0.35em] text-[#C6A15B]">
              Order confirmed
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#0D3B2E]">
              Thank you for your order
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[#5b5b5b]">
              Your order has been successfully placed. We have
              received your order details and will begin processing
              it shortly.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-[24px] bg-[#F8F4EC] p-6 text-left">
              <div className="flex justify-between gap-4 border-b border-[#e3d9c4] pb-4">
                <span className="text-sm text-[#5b5b5b]">
                  Order number
                </span>

                <span className="font-semibold text-[#0D3B2E]">
                  {orderSuccess.orderNumber}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-[#e3d9c4] py-4">
                <span className="text-sm text-[#5b5b5b]">
                  Status
                </span>

                <span className="font-semibold text-[#0D3B2E]">
                  {orderSuccess.status}
                </span>
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <span className="text-sm text-[#5b5b5b]">
                  Total
                </span>

                <span className="font-semibold text-[#0D3B2E]">
                  AED {orderSuccess.total}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/shop"
                className="rounded-full bg-[#0D3B2E] px-6 py-3 font-semibold text-white"
              >
                Continue shopping
              </Link>

              <Link
                to="/orders"
                className="rounded-full border border-[#0D3B2E] px-6 py-3 font-semibold text-[#0D3B2E]"
              >
                View my orders
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

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
              onSubmit={createOrder}
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

              {/* Payment Method */}
              <div>
                <h2 className="text-xl font-semibold text-[#0D3B2E]">
                  Payment method
                </h2>

                <div className="mt-4 space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center justify-between rounded-[20px] border p-4 ${
                        form.paymentMethod === method.id
                          ? 'border-[#C6A15B] bg-[#F8F4EC]'
                          : 'border-[#e3d9c4] bg-white'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-[#0D3B2E]">
                          {method.label}
                        </p>

                        <p className="mt-1 text-sm text-[#5b5b5b]">
                          {method.description}
                        </p>
                      </div>

                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={
                          form.paymentMethod === method.id
                        }
                        onChange={() =>
                          updateForm(
                            'paymentMethod',
                            method.id
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Place Order */}
              <button
                type="submit"
                disabled={submitting}
                className={`rounded-full px-6 py-3 font-semibold text-white ${
                  submitting
                    ? 'cursor-not-allowed bg-[#6d8079]'
                    : 'bg-[#0D3B2E] hover:bg-[#123F34]'
                }`}
              >
                {submitting
                  ? 'Placing order...'
                  : 'Place order'}
              </button>
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
    </Layout>
  );
};