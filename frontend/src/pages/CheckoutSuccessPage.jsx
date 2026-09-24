import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { saveCart } from '../services/cart';

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    // If arriving from a valid checkout session, clear purchased items from cart
    if (sessionId) {
      saveCart([]);
    }

    // Retrieve pending order information stored prior to Stripe redirection
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const stored = window.sessionStorage.getItem('oudkraft_pending_order');
        if (stored) {
          setOrderInfo(JSON.parse(stored));
        }
      } catch {
        // Ignore session parse issues
      }
    }
  }, [sessionId]);

  return (
    <Layout>
      <section className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-[32px] border border-[#e3d9c4] bg-white p-8 text-center shadow-sm sm:p-12">
          {sessionId ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#123F34] text-3xl text-[#C6A15B]">
                ✓
              </div>

              <p className="mt-6 text-sm uppercase tracking-[0.35em] text-[#C6A15B]">
                Payment Received & Processing
              </p>

              <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E] sm:text-4xl">
                Thank you for your order
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-[#5b5b5b]">
                Your checkout session has been completed with Stripe. Our backend
                webhook is verifying payment settlement and your order is being
                prepared for dispatch.
              </p>

              <div className="mx-auto mt-8 max-w-md rounded-[24px] bg-[#F8F4EC] p-6 text-left">
                {orderInfo?.orderNumber && (
                  <div className="flex justify-between gap-4 border-b border-[#e3d9c4] pb-4">
                    <span className="text-sm text-[#5b5b5b]">Order Number</span>
                    <span className="font-semibold text-[#0D3B2E]">
                      {orderInfo.orderNumber}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-4 border-b border-[#e3d9c4] py-4">
                  <span className="text-sm text-[#5b5b5b]">Payment Gateway</span>
                  <span className="font-medium text-[#0D3B2E]">Stripe Checkout</span>
                </div>

                <div className="flex justify-between gap-4 border-b border-[#e3d9c4] py-4">
                  <span className="text-sm text-[#5b5b5b]">Status</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f0ec] px-3 py-1 text-xs font-semibold text-[#123F34]">
                    <span className="h-2 w-2 rounded-full bg-[#123F34] animate-pulse" />
                    Payment Processing
                  </span>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <span className="text-sm text-[#5b5b5b]">Session Ref</span>
                  <span className="font-mono text-xs text-[#5b5b5b]" title={sessionId}>
                    {sessionId.slice(0, 16)}...
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/shop"
                  className="rounded-full bg-[#0D3B2E] px-8 py-3 font-semibold text-white transition hover:bg-[#123F34]"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/orders"
                  className="rounded-full border border-[#0D3B2E] px-8 py-3 font-semibold text-[#0D3B2E] transition hover:bg-[#F8F4EC]"
                >
                  View Order History
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F4EC] text-3xl text-[#5b5b5b]">
                ?
              </div>

              <h1 className="mt-6 font-serif text-3xl text-[#0D3B2E]">
                No Payment Session Found
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-[#5b5b5b]">
                We could not identify an active checkout session. If you have
                already placed an order, please review your order history.
              </p>

              <div className="mt-8 flex justify-center gap-4">
                <Link
                  to="/shop"
                  className="rounded-full bg-[#0D3B2E] px-8 py-3 font-semibold text-white transition hover:bg-[#123F34]"
                >
                  Return to Boutique
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};
