import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  ArrowRight,
} from 'lucide-react';
import { businessConfig } from '../config/businessConfig';
import { getCart } from '../services/cart';
import { getWishlist } from '../services/wishlist';
import { getProducts } from '../services/products';
import oudKraftLogo from '../assets/logo/oud-kraft-logo.png';

const navigationLinks = [
  {
    id: 'shop',
    label: 'Shop',
    items: [
      {
        label: 'All Perfumes',
        to: '/shop',
        description: 'Explore the complete fragrance library',
      },
      {
        label: 'Men',
        to: '/men',
        description: 'Warm woods, crisp spices & confident accords',
      },
      {
        label: 'Women',
        to: '/women',
        description: 'Luminous florals, golden ambers & soft musks',
      },
      {
        label: 'Unisex',
        to: '/unisex',
        description: 'Genderless compositions of rare distinction',
      },
      {
        label: 'Best Sellers',
        to: '/best-sellers',
        description: 'Our most cherished and recognized scents',
      },
      {
        label: 'New Arrivals',
        to: '/shop',
        description: 'Recent seasonal creations & private releases',
      },
    ],
  },
  {
    id: 'collections',
    label: 'Collections',
    items: [
      {
        label: 'Signature Collection',
        to: '/shop',
        description: 'The definitive creations defining our house',
      },
      {
        label: 'Luxury Collection',
        to: '/shop',
        description: 'High-concentration extraits & pure distillations',
      },
      {
        label: 'Oud Collection',
        to: '/shop',
        description: 'A tribute to Cambodi, Hindi and rare agarwood',
      },
      {
        label: 'Everyday Collection',
        to: '/shop',
        description: 'Understated scents for elevated daily rituals',
      },
    ],
  },
  {
    id: 'gifting',
    label: 'Gifting',
    items: [
      {
        label: 'Gift Studio',
        to: '/gift-studio',
        description: 'Personalized flacons, custom ribbons & wax seals',
      },
      {
        label: 'Gift Cards',
        to: '/gift-studio',
        description: 'Give the freedom to discover their own signature',
      },
      {
        label: 'Corporate Gifting',
        to: '/contact',
        description: 'Bespoke corporate hampers & celebratory curation',
      },
    ],
  },
  {
    id: 'about',
    label: 'About',
    items: [
      {
        label: 'Our Story',
        to: '/about',
        description: 'Our Abu Dhabi origins, philosophy & craftsmanship',
      },
      {
        label: 'Contact',
        to: '/contact',
        description: 'Private concierge support & scent consultations',
      },
    ],
  },
];

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [wishlistCount, setWishlistCount] = useState(getWishlist().length);
  const [cartCount, setCartCount] = useState(() =>
    getCart().reduce((sum, item) => sum + item.quantity, 0)
  );

  const [products, setProducts] = useState([]);
  const searchInputRef = useRef(null);
  const headerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Load products for live search
  useEffect(() => {
    try {
      const allProducts = getProducts();
      setProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch {
      setProducts([]);
    }
  }, []);

  // Sync wishlist & cart counts
  useEffect(() => {
    setWishlistCount(getWishlist().length);
  }, [location.pathname]);

  useEffect(() => {
    const updateWishlist = () => setWishlistCount(getWishlist().length);
    const updateCart = () => {
      const cart = getCart();
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    window.addEventListener('wishlist-changed', updateWishlist);
    window.addEventListener('cart-changed', updateCart);

    return () => {
      window.removeEventListener('wishlist-changed', updateWishlist);
      window.removeEventListener('cart-changed', updateCart);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  // Close menus on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dropdown hover handlers with graceful delay
  const handleMouseEnter = useCallback((navId) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(navId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  }, []);

  const handleNavClick = useCallback((navId) => {
    setActiveDropdown((prev) => (prev === navId ? null : navId));
  }, []);

  // Search filter
  const searchResults = searchQuery.trim()
    ? products
        .filter((product) => {
          const name = product.name || '';
          const category = product.category || '';
          const family = product.fragranceFamily || '';
          const topNotes = Array.isArray(product.topNotes)
            ? product.topNotes.join(' ')
            : '';
          const middleNotes = Array.isArray(product.middleNotes)
            ? product.middleNotes.join(' ')
            : '';
          const text = `${name} ${category} ${family} ${topNotes} ${middleNotes}`.toLowerCase();
          return text.includes(searchQuery.toLowerCase());
        })
        .slice(0, 5)
    : [];

  const handleProductSelect = (slug) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleProductSelect(searchResults[0].slug);
      } else {
        navigate('/shop');
        setSearchOpen(false);
      }
    }
  };

  const toggleMobileAccordion = (id) => {
    setMobileAccordion((prev) => (prev === id ? null : id));
  };

  const getDropdownAlignment = (id) => {
    if (id === 'shop') return 'left-0';
    if (id === 'about') return 'right-0';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-[#e8ded0]/80 bg-[#f8f3ea]/95 backdrop-blur-md transition-shadow"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: Logo & Brand Link */}
        <div className="flex items-center">
          <Link
            to="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="Oud Kraft Homepage"
          >
            <img
              src={oudKraftLogo}
              alt="Oud Kraft"
              className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-semibold tracking-[0.14em] text-[#0D3B2E] transition-colors group-hover:text-[#C6A15B]">
                {businessConfig.brandName}
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.32em] text-[#787165]">
                ABU DHABI
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Desktop) */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main Navigation"
        >
          {navigationLinks.map((nav) => {
            const isOpen = activeDropdown === nav.id;
            return (
              <div
                key={nav.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(nav.id)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleNavClick(nav.id)}
                  aria-expanded={isOpen}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium uppercase tracking-[0.16em] transition-colors ${
                    isOpen
                      ? 'text-[#0D3B2E]'
                      : 'text-[#4A453E] hover:text-[#0D3B2E]'
                  }`}
                >
                  <span>{nav.label}</span>
                  <ChevronDown
                    size={13}
                    className={`text-[#A09382] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#C6A15B]' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className={`absolute top-full z-50 pt-2 ${getDropdownAlignment(nav.id)}`}
                    >
                      <div
                        className="w-80 overflow-hidden rounded-2xl border border-[#ded0b9] bg-[#FAF6EE] p-2 shadow-[0_20px_50px_-12px_rgba(13,59,46,0.28)]"
                        style={{ minWidth: nav.items.length > 4 ? '340px' : '300px' }}
                      >
                        <div className="px-3.5 pb-2 pt-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                            {nav.label}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          {nav.items.map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => setActiveDropdown(null)}
                              className="group flex flex-col rounded-xl px-3.5 py-2.5 transition-colors duration-150 hover:bg-[#EFE7D8]"
                            >
                              <span className="flex items-center justify-between text-sm font-medium text-[#1E1B18] transition-colors group-hover:text-[#0D3B2E]">
                                <span>{item.label}</span>
                                <ArrowRight
                                  size={13}
                                  className="text-[#C6A15B] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                />
                              </span>
                              {item.description && (
                                <span className="mt-0.5 text-xs text-[#6B6356] transition-colors group-hover:text-[#4A4338]">
                                  {item.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* RIGHT: Search, Account, Wishlist, Cart, Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search Fragrances"
            className={`flex h-10 w-10 items-center justify-center rounded-full text-[#0D3B2E] transition-colors hover:bg-[#ede3d2]/70 ${
              searchOpen ? 'bg-[#ede3d2] text-[#C6A15B]' : ''
            }`}
          >
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>

          {/* Account */}
          <Link
            to="/account"
            aria-label="My Account"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0D3B2E] transition-colors hover:bg-[#ede3d2]/70"
          >
            <UserRound size={19} />
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label={`Wishlist with ${wishlistCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#0D3B2E] transition-colors hover:bg-[#ede3d2]/70"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C6A15B] px-1 text-[10px] font-semibold text-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            aria-label={`Shopping cart with ${cartCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#0D3B2E] transition-colors hover:bg-[#ede3d2]/70"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0D3B2E] px-1 text-[10px] font-semibold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0D3B2E] transition-colors hover:bg-[#ede3d2]/70 lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* SEARCH BAR PANEL (DESKTOP & MOBILE) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#e5dac6] bg-[#FAF5EC]/98 backdrop-blur-md"
          >
            <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
              <div className="relative flex items-center">
                <Search
                  size={18}
                  className="absolute left-4 text-[#C6A15B]"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by perfume name, note, or category..."
                  className="w-full rounded-full border border-[#ded0b9] bg-white/90 py-3.5 pl-11 pr-12 text-sm text-[#1A1A1A] placeholder-[#8A8173] outline-none transition-all focus:border-[#C6A15B] focus:ring-1 focus:ring-[#C6A15B]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-[#8A8173] hover:text-[#1A1A1A]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Live Search Results */}
              {searchQuery.trim() && (
                <div className="mt-3 divide-y divide-[#ece2d0] rounded-2xl border border-[#ded0b9] bg-white p-2 shadow-lg">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <button
                        key={product._id || product.id || product.slug}
                        type="button"
                        onClick={() => handleProductSelect(product.slug)}
                        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-[#F9F4EB]"
                      >
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFE8DA] text-xs font-serif text-[#0D3B2E]">
                              Oud
                            </div>
                          )}
                          <div>
                            <p className="font-serif text-base font-medium text-[#0D3B2E]">
                              {product.name}
                            </p>
                            <p className="text-xs text-[#7A7265]">
                              {product.category || 'Fine Fragrance'}
                              {product.fragranceFamily ? ` • ${product.fragranceFamily}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {product.price && (
                            <span className="text-sm font-semibold text-[#1A1A1A]">
                              AED {product.price}
                            </span>
                          )}
                          <ChevronRight
                            size={16}
                            className="text-[#C6A15B]"
                          />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-[#7A7265]">
                      No fragrances found matching &quot;{searchQuery}&quot;. Try exploring our{' '}
                      <Link
                        to="/shop"
                        onClick={() => setSearchOpen(false)}
                        className="font-medium text-[#0D3B2E] underline"
                      >
                        full shop
                      </Link>
                      .
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />

            {/* Off-canvas Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-[#e4d8c2] bg-[#FAF5EB] shadow-2xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex h-20 items-center justify-between border-b border-[#e4d8c2] px-6">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src={oudKraftLogo}
                    alt="Oud Kraft"
                    className="h-8 w-8 object-contain"
                  />
                  <div>
                    <p className="font-serif text-lg font-semibold tracking-wider text-[#0D3B2E]">
                      {businessConfig.brandName}
                    </p>
                    <p className="text-[8px] uppercase tracking-[0.28em] text-[#787165]">
                      ABU DHABI
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#0D3B2E] hover:bg-[#ede3d2]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Accordions */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-3">
                  {navigationLinks.map((nav) => {
                    const isExpanded = mobileAccordion === nav.id;
                    return (
                      <div
                        key={nav.id}
                        className="overflow-hidden rounded-2xl border border-[#e4d8c2] bg-white/70 shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => toggleMobileAccordion(nav.id)}
                          className="flex w-full items-center justify-between p-4 text-left"
                        >
                          <span className="font-serif text-lg text-[#0D3B2E]">
                            {nav.label}
                          </span>
                          <ChevronDown
                            size={17}
                            className={`text-[#C6A15B] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-[#ede2ce] bg-[#FAF6EE] px-4 py-2"
                            >
                              <div className="space-y-1 py-1">
                                {nav.items.map((item) => (
                                  <NavLink
                                    key={item.label}
                                    to={item.to}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#3A352E] hover:bg-[#F0E8D9] hover:text-[#0D3B2E]"
                                  >
                                    <span>{item.label}</span>
                                    <ChevronRight
                                      size={14}
                                      className="text-[#C6A15B]"
                                    />
                                  </NavLink>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Shortcuts */}
                <div className="mt-8 border-t border-[#e4d8c2] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                    Account & Orders
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-[#e4d8c2] bg-white/70 p-3 text-xs font-medium text-[#0D3B2E] transition-colors hover:bg-white"
                    >
                      <UserRound size={15} className="text-[#C6A15B]" />
                      <span>My Account</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-[#e4d8c2] bg-white/70 p-3 text-xs font-medium text-[#0D3B2E] transition-colors hover:bg-white"
                    >
                      <Heart size={15} className="text-[#C6A15B]" />
                      <span>Wishlist ({wishlistCount})</span>
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-[#e4d8c2] bg-white/70 p-3 text-xs font-medium text-[#0D3B2E] transition-colors hover:bg-white"
                    >
                      <ShoppingBag size={15} className="text-[#C6A15B]" />
                      <span>Cart ({cartCount})</span>
                    </Link>
                    <Link
                      to="/track-order"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-[#e4d8c2] bg-white/70 p-3 text-xs font-medium text-[#0D3B2E] transition-colors hover:bg-white"
                    >
                      <ArrowRight size={15} className="text-[#C6A15B]" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-[#e4d8c2] bg-[#F2ECE0]/70 p-5 text-center">
                <p className="text-xs text-[#7A7265]">
                  Private Delivery across Abu Dhabi & UAE
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
