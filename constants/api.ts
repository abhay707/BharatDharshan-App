export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const ENDPOINTS = {
  home: '/home',
  states: '/states',
  state: (slug: string) => `/states/${slug}`,
  monuments: '/monuments',
  monument: (slug: string) => `/monuments/${slug}`,
  festivals: '/festivals',
  festival: (slug: string) => `/festivals/${slug}`,
  cuisine: '/cuisine',
  search: (q: string) => `/search?q=${encodeURIComponent(q)}`,
} as const;
