import { getApiBaseUrl } from '../config/apiConfig';

/**
 * Fetch the public hero banner settings.
 * @returns {Promise<{ imageUrl: string, publicId?: string } | null>}
 */
export const getHeroBanner = async () => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/settings/hero`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch hero banner');
  }
  return data.data;
};

/**
 * Update the hero banner settings (Admin only).
 * @param {{ imageUrl: string, publicId?: string }} payload
 * @returns {Promise<{ imageUrl: string, publicId?: string }>}
 */
export const updateHeroBanner = async (payload) => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/settings/hero`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update hero banner');
  }
  return data.data;
};
