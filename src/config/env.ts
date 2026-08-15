/**
 * Environment & Backend API Configuration
 * Automatically chooses the API host and WebSocket URL based on MODE.
 */

const normalizeUrl = (url?: string, defaultProtocol: 'http://' | 'https://' = 'http://'): string => {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `${defaultProtocol}${trimmed}`;
  }
  return trimmed.replace(/\/+$/, '');
};

// Mode resolution: checks NEXT_PUBLIC_MODE, MODE, and NODE_ENV
const rawMode = (
  process.env.NEXT_PUBLIC_MODE ||
  process.env.MODE ||
  process.env.NODE_ENV ||
  'development'
).toLowerCase().trim();

export const IS_PRODUCTION = rawMode === 'production' || rawMode === 'prod';
export const IS_DEVELOPMENT = !IS_PRODUCTION;
export const CURRENT_MODE = IS_PRODUCTION ? 'production' : 'development';

// Host URLs from environment variables with fallback defaults
export const BACKEND_LOCAL_HOST = normalizeUrl(
  process.env.NEXT_PUBLIC_BACKEND_LOCAL_HOST ||
    process.env.BACKEND_LOCAL_HOST ||
    'http://localhost:8000',
  'http://'
);

export const BACKEND_PRODUCTION_HOST = normalizeUrl(
  process.env.NEXT_PUBLIC_BACKEND_PRODUCTION_HOST ||
    process.env.BACKEND_PRODUCTION_HOST ||
    'https://ai-teacher-backend-1xbf.onrender.com',
  'https://'
);

// Automatic API Host Selection based on mode
export const API_BASE_URL: string = (() => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  }
  return IS_PRODUCTION ? BACKEND_PRODUCTION_HOST : BACKEND_LOCAL_HOST;
})();

/**
 * Returns WebSocket URL for the configured backend host
 */
export function getWebSocketUrl(path: string = ''): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const wsBase = API_BASE_URL.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
  return `${wsBase}${cleanPath}`;
}
