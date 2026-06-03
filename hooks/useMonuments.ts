import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../lib/api';

type MonumentsParams = {
  state?: string;
  type?: string;
  category?: string;
  per_page?: number;
  page?: number;
};

export function useMonuments(params?: MonumentsParams) {
  return useQuery({
    queryKey: ['monuments', params],
    queryFn: () => api.get(endpoints.monuments, { params }) as Promise<any>,
  });
}

export function useMonumentDetail(slug: string) {
  return useQuery({
    queryKey: ['monument', slug],
    queryFn: () => api.get(endpoints.monument(slug)) as Promise<any>,
    enabled: !!slug,
  });
}
