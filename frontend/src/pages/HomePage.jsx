import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Gift, ShieldCheck, Sparkles, Truck, Crown, Leaf, Clock3, BadgeCheck, Gem, Quote } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { TrustStrip } from '../components/ui/TrustStrip';
import { SectionTitle } from '../components/ui/SectionTitle';
import { ScentQuiz } from '../components/ScentQuiz';
import { getBestSellers, getFeaturedProducts, getProducts } from '../services/products';
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

const values = [
  { icon: Gem, title: 'Premium Ingredients', text: 'Rare woods, rose absolutes, and velvety resins layered into refined compositions.' },
  { icon: Clock3, title: 'Long Lasting Fragrance', text: 'Built to unfold beautifully through the day and linger long after the first impression.' },
  { icon: Crown, title: 'Inspired Luxury', text: 'A modern expression of heritage, designed for those who appreciate quiet confidence.' },
  { icon: Truck, title: 'Fast UAE Delivery', text: 'From our atelier to your doorstep, carefully packed and delivered with care.' }
];

const testimonials = [
  { quote: 'The scent feels intimate, elegant and unmistakably luxurious. It has become part of my signature.', name: 'Amira H.', role: 'Private Client' },
  { quote: 'Every detail feels considered — from the bottle to the longevity. Truly exceptional craftsmanship.', name: 'Daniel R.', role: 'Abu Dhabi Resident' },
  { quote: 'The gift packaging was stunning. It felt as special as the fragrance itself.', name: 'Noura S.', role: 'Corporate Gift Buyer' }
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

export const HomePage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const bestsellerProducts = getBestSellers().slice(0, 4);
  const featuredProducts = getFeaturedProducts().slice(0, 4);
  const featuredProduct = getProducts()[0] || { slug: 'shop' };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
    window.setTimeout(() => setSubmitted(false), 2200);
  };

  return (
    <Layout>
      <motion.section
        initial="hidden"
        animate="show"
        variants={reveal}
        className="relative isolate overflow-hidden bg-[#102b23] text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_38%,rgba(196,157,86,.25),transparent_23%),radial-gradient(circle_at_15%_90%,rgba(108,67,26,.3),transparent_31%)]" />
        <div className="absolute left-[49%] top-0 hidden h-full w-px bg-[#d8b87a]/25 lg:block" />
        <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-24">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative z-10 max-w-xl lg:pb-4">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.42em] text-[#e0be7f]"><span className="h-px w-10 bg-[#e0be7f]" /> Fine fragrances · Abu Dhabi</div>
            <h1 className="mt-7 font-serif text-5xl leading-[.88] tracking-[-.045em] sm:text-6xl lg:text-8xl">Leave a<br /><em className="font-normal text-[#dfbd7f]">lasting trace.</em></h1>
            <p className="mt-8 max-w-lg text-base leading-8 text-[#dfded5] sm:text-lg">{businessConfig.heroDescription} Composed around rare ingredients and the unmistakable warmth of oud.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/shop" className="inline-flex items-center gap-3 bg-[#e0be7f] px-6 py-3.5 text-sm font-semibold text-[#17332a] shadow-[0_20px_45px_-25px_rgba(224,190,127,0.9)] transition hover:bg-[#f2d69e]">Shop the collection <ArrowUpRight size={16} /></Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/about" className="inline-flex items-center gap-3 border border-white/30 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10">Our story <ArrowRight size={16} /></Link>
              </motion.div>
            </div>
            <div className="mt-12 flex flex-wrap gap-7 border-t border-white/15 pt-6 text-xs text-[#d9d4c9]">
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#e0be7f]" /> Authentic creations</span>
              <span className="flex items-center gap-2"><Truck size={16} className="text-[#e0be7f]" /> UAE delivery</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative h-[470px] sm:h-[540px] lg:h-[640px]">
            <div className="absolute right-0 top-0 h-[86%] w-[86%] border border-[#d8b87a]/40" />
            <motion.img
              whileHover={{ scale: 1.03, rotate: -0.5 }}
              transition={{ duration: 0.45 }}
              src={heroImage}
              alt="Oud Kraft signature fragrance"
              className="absolute bottom-0 right-5 h-[94%] w-[82%] object-cover grayscale-[8%] shadow-[0_35px_70px_-30px_rgba(0,0,0,0.85)] sm:right-8"
            />
            <div className="absolute bottom-7 left-0 max-w-[240px] border border-white/15 bg-[#19382e]/90 p-5 backdrop-blur-sm sm:left-4">
              <p className="text-[10px] uppercase tracking-[.3em] text-[#dfbd7f]">The signature</p>
              <p className="mt-2 font-serif text-2xl leading-tight">Oud Kraft Mari</p>
              <Link to={`/product/${featuredProduct.slug}`} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#e0be7f]">Discover the scent <ArrowRight size={14} /></Link>
            </div>
            <p className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-[38%] rotate-90 text-[10px] uppercase tracking-[.45em] text-[#d8b87a] xl:block">Est. in Abu Dhabi · 2026</p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="border-b border-[#dfd5c1] bg-[#f7f3eb]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.27em] text-[#a97d3d]">01 · Crafted character</p><p className="mt-2 font-serif text-lg text-[#16382d]">Fragrance that stays with you</p></div>
          <div className="border-[#dfd5c1] sm:border-x"><p className="text-[10px] font-semibold uppercase tracking-[.27em] text-[#a97d3d]">02 · Thoughtful gifting</p><p className="mt-2 font-serif text-lg text-[#16382d]">Details made personal</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[.27em] text-[#a97d3d]">03 · Delivered locally</p><p className="mt-2 font-serif text-lg text-[#16382d]">Across the UAE</p></div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Find your ritual" title="A fragrance for every kind of presence" description="Move through our world of scent — expressive, intimate and unmistakably yours." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div key={category.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.08 }} whileHover={{ y: -8, scale: 1.01 }}>
              <Link to={category.target} className="group relative flex min-h-[360px] overflow-hidden rounded-[28px] bg-[#17362c]">
                <img src={category.image} alt={category.title} className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-65" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2119] via-[#0b2119]/15 to-transparent" />
                <div className="absolute bottom-0 p-6 text-white"><p className="text-[10px] uppercase tracking-[.25em] text-[#e0be7f]">Explore</p><h3 className="mt-2 font-serif text-3xl leading-none">{category.title}</h3><p className="mt-3 text-sm text-white/75">{category.copy}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#e0be7f]">View collection <ArrowRight size={14} /></span></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={reveal} className="bg-[#eae2d3] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Featured collections" title="Curated for modern luxury" description="A selection of refined scents designed for collectors, contemporary gifting and everyday rituals." />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {featuredProducts.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.08 }} className="overflow-hidden rounded-[30px] border border-[#e0d2bb] bg-white shadow-[0_20px_60px_-30px_rgba(13,59,46,0.25)]">
                <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
                  <img src={product.images[0]} alt={product.name} className="h-52 w-full object-cover md:h-full" />
                  <div className="p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]">{product.category}</p>
                    <h3 className="mt-3 font-serif text-2xl text-[#17362c]">{product.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5b5b5b]">{product.description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-lg font-semibold text-[#111111]">AED {product.price}</p>
                      <Link to={`/product/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#17362c]">Explore <ArrowRight size={15} /></Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={reveal} className="bg-[#eae2d3] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionTitle eyebrow="The house favourites" title="Most wanted" description="The fragrances our community returns to, again and again." />
            <Link to="/best-sellers" className="inline-flex items-center gap-2 border-b border-[#16382d] pb-1 text-sm font-semibold text-[#16382d]">View all scents <ArrowRight size={15} /></Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {bestsellerProducts.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.08 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={reveal} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <TrustStrip />
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[36px] bg-[#15362b] text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-9 sm:p-14">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.36em] text-[#e0be7f]"><Sparkles size={15} /> The art of giving</div>
            <h2 className="mt-6 max-w-md font-serif text-4xl leading-[.96] sm:text-5xl">Some memories deserve their own scent.</h2>
            <p className="mt-6 max-w-md leading-7 text-[#d5d9d4]">Select a signature fragrance, add a handwritten note and let our Gift Studio take care of the finishing touches.</p>
            <Link to="/gift-studio" className="mt-9 inline-flex items-center gap-3 bg-[#e0be7f] px-6 py-3.5 text-sm font-semibold text-[#17332a] transition hover:bg-[#f2d69e]"><Gift size={16} /> Enter Gift Studio</Link>
          </div>
          <div className="relative min-h-[330px]">
            <motion.img whileHover={{ scale: 1.03 }} transition={{ duration: 0.4 }} src={perfume1} alt="Oud Kraft gift fragrance" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#142e25]/20" />
          </div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-[#e5d8c3] bg-[#f9f4eb] p-8 sm:p-12">
          <SectionTitle eyebrow="Why Oud Kraft" title="The luxury of fragrance, distilled" description="Every composition is designed to feel rare, elegant and unmistakably personal." />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.08 }} whileHover={{ y: -6, scale: 1.01 }} className="rounded-[24px] border border-[#e4d8c3] bg-white/70 p-6 shadow-[0_20px_50px_-35px_rgba(13,59,46,0.35)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#17362c] text-[#e0be7f]"><Icon size={20} /></div>
                  <h3 className="mt-5 font-serif text-2xl text-[#17362c]">{value.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5e5e5e]">{value.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-[#102b23] px-8 py-12 text-white sm:px-12 lg:px-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionTitle eyebrow="Client notes" title="A scent that lingers in memory" description="We’re proud to be part of the rituals of those who appreciate fragrance with presence." />
            <div className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#e0be7f]">Trusted by fragrance lovers across the UAE</div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.08 }} className="rounded-[24px] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e0be7f]/20 text-[#e0be7f]"><Quote size={18} /></div>
                <p className="mt-5 text-sm leading-7 text-[#e9e2d5]">“{testimonial.quote}”</p>
                <div className="mt-6">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-[#d4cdbd]">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <ScentQuiz />
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={reveal} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[36px] border border-[#e0d1b3] bg-[linear-gradient(135deg,#f9f3eb_0%,#efe0c4_100%)] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a662]/40 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[.3em] text-[#8b6124]">
                <BadgeCheck size={14} /> Luxury updates
              </div>
              <h2 className="mt-5 font-serif text-4xl text-[#17362c] sm:text-5xl">Receive first access to new releases and private editions.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5c5c5c]">Join the Oud Kraft circle for curated releases, gift inspirations and exclusive offers.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="rounded-[28px] border border-[#e0d1b3] bg-white/80 p-5 shadow-[0_20px_50px_-30px_rgba(13,59,46,0.35)]">
              <label htmlFor="newsletter-email" className="text-sm font-semibold uppercase tracking-[.25em] text-[#8b6124]">Stay in the loop</label>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-full border border-[#d8c9ab] bg-[#fdf8f1] px-4 py-3 text-sm text-[#17362c] outline-none ring-0" />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="rounded-full bg-[#17362c] px-5 py-3 text-sm font-semibold text-white">Join now</motion.button>
              </div>
              <p className="mt-3 min-h-6 text-sm text-[#4f4f4f]">{submitted ? 'Thank you — you are on the list.' : 'No spam, only beautiful fragrance news.'}</p>
            </form>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
};
