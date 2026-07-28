import { useState } from 'react';
import { Layout } from '../components/Layout';

export const TrackOrderPage = () => {
  const [form, setForm] = useState({ orderNumber: '', contact: '' });

  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">Track order</p>
          <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">Track your order</h1>
          <p className="mt-4 text-[#5b5b5b]">Enter your order number and email or phone so an order-tracking experience can be connected to your fulfillment system later.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">Order number</label>
              <input value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0D3B2E]">Phone or email</label>
              <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3 outline-none" />
            </div>
          </div>
          <button type="button" className="mt-6 rounded-full bg-[#0D3B2E] px-6 py-3 font-semibold text-white">Check status</button>
        </div>
      </section>
    </Layout>
  );
};
