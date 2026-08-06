import PropTypes from 'prop-types';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Menu, Search, Heart, ShoppingBag, UserRound, ChevronRight, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { businessConfig } from '../config/businessConfig';
import { getCart } from '../services/cart';
import { getWishlist } from '../services/wishlist';
import { getProducts } from '../services/products';
import oudKraftLogo from '../assets/logo/oud-kraft-logo.png';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/men', label: 'Men' },
  { to: '/women', label: 'Women' },
  { to: '/unisex', label: 'Unisex' },
  { to: '/best-sellers', label: 'Best Sellers' },
  { to: '/gift-studio', label: 'Gift Studio' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(getWishlist().length);
  const cartCount = useMemo(() => getCart().reduce((sum, item) => sum + item.quantity, 0), [location.pathname]);
  const products = getProducts();

  useEffect(() => {
    setWishlistCount(getWishlist().length);
  }, [location.pathname]);

  useEffect(() => {
    const updateWishlistCount = () => setWishlistCount(getWishlist().length);
    window.addEventListener('wishlist-changed', updateWishlistCount);
    return () => window.removeEventListener('wishlist-changed', updateWishlistCount);
  }, []);
  const searchResults = query.trim()
    ? products.filter((product) => `${product.name} ${product.category} ${product.fragranceFamily} ${product.topNotes.join(' ')} ${product.middleNotes.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-transparent text-[#171311]">
      <div className="bg-[#123F34] px-4 py-2 text-center text-sm text-[#f7ebda]">
        Complimentary gift wrap on orders above AED 250 • Private delivery across Abu Dhabi
      </div>
      <header className="sticky top-0 z-40 border-b border-[#e9dcc1] bg-[#f8f3ea]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={oudKraftLogo} alt="Oud Kraft" className="h-11 w-11 object-contain" />
            <div>
              <p className="font-serif text-xl text-[#0D3B2E]">{businessConfig.brandName}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-[#6b6b6b]">ABU DHABI</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-[#0D3B2E]' : 'text-[#4d4d4d] hover:text-[#0D3B2E]'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center rounded-full border border-[#e0d4c0] bg-white px-3 py-2 text-sm text-[#5b5b5b] shadow-sm md:flex">
              <Search size={16} className="mr-2 text-[#C6A15B]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fragrances" className="w-36 bg-transparent outline-none" />
            </div>
            <Link to="/contact" className="hidden items-center gap-2 rounded-full border border-[#e0d4c0] bg-white px-3 py-2 text-sm font-medium text-[#0D3B2E] shadow-sm md:inline-flex">
              <Sparkles size={16} className="text-[#C6A15B]" /> Concierge
            </Link>
            <Link to="/account" className="rounded-full border border-[#e0d4c0] bg-white p-2.5 text-[#0D3B2E] shadow-sm"><UserRound size={16} /></Link>
            <Link to="/wishlist" className="relative rounded-full border border-[#e0d4c0] bg-white p-2.5 text-[#0D3B2E] shadow-sm"><Heart size={16} />{wishlistCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C6A15B] text-[10px] text-white">{wishlistCount}</span> : null}</Link>
            <Link to="/cart" className="relative rounded-full border border-[#e0d4c0] bg-white p-2.5 text-[#0D3B2E] shadow-sm"><ShoppingBag size={16} />{cartCount > 0 ? <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D3B2E] text-[10px] text-white">{cartCount}</span> : null}</Link>
            <button className="rounded-full border border-[#e0d4c0] bg-white p-2.5 text-[#0D3B2E] shadow-sm lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation"><Menu size={16} /></button>
          </div>
        </div>
        {query.trim() && searchResults.length > 0 ? (
          <div className="border-t border-[#e3d9c4] bg-white/95 px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {searchResults.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/product/${product.slug}`} className="flex items-center justify-between rounded-xl border border-[#efe4cd] px-3 py-2 text-sm text-[#3f3f3f] hover:bg-[#F8F4EC]" onClick={() => setQuery('')}>
                  <span>{product.name}</span>
                  <ChevronRight size={16} className="text-[#C6A15B]" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        {mobileOpen ? (
          <div className="border-t border-[#e3d9c4] bg-white px-4 py-4 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-[#0D3B2E] text-white' : 'bg-[#F8F4EC] text-[#0D3B2E]'}`} onClick={() => setMobileOpen(false)}>{item.label}</NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>
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
