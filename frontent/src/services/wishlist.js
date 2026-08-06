const WISHLIST_KEY = 'oudkraft-wishlist';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const getWishlist = () => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(WISHLIST_KEY);
    return saved ? safeParse(saved) : [];
  } catch {
    return [];
  }
};

export const saveWishlist = (wishlist) => {
  if (typeof window === 'undefined') return wishlist;

  const nextWishlist = Array.isArray(wishlist) ? wishlist : [];
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(nextWishlist));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wishlist-changed'));
  }

  return nextWishlist;
};

export const isWishlisted = (id) => getWishlist().includes(id);

export const toggleWishlistItem = (id) => {
  const current = getWishlist();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  return saveWishlist(next);
};

export const removeWishlistItem = (id) => saveWishlist(getWishlist().filter((item) => item !== id));
