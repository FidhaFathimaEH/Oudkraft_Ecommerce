/**
 * Centralized API Base URL Configuration for Oud Kraft
 *
 * Architecture:
 * - Production (Vercel): Must be provided via import.meta.env.VITE_API_BASE_URL
 *   pointing to the Render backend service (e.g. https://oudkraft-backend.onrender.com/api/v1).
 *   If missing in production, it fails clearly with an error rather than silently
 *   falling back to an unreachable localhost URL.
 * - Development (Vite Dev Server): If VITE_API_BASE_URL is not set, falls back to
 *   '/api/v1' which is proxied by Vite to http://localhost:5000.
 */

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL;

const formatBaseUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

let resolvedBaseUrl = '';

if (rawEnvUrl && rawEnvUrl.trim()) {
  resolvedBaseUrl = formatBaseUrl(rawEnvUrl);
} else if (import.meta.env.DEV) {
  resolvedBaseUrl = '/api/v1';
} else {
  // Production build without VITE_API_BASE_URL:
  // Log a prominent, actionable error rather than silently falling back to localhost.
  console.error(
    '[Oud Kraft Production Error] VITE_API_BASE_URL is missing from environment variables. ' +
    'Please configure VITE_API_BASE_URL in your Vercel Project Settings to your Render backend URL.'
  );
  resolvedBaseUrl = '';
}

/**
 * Returns the resolved API base URL.
 * Throws a clear configuration error in production if the environment variable is not defined.
 */
export const getApiBaseUrl = () => {
  if (!resolvedBaseUrl) {
    if (import.meta.env.PROD) {
      throw new Error(
        'Oud Kraft Configuration Error: VITE_API_BASE_URL environment variable is not configured in Vercel. ' +
        'Please set VITE_API_BASE_URL in your Vercel Project Settings pointing to your Render backend.'
      );
    }
    return '/api/v1';
  }
  return resolvedBaseUrl;
};

export const API_BASE_URL = resolvedBaseUrl || (import.meta.env.DEV ? '/api/v1' : '');

export default API_BASE_URL;
