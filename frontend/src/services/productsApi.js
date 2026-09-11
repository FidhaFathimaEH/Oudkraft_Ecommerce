import { getApiBaseUrl } from '../config/apiConfig';

export const getProductsFromApi = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  const baseUrl = getApiBaseUrl();

  const response = await fetch(
    `${baseUrl}/products${query ? `?${query}` : ''}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};

export const getProductBySlugFromApi = async (slug) => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(
    `${baseUrl}/products/${encodeURIComponent(slug)}`
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