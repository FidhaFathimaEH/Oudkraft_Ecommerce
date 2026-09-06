import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';
import oudKraftLogo from '../assets/logo/oud-kraft-logo.png';
import { Header } from './Header';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-transparent text-[#171311]">
      <div className="bg-[#123F34] px-4 py-2 text-center text-sm text-[#f7ebda]">
        Complimentary gift wrap on orders above AED 250 • Private delivery across Abu Dhabi
      </div>
      <Header />
      <main>{children}</main>
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#e3d9c4] bg-[#f8f2e9] p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C6A15B]">Luxury concierge</p>
              <p className="mt-2 text-sm text-[#5b5b5b]">Ask us for perfume recommendations, gifting guidance or order updates via WhatsApp.</p>
            </div>
            <a href={`https://wa.me/${businessConfig.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#17362c] px-4 py-3 text-sm font-semibold text-white">
              Contact concierge <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
      <footer className="border-t border-[#e3d9c4] bg-[#0D3B2E] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <img src={oudKraftLogo} alt="Oud Kraft" className="h-16 w-16 object-contain" />
            <p className="mt-3 font-serif text-2xl">OUD KRAFT</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#ebdfcb]">ABU DHABI</p>
            <p className="mt-3 text-sm leading-7 text-[#ebdfcb]">Premium fragrances and gifting for modern connoisseurs across Abu Dhabi and the UAE.</p>
          </div>
          <div>
            <h3 className="font-semibold">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#ebdfcb]">
              <li><Link to="/men">Men</Link></li>
              <li><Link to="/women">Women</Link></li>
              <li><Link to="/unisex">Unisex</Link></li>
              <li><Link to="/best-sellers">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Help</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#ebdfcb]">
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping</Link></li>
              <li><Link to="/returns">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Follow us</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#ebdfcb]">
              <li><a href="https://instagram.com/oud_kraft" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href={`https://wa.me/${businessConfig.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-4 border-t border-white/15 pt-6 text-sm text-[#ebdfcb] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Oud Kraft Abu Dhabi. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/shipping">Shipping Policy</Link>
            <Link to="/returns">Return Policy</Link>
          </div>
        </div>
      </footer>
      <a href={`https://wa.me/${businessConfig.whatsapp}`} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg">
        <MessageCircle size={16} /> Order / Ask on WhatsApp
      </a>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};
