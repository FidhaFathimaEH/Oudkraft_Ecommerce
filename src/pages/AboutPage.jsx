import { Layout } from '../components/Layout';
import { SectionTitle } from '../components/ui/SectionTitle';
import { businessConfig } from '../config/businessConfig';

export const AboutPage = () => (
  <Layout>
    <section className="w-full bg-[#123F34] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Our story" title="About Oud Kraft Abu Dhabi" description="We curate perfume experiences that balance heritage, elegance and modern self-expression for fragrance lovers throughout the capital." />
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0D3B2E]">A modern perfume house</h2>
          <p className="mt-4 text-[#5b5b5b] leading-7">We bring together premium fragrance inspiration with a thoughtful, easy-to-shop experience for customers across Abu Dhabi and the wider UAE.</p>
        </div>
        <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0D3B2E]">Refined compositions</h2>
          <p className="mt-4 text-[#5b5b5b] leading-7">Our scents are designed around warmth, depth and elegance, with compositions suited to gifting, daily wear and celebration.</p>
        </div>
        <div className="rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0D3B2E]">A personal experience</h2>
          <p className="mt-4 text-[#5b5b5b] leading-7">We believe exceptional fragrance should feel welcoming, premium and easy to discover through thoughtful design and concierge support.</p>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-[#e3d9c4] bg-[#F8F4EC] p-8 text-center">
        <h2 className="font-serif text-3xl text-[#0D3B2E]">Made for modern fragrance lovers in Abu Dhabi</h2>
        <p className="mt-3 text-[#5b5b5b]">{businessConfig.location}</p>
      </div>
    </section>
  </Layout>
);