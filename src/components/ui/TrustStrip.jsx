const items = [
  { title: 'Secure Checkout', detail: 'Protected payments and privacy-first ordering for every purchase.' },
  { title: 'Abu Dhabi Delivery', detail: 'Fast local delivery options and elegant handoff for the capital.' },
  { title: 'Concierge Support', detail: 'Helpful guidance for gifting, fragrance advice and private requests.' },
  { title: 'Gift Ready', detail: 'Signature packaging and personalization options for special occasions.' }
];

export const TrustStrip = () => (
  <section className="grid gap-4 rounded-3xl border border-[#d8c8a5] bg-[#F8F4EC] p-6 shadow-sm md:grid-cols-4">
    {items.map((item) => (
      <div key={item.title} className="rounded-2xl border border-[#e8dfcf] bg-white/70 p-4 text-center">
        <h3 className="font-semibold text-[#0D3B2E]">{item.title}</h3>
        <p className="mt-2 text-sm text-[#5b5b5b]">{item.detail}</p>
      </div>
    ))}
  </section>
);
