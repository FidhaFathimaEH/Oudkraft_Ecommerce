import { Layout } from '../components/Layout';

const policies = [
  { title: 'Privacy Policy', body: 'This starter page can be updated before launch with the brand’s approved policy text and any UAE-specific data handling details.' },
  { title: 'Terms & Conditions', body: 'These are placeholder terms that should be reviewed by the business before publishing.' },
  { title: 'Shipping Policy', body: 'Shipping details should be reviewed and updated with real service thresholds and delivery timing.' },
  { title: 'Return Policy', body: 'Return and refund rules should be confirmed before launch and adjusted for your business practices.' }
];

export const PolicyPage = ({ title }) => (
  <Layout>
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">Policy</p>
        <h1 className="mt-3 font-serif text-3xl text-[#0D3B2E]">{title}</h1>
        <div className="mt-8 space-y-6 text-[#5b5b5b] leading-7">
          {policies.filter((policy) => policy.title === title).map((policy) => <p key={policy.title}>{policy.body}</p>)}
        </div>
      </div>
    </section>
  </Layout>
);
