import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gift, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { TrustStrip } from '../components/ui/TrustStrip';
import { SectionTitle } from '../components/ui/SectionTitle';
import { getBestSellers, getProducts } from '../services/products';
import perfume1 from '../assets/perfumes/perfume1.jpeg';
import perfume3 from '../assets/perfumes/perfume3.jpeg';
import perfume5 from '../assets/perfumes/perfume5.jpeg';
import perfume7 from '../assets/perfumes/perfume7.jpeg';
import heroImage from '../assets/perfumes/perfume9.jpeg';

const categories = [
  { title: 'The Oud Edit', copy: 'Deep, resinous and unforgettable.', image: perfume3, target: '/unisex' },
  { title: 'For Him', copy: 'Confident woods and quiet spice.', image: perfume7, target: '/men' },
  { title: 'For Her', copy: 'Soft florals with a golden trail.', image: perfume5, target: '/women' },
  { title: 'Gifts of Distinction', copy: 'Made for lasting impressions.', image: perfume1, target: '/gift-studio' }
];

export const HomePage = () => {
  const bestsellerProducts = getBestSellers().slice(0, 4);
  const featuredProduct = getProducts()[0];

  return (
    <Layout>
      <section className="relative isolate overflow-hidden bg-[#102b23] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_38%,rgba(196,157,86,.25),transparent_23%),radial-gradient(circle_at_15%_90%,rgba(108,67,26,.3),transparent_31%)]" />
        <div className="absolute left-[49%] top-0 hidden h-full w-px bg-[#d8b87a]/25 lg:block" />
        <div className="relative mx-auto grid min-h-[670px] max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="relative z-10 max-w-xl lg:pb-4">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.42em] text-[#e0be7f]"><span className="h-px w-10 bg-[#e0be7f]" /> Fine fragrances · Abu Dhabi</div>
            <h1 className="mt-7 font-serif text-5xl leading-[.88] tracking-[-.045em] sm:text-6xl lg:text-8xl">Leave a<br /><em className="font-normal text-[#dfbd7f]">lasting trace.</em></h1>
            <p className="mt-8 max-w-md text-base leading-7 text-[#dfded5] sm:text-lg">{businessConfig.heroDescription} Composed around rare ingredients and the unmistakable warmth of oud.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-3 bg-[#e0be7f] px-6 py-3.5 text-sm font-semibold text-[#17332a] transition hover:bg-[#f2d69e]">Shop the collection <ArrowUpRight size={16} /></Link>
              <Link to="/about" className="inline-flex items-center gap-3 border border-white/30 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10">Our story <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-12 flex gap-7 border-t border-white/15 pt-6 text-xs text-[#d9d4c9]">
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#e0be7f]" /> Authentic creations</span>
              <span className="flex items-center gap-2"><Truck size={16} className="text-[#e0be7f]" /> UAE delivery</span>
            </div>
          </div>
          <div className="relative h-[460px] sm:h-[540px] lg:h-[610px]">
            <div className="absolute right-0 top-0 h-[86%] w-[86%] border border-[#d8b87a]/40" />
            <img src={heroImage} alt="Oud Kraft signature fragrance" className="absolute bottom-0 right-5 h-[94%] w-[82%] object-cover grayscale-[8%] sm:right-8" />
            <div className="absolute bottom-7 left-0 max-w-[220px] border border-white/15 bg-[#19382e]/90 p-5 backdrop-blur-sm sm:left-4">
              <p className="text-[10px] uppercase tracking-[.3em] text-[#dfbd7f]">The signature</p>
              <p className="mt-2 font-serif text-2xl leading-tight">Oud Kraft Mari</p>
              <Link to={`/product/${featuredProduct.slug}`} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#e0be7f]">Discover the scent <ArrowRight size={14} /></Link>
            </div>
            <p className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-[38%] rotate-90 text-[10px] uppercase tracking-[.45em] text-[#d8b87a] xl:block">Est. in Abu Dhabi · 2026</p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dfd5c1] bg-[#f7f3eb]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.27em] text-[#a97d3d]">01 · Crafted character</p><p className="mt-2 font-serif text-lg text-[#16382d]">Fragrance that stays with you</p></div>
          <div className="border-[#dfd5c1] sm:border-x"><p className="text-[10px] font-semibold uppercase tracking-[.27em] text-[#a97d3d]">02 · Thoughtful gifting</p><p className="mt-2 font-serif text-lg text-[#16382d]">Details made personal</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[.27em] text-[#a97d3d]">03 · Delivered locally</p><p className="mt-2 font-serif text-lg text-[#16382d]">Across the UAE</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Find your ritual" title="A fragrance for every kind of presence" description="Move through our world of scent — expressive, intimate and unmistakably yours." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.title} to={category.target} className="group relative min-h-[355px] overflow-hidden bg-[#17362c]">
              <img src={category.image} alt={category.title} className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2119] via-[#0b2119]/15 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white"><p className="text-[10px] uppercase tracking-[.25em] text-[#e0be7f]">Explore</p><h3 className="mt-2 font-serif text-3xl leading-none">{category.title}</h3><p className="mt-3 text-sm text-white/75">{category.copy}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#e0be7f]">View collection <ArrowRight size={14} /></span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#eae2d3] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-5"><SectionTitle eyebrow="The house favourites" title="Most wanted" description="The fragrances our community returns to, again and again." /><Link to="/best-sellers" className="inline-flex items-center gap-2 border-b border-[#16382d] pb-1 text-sm font-semibold text-[#16382d]">View all scents <ArrowRight size={15} /></Link></div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{bestsellerProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><TrustStrip /></section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden bg-[#15362b] text-white lg:grid-cols-2">
          <div className="p-9 sm:p-14"><div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.36em] text-[#e0be7f]"><Sparkles size={15} /> The art of giving</div><h2 className="mt-6 max-w-md font-serif text-4xl leading-[.96] sm:text-5xl">Some memories deserve their own scent.</h2><p className="mt-6 max-w-md leading-7 text-[#d5d9d4]">Select a signature fragrance, add a handwritten note and let our Gift Studio take care of the finishing touches.</p><Link to="/gift-studio" className="mt-9 inline-flex items-center gap-3 bg-[#e0be7f] px-6 py-3.5 text-sm font-semibold text-[#17332a]"><Gift size={16} /> Enter Gift Studio</Link></div>
          <div className="relative min-h-[330px]"><img src={perfume1} alt="Oud Kraft gift fragrance" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-[#142e25]/20" /></div>
        </div>
      </section>
    </Layout>
  );
};
