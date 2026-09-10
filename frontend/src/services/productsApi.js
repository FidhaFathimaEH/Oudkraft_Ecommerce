const API_BASE_URL = '/api/v1';

export const getProductsFromApi = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await fetch(
    `${API_BASE_URL}/products${query ? `?${query}` : ''}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};

export const getProductBySlugFromApi = async (slug) => {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(slug)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error('Failed to fetch product');
  }

  const result = await response.json();

  return result.data;
};