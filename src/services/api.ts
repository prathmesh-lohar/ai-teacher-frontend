import { API_BASE_URL } from '@/config/env';

export const API_BASE = API_BASE_URL;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getStoredTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  };
}

export function setStoredTokens(access: string, refresh?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', access);
  if (refresh) {
    localStorage.setItem('refresh_token', refresh);
  }
}

export function clearStoredTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('cached_user');
}

export async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getStoredTokens();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/api/accounts/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      clearStoredTokens();
      return null;
    }

    const data = await res.json();
    if (data.access) {
      setStoredTokens(data.access, data.refresh);
      return data.access;
    }
    return null;
  } catch {
    clearStoredTokens();
    return null;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let { access } = getStoredTokens();
  if (access) {
    headers.set('Authorization', `Bearer ${access}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, attempt token refresh once
  if (response.status === 401 && access) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.set('Authorization', `Bearer ${newAccess}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    if (data && typeof data === 'object') {
      if (data.detail) errorMsg = data.detail;
      else if (data.message) errorMsg = data.message;
      else if (data.non_field_errors) errorMsg = data.non_field_errors.join(', ');
      else {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          errorMsg = Array.isArray(val) ? `${firstKey}: ${val.join(', ')}` : `${firstKey}: ${val}`;
        }
      }
    }
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
}
