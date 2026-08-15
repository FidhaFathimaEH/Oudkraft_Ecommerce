const API_BASE_URL = 'http://localhost:5000/api/v1';

const request = async (url) => {
  const response = await fetch(`${API_BASE_URL}${url}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch products');
  }

  return data;
};

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const queryString = query.toString();

  const result = await request(
    `/products${queryString ? `?${queryString}` : ''}`
  );

  return result.data;
};

export const getProductBySlug = async (slug) => {
  const result = await request(
    `/products/${encodeURIComponent(slug)}`
  );

  return result.data;
};

export const getFeaturedProducts = async () => {
  return getProducts({ featured: true });
};

export const getBestSellers = async () => {
  return getProducts({ bestseller: true });
};

export const getProductsByGender = async (gender) => {
  return getProducts({ gender });
};

export const getProductsByCategory = async (category) => {
  return getProducts({ category });
};