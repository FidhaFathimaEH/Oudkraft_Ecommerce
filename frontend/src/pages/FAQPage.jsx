import { Layout } from '../components/Layout';
import { SectionTitle } from '../components/ui/SectionTitle';

const faqs = [
  { question: 'How do I choose a fragrance?', answer: 'Start with the mood you want to express, then compare notes such as oud, floral, fresh or amber.' },
  { question: 'How long does perfume last?', answer: 'Most Oud Kraft fragrances are designed to last between 5 and 10 hours depending on the blend and skin chemistry.' },
  { question: 'Do you deliver across Abu Dhabi?', answer: 'Yes, local delivery across Abu Dhabi is available for eligible orders.' },
  { question: 'Do you deliver outside Abu Dhabi?', answer: 'We are building delivery support for additional emirates and can update this based on service availability.' },
  { question: 'Can I send perfume as a gift?', answer: 'Yes, the Gift Studio page is designed for wrapping, messaging and occasion-ready presentation.' },
  { question: 'How can I track my order?', answer: 'Order tracking is prepared as a UI service ready to connect to a real fulfillment system.' },
  { question: 'How can I contact Oud Kraft?', answer: 'Use WhatsApp, email or the contact page for quick support and fragrance guidance.' }
];

export const FAQPage = () => (
  <Layout>
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Help" title="Frequently asked questions" description="Helpful guidance for customers exploring fragrance, gifting and delivery." />
      <div className="mt-8 grid gap-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-[24px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
            <summary className="cursor-pointer font-semibold text-[#0D3B2E]">{faq.question}</summary>
            <p className="mt-3 text-[#5b5b5b] leading-7">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  </Layout>
);
