import { setAccessToken, clearAccessToken } from '@/entities/session';
import type { AppStore } from '@/app/store'; 

const BASE_URL = import.meta.env.VITE_BASE_BACKEND_URL;
const REFRESH_URL = `${BASE_URL}/auth/refresh`;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let store: AppStore | undefined;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

type CustomFetchArgs = [string, RequestInit?];

export const httpClient = async (...args: CustomFetchArgs): Promise<Response> => {
  if (!store) {
    throw new Error('Redux store not injected into httpClient');
  }

  const [inputUrl, inputConfig] = args;
  const config: RequestInit = inputConfig || {};
  const headers = new Headers(config.headers || {});
  const state = store.getState(); 
  const token = state.session;

  const isAbsolute = inputUrl.startsWith('http://') || inputUrl.startsWith('https://');
  const url = isAbsolute ? inputUrl : `${BASE_URL}${inputUrl}`;
  
  if (token && !url.includes('/auth/refresh')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  config.headers = headers;

  let response = await fetch(url, config);

  if (response.status === 401 && !url.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = performRefresh();
    }
    const newToken = await refreshPromise;
    isRefreshing = false;

    if (newToken) {
      const retryConfig: RequestInit = {
          ...config,
          headers: new Headers(config.headers),
        };

        (retryConfig.headers as Headers).set(
          'Authorization',
          `Bearer ${newToken}`
        );
      response = await fetch(url, retryConfig);
    } else {
        console.log('401')
        store.dispatch(clearAccessToken());
    }
  }

  return response;
};

export async function performRefresh(): Promise<string | null> {
  if (!store) return null;

  try {
    const response = await fetch(REFRESH_URL, { 
      method: 'GET', 
      credentials: 'include' 
    });

    if (response.ok) {
      const data = await response.json();
      const newToken = data.token;
      store.dispatch(setAccessToken(newToken));
      return newToken;
    }
  } catch (error) {
    console.error('Auto-refresh failed', error);
  }
  return null;
}