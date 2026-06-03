import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';
// Change to your production URL when deployed

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Unwrap response.data so callers receive the payload directly
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
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
