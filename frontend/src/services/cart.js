export const getCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem('oudkraft-cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  if (typeof window === 'undefined') return cart;
  window.localStorage.setItem('oudkraft-cart', JSON.stringify(cart));
  return cart;
};

export const updateCartItem = (cart, product, quantity) => {
  const existing = cart.find((item) => item.id === product.id && item.size === product.size);
  if (existing) {
    return cart.map((item) => item.id === product.id && item.size === product.size
      ? { ...item, quantity: Math.max(0, item.quantity + quantity) }
      : item).filter((item) => item.quantity > 0);
  }
  return [...cart, { ...product, size: product.size || '100 ml', quantity: Math.max(1, quantity) }];
};
