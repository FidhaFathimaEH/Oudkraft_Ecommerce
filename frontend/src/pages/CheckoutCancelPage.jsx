import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

export const CheckoutCancelPage = () => {
  return (
    <Layout>
      <section className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-[32px] border border-[#e3d9c4] bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fdf3e7] text-2xl text-[#b87333]">
            ✕
          </div>

          <p className="mt-6 text-sm uppercase tracking-[0.35em] text-[#b87333]">
            Payment Cancelled
          </p>

          <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E] sm:text-4xl">
            Checkout was not completed
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[#5b5b5b]">
            Your payment session was cancelled and your card was not charged.
            Your selected items remain safely in your bag so you can complete
            your order whenever you are ready.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/checkout"
              className="rounded-full bg-[#0D3B2E] px-8 py-3 font-semibold text-white transition hover:bg-[#123F34]"
            >
              Return to Checkout
            </Link>
            <Link
              to="/cart"
              className="rounded-full border border-[#0D3B2E] px-8 py-3 font-semibold text-[#0D3B2E] transition hover:bg-[#F8F4EC]"
            >
              View Shopping Bag
            </Link>
            <Link
              to="/shop"
              className="rounded-full border border-[#e3d9c4] px-8 py-3 font-semibold text-[#5b5b5b] transition hover:bg-[#F8F4EC]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};
