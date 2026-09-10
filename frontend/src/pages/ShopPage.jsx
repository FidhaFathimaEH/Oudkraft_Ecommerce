import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { SectionTitle } from '../components/ui/SectionTitle';
import { getProducts as getProductsFromAPI } from '../services/api';
import { getCart, saveCart, updateCartItem } from '../services/cart';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const genders = ['All', 'Men', 'Women', 'Unisex'];

const categories = [
  'All',
  'Attars',
  'Eau de Parfum',
  'Luxury Collection',
  'Gift Sets',
  'Bakhoor',
  'Travel Collection',
];

const fragranceFamilies = [
  'All',
  'Oud',
  'Woody',
  'Floral',
  'Fresh',
  'Amber',
  'Musk',
  'Citrus',
];

const brands = ['All', 'Oud Kraft'];

const sizes = [
  'All',
  '100 ml',
  '12 ml',
  '10 ml',
  '40 g',
  'Gift Set',
  'Travel Trio',
  'Travel Duo',
];

const ratings = ['All', '5', '4', '3'];

export const ShopPage = () => {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('All');
  const [category, setCategory] = useState('All');
  const [family, setFamily] = useState('All');
  const [price, setPrice] = useState('All');
  const [brand, setBrand] = useState('All');
  const [size, setSize] = useState('All');
  const [rating, setRating] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const [routeGender, setRouteGender] = useState('All');
  const [routeBestSellers, setRouteBestSellers] = useState(false);

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getProductsFromAPI({
          limit: 100,
        });

        setProducts(response.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load fragrances. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (location.pathname === '/men') {
      setRouteGender('Men');
      setRouteBestSellers(false);
    } else if (location.pathname === '/women') {
      setRouteGender('Women');
      setRouteBestSellers(false);
    } else if (location.pathname === '/unisex') {
      setRouteGender('Unisex');
      setRouteBestSellers(false);
    } else if (location.pathname === '/best-sellers') {
      setRouteGender('All');
      setRouteBestSellers(true);
      setSortBy('best');
    } else {
      setRouteGender('All');
      setRouteBestSellers(false);
    }
  }, [location.pathname]);

  const filteredProducts = useMemo(() => {
    const effectiveGender =
      gender === 'All' ? routeGender : gender;

    let result = products.filter((product) => {
      const topNotes = Array.isArray(product.topNotes)
        ? product.topNotes.join(' ')
        : '';

      const heartNotes = Array.isArray(product.heartNotes)
        ? product.heartNotes.join(' ')
        : '';

      const baseNotes = Array.isArray(product.baseNotes)
        ? product.baseNotes.join(' ')
        : '';

      const searchable = `
        ${product.name || ''}
        ${product.category || ''}
        ${product.fragranceFamily || ''}
        ${topNotes}
        ${heartNotes}
        ${baseNotes}
      `.toLowerCase();

      const matchesQuery = searchable.includes(
        query.toLowerCase()
      );

      const matchesGender =
        effectiveGender === 'All' ||
        product.gender === effectiveGender ||
        (effectiveGender === 'Men' &&
          product.gender === 'Unisex') ||
        (effectiveGender === 'Women' &&
          product.gender === 'Unisex');

      const matchesCategory =
        category === 'All' ||
        product.category === category;

      const matchesFamily =
        family === 'All' ||
        product.fragranceFamily === family;

      const matchesBrand =
        brand === 'All' ||
        product.brand === brand;

      const matchesSize =
        size === 'All' ||
        product.size === size;

      const matchesRating =
        rating === 'All' ||
        Number(product.rating) >= Number(rating);

      const matchesPrice =
        price === 'All' ||
        (price === 'under100' && product.price < 100) ||
        (price === '100to129' &&
          product.price >= 100 &&
          product.price <= 129) ||
        (price === 'over129' && product.price > 129);

      const matchesAvailability =
        availability === 'All' ||
        (availability === 'inStock' &&
          product.stock > 0) ||
        (availability === 'outOfStock' &&
          product.stock === 0);

      return (
        matchesQuery &&
        matchesGender &&
        matchesCategory &&
        matchesFamily &&
        matchesBrand &&
        matchesSize &&
        matchesRating &&
        matchesPrice &&
        matchesAvailability
      );
    });

    if (routeBestSellers) {
      result = result.filter(
        (product) =>
          product.bestseller || product.featured
      );
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortBy === 'price-desc') {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    if (sortBy === 'best') {
      result = [...result].sort(
        (a, b) =>
          Number(b.bestseller) -
          Number(a.bestseller)
      );
    }

    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => {
        const dateA = new Date(
          a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      });
    }

    if (sortBy === 'rating') {
      result = [...result].sort(
        (a, b) => b.rating - a.rating
      );
    }

    return result;
  }, [
    products,
    query,
    gender,
    category,
    family,
    brand,
    size,
    rating,
    price,
    availability,
    sortBy,
    routeGender,
    routeBestSellers,
  ]);

  const clearFilters = () => {
    setQuery('');
    setGender('All');
    setCategory('All');
    setFamily('All');
    setPrice('All');
    setBrand('All');
    setSize('All');
    setRating('All');
    setAvailability('All');
    setSortBy('featured');
  };

  const addQuickViewToCart = () => {
    if (!quickViewProduct) {
      return;
    }

    const cart = getCart();

    const nextCart = updateCartItem(
      cart,
      {
        ...quickViewProduct,
        size: quickViewProduct.size,
      },
      1
    );

    saveCart(nextCart);
  };

  return (
    <Layout>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full bg-[#123F34] py-16 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Curated collection"
            title="Shop Oud Kraft"
            description="Browse refined perfumes designed for gifting, daily luxury and memorable moments."
          />
        </div>
      </motion.section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:hidden">
          <div className="flex items-center gap-3 rounded-full border border-[#e3d9c4] bg-white px-4 py-3 shadow-sm">
            <Search
              size={16}
              className="text-[#C6A15B]"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search fragrances"
              className="w-full bg-transparent outline-none"
            />
          </div>

          <button
            onClick={() =>
              setMobileFiltersOpen(true)
            }
            className="flex items-center justify-center gap-2 rounded-full bg-[#0D3B2E] px-4 py-3 text-sm font-semibold text-white"
          >
            <SlidersHorizontal size={16} />
            Filter & sort
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="hidden space-y-6 rounded-[28px] border border-[#e3d9c4] bg-white p-6 shadow-sm lg:block">
            <div>
              <label className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Search
              </label>

              <div className="mt-3 flex items-center gap-3 rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-4 py-3">
                <Search
                  size={16}
                  className="text-[#C6A15B]"
                />

                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Name, notes or family"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Gender
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {genders.map((item) => (
                  <button
                    key={item}
                    onClick={() => setGender(item)}
                    className={`rounded-full px-3 py-2 text-sm ${
                      gender === item
                        ? 'bg-[#0D3B2E] text-white'
                        : 'bg-[#F8F4EC] text-[#0D3B2E]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Category
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setCategory(item)
                    }
                    className={`rounded-full px-3 py-2 text-sm ${
                      category === item
                        ? 'bg-[#0D3B2E] text-white'
                        : 'bg-[#F8F4EC] text-[#0D3B2E]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Fragrance family
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {fragranceFamilies.map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setFamily(item)
                    }
                    className={`rounded-full px-3 py-2 text-sm ${
                      family === item
                        ? 'bg-[#0D3B2E] text-white'
                        : 'bg-[#F8F4EC] text-[#0D3B2E]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Brand
              </h3>

              <select
                value={brand}
                onChange={(event) =>
                  setBrand(event.target.value)
                }
                className="mt-3 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
              >
                {brands.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Size
              </h3>

              <select
                value={size}
                onChange={(event) =>
                  setSize(event.target.value)
                }
                className="mt-3 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
              >
                {sizes.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Rating
              </h3>

              <select
                value={rating}
                onChange={(event) =>
                  setRating(event.target.value)
                }
                className="mt-3 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
              >
                {ratings.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === 'All'
                      ? 'All ratings'
                      : `${item}+ stars`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Price
              </h3>

              <select
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                className="mt-3 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
              >
                <option value="All">
                  All prices
                </option>

                <option value="under100">
                  Under AED 100
                </option>

                <option value="100to129">
                  AED 100 - 129
                </option>

                <option value="over129">
                  AED 130+
                </option>
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Availability
              </h3>

              <select
                value={availability}
                onChange={(event) =>
                  setAvailability(
                    event.target.value
                  )
                }
                className="mt-3 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
              >
                <option value="All">All</option>

                <option value="inStock">
                  In stock
                </option>

                <option value="outOfStock">
                  Out of stock
                </option>
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                Sort
              </h3>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="mt-3 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
              >
                <option value="featured">
                  Featured
                </option>

                <option value="best">
                  Best selling
                </option>

                <option value="price-asc">
                  Price: low to high
                </option>

                <option value="price-desc">
                  Price: high to low
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="rating">
                  Highest rating
                </option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="w-full rounded-full border border-[#e3d9c4] px-4 py-3 text-sm font-semibold text-[#0D3B2E] transition hover:bg-[#F8F4EC]"
            >
              Clear filters
            </button>
          </aside>

          {mobileFiltersOpen ? (
            <div className="fixed inset-0 z-50 bg-black/60 p-4 lg:hidden">
              <div className="max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0D3B2E]">
                    Filters
                  </h3>

                  <button
                    onClick={() =>
                      setMobileFiltersOpen(false)
                    }
                    className="rounded-full bg-[#F8F4EC] p-2"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Search
                    </label>

                    <input
                      value={query}
                      onChange={(event) =>
                        setQuery(event.target.value)
                      }
                      placeholder="Search fragrances"
                      className="mt-2 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Gender
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {genders.map((item) => (
                        <button
                          key={item}
                          onClick={() =>
                            setGender(item)
                          }
                          className={`rounded-full px-3 py-2 text-sm ${
                            gender === item
                              ? 'bg-[#0D3B2E] text-white'
                              : 'bg-[#F8F4EC] text-[#0D3B2E]'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Category
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {categories.map((item) => (
                        <button
                          key={item}
                          onClick={() =>
                            setCategory(item)
                          }
                          className={`rounded-full px-3 py-2 text-sm ${
                            category === item
                              ? 'bg-[#0D3B2E] text-white'
                              : 'bg-[#F8F4EC] text-[#0D3B2E]'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Fragrance family
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {fragranceFamilies.map(
                        (item) => (
                          <button
                            key={item}
                            onClick={() =>
                              setFamily(item)
                            }
                            className={`rounded-full px-3 py-2 text-sm ${
                              family === item
                                ? 'bg-[#0D3B2E] text-white'
                                : 'bg-[#F8F4EC] text-[#0D3B2E]'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Brand
                    </h3>

                    <select
                      value={brand}
                      onChange={(event) =>
                        setBrand(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
                    >
                      {brands.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Size
                    </h3>

                    <select
                      value={size}
                      onChange={(event) =>
                        setSize(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
                    >
                      {sizes.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Rating
                    </h3>

                    <select
                      value={rating}
                      onChange={(event) =>
                        setRating(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
                    >
                      {ratings.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item === 'All'
                            ? 'All ratings'
                            : `${item}+ stars`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Price
                    </h3>

                    <select
                      value={price}
                      onChange={(event) =>
                        setPrice(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
                    >
                      <option value="All">
                        All prices
                      </option>

                      <option value="under100">
                        Under AED 100
                      </option>

                      <option value="100to129">
                        AED 100 - 129
                      </option>

                      <option value="over129">
                        AED 130+
                      </option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Availability
                    </h3>

                    <select
                      value={availability}
                      onChange={(event) =>
                        setAvailability(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
                    >
                      <option value="All">
                        All
                      </option>

                      <option value="inStock">
                        In stock
                      </option>

                      <option value="outOfStock">
                        Out of stock
                      </option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#C6A15B]">
                      Sort
                    </h3>

                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-full border border-[#e3d9c4] bg-[#F8F4EC] px-3 py-2 text-sm outline-none"
                    >
                      <option value="featured">
                        Featured
                      </option>

                      <option value="best">
                        Best selling
                      </option>

                      <option value="price-asc">
                        Price: low to high
                      </option>

                      <option value="price-desc">
                        Price: high to low
                      </option>

                      <option value="newest">
                        Newest
                      </option>

                      <option value="rating">
                        Highest rating
                      </option>
                    </select>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="w-full rounded-full bg-[#0D3B2E] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Clear filters
                  </button>

                  <button
                    onClick={() =>
                      setMobileFiltersOpen(false)
                    }
                    className="w-full rounded-full border border-[#e3d9c4] px-4 py-3 text-sm font-semibold text-[#0D3B2E]"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="w-full">
            {loading ? (
              <div className="rounded-[32px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
                <p className="text-[#0D3B2E]">
                  Loading fragrances...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-[32px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-semibold text-[#0D3B2E]">
                  Unable to load fragrances
                </h3>

                <p className="mt-3 text-[#5b5b5b]">
                  {error}
                </p>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-6 rounded-full bg-[#0D3B2E] px-6 py-3 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map(
                  (product, index) => (
                    <motion.div
                      key={product._id || product.id}
                      initial={{
                        opacity: 0,
                        y: 24,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.15,
                      }}
                      transition={{
                        duration: 0.45,
                        delay: index * 0.05,
                      }}
                    >
                      <ProductCard
                        product={product}
                        onQuickView={
                          openQuickView
                        }
                      />
                    </motion.div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-[32px] border border-[#e3d9c4] bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-semibold text-[#0D3B2E]">
                  No fragrances found.
                </h3>

                <p className="mt-3 text-[#5b5b5b]">
                  Try a different search or clear
                  some filters to discover more
                  scents.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-[#0D3B2E] px-6 py-3 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        open={quickViewOpen}
        onClose={closeQuickView}
        onAddToCart={addQuickViewToCart}
      />
    </Layout>
  );
};