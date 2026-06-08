import axios from 'axios';
import { Platform } from 'react-native';
import { cacheGet, cacheSet } from './cache';
import { setOfflineState } from './offlineState';

// iOS simulator → localhost, Android emulator → 10.0.2.2
// Physical device → replace with your machine's LAN IP e.g. http://192.168.1.x:8000/api/v1
const BASE_URL = Platform.select({
  ios: 'http://localhost:8000/api/v1',
  android: 'http://10.0.2.2:8000/api/v1',
  default: 'http://localhost:8000/api/v1',
});

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// On success: cache response, mark online
api.interceptors.response.use(
  async (response) => {
    const key = response.config.url ?? '';
    if (key) await cacheSet(key, response.data);
    setOfflineState(false);
    return response.data;
  },
  async (error) => {
    // Network error (no server response) → fall back to cache
    if (!error.response) {
      const key = (error.config?.url as string | undefined) ?? '';
      if (key) {
        const cached = await cacheGet(key);
        if (cached !== null) {
          setOfflineState(true);
          return cached;
        }
      }
    }
    return Promise.reject(error);
  },
);

export const endpoints = {
  home: '/home',
  states: '/states',
  state: (slug: string) => `/states/${slug}`,
  monuments: '/monuments',
  monument: (slug: string) => `/monuments/${slug}`,
  festivals: '/festivals',
  festival: (slug: string) => `/festivals/${slug}`,
  cuisine: '/cuisine',
  search: (q: string) => `/search?q=${encodeURIComponent(q)}`,
};
