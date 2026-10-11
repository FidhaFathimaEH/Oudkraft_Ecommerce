import { getApiBaseUrl } from '../config/apiConfig';
import { getAuthToken } from './auth';

const request = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${baseUrl}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const getProducts = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();

  return request(`/products${query ? `?${query}` : ''}`);
};

export const getProductBySlug = async (slug) => {
  return request(`/products/${slug}`);
};

export const getProductReviews = async (productId) => {
  return request(`/reviews/product/${productId}`);
};

export const createReview = async (reviewData) => {
  return request('/reviews', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(reviewData),
  });
};

export const updateReview = async (reviewId, reviewData) => {
  return request(`/reviews/${reviewId}`, {
    method: 'PATCH',
    credentials: 'include',
    body: JSON.stringify(reviewData),
  });
};

export const deleteReview = async (reviewId) => {
  return request(`/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
};