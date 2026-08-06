import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';

export const NotFound = () => (
  <Layout>
    <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-[#C6A15B]">404</p>
      <h1 className="mt-4 font-serif text-4xl text-[#0D3B2E]">The page you are looking for is not available.</h1>
      <p className="mt-4 text-[#5b5b5b]">Explore the collection or return to the home page.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/" className="rounded-full bg-[#0D3B2E] px-6 py-3 text-white">Go home</Link>
        <Link to="/shop" className="rounded-full border border-[#e3d9c4] px-6 py-3 text-[#0D3B2E]">Visit shop</Link>
      </div>
    </section>
  </Layout>
);
