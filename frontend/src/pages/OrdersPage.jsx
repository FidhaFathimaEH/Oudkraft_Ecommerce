import { Layout } from '../components/Layout';

const orders = [
  { id: 'OK-102839', date: '24 Jul 2026', status: 'Processing', total: 'AED 248' },
  { id: 'OK-102840', date: '26 Jul 2026', status: 'Shipped', total: 'AED 325' }
];

export const OrdersPage = () => (
  <Layout>
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">Orders</p>
        <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">Your order history</h1>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex flex-col justify-between gap-3 rounded-[24px] border border-[#e3d9c4] bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <p className="font-semibold text-[#0D3B2E]">{order.id}</p>
              <p className="mt-1 text-sm text-[#5b5b5b]">Placed on {order.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-[#F8F4EC] px-3 py-2 text-sm text-[#0D3B2E]">{order.status}</span>
              <span className="text-lg font-semibold text-[#111111]">{order.total}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  </Layout>
);