import { getApiBaseUrl } from '../config/apiConfig';

/**
 * Upload a single product image file to the backend Cloudinary endpoint.
 *
 * @param {File} file - File object selected from file input
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadProductImage = async (file) => {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${baseUrl}/uploads/image`, {
    method: 'POST',
    credentials: 'include',
    // Do NOT set Content-Type header; browser will attach multipart/form-data boundary automatically
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to upload image to server');
  }

  return data.data;
};

/**
 * Upload multiple product image files to the backend Cloudinary endpoint.
 *
 * @param {File[]} files - Array of File objects
 * @returns {Promise<Array<{ url: string, publicId: string }>>}
 */
export const uploadProductImages = async (files) => {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one image file');
  }

  const baseUrl = getApiBaseUrl();
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });

  const res = await fetch(`${baseUrl}/uploads`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to upload images to server');
  }

  return data.data;
};
