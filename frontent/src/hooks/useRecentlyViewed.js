import { useEffect, useState } from 'react';

export const useRecentlyViewed = (productSlug) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (!productSlug) return;

    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('recently-viewed') : null;
    const parsed = stored ? JSON.parse(stored) : [];
    const next = [productSlug, ...parsed.filter((slug) => slug !== productSlug)].slice(0, 6);

    window.localStorage.setItem('recently-viewed', JSON.stringify(next));
    setRecentlyViewed(next);
  }, [productSlug]);

  return recentlyViewed;
};
