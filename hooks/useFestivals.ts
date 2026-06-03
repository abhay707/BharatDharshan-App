import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../lib/api';

type FestivalsParams = {
  month?: number;
  religion?: string;
  is_national?: boolean;
  per_page?: number;
  page?: number;
};

export function useFestivals(params?: FestivalsParams) {
  return useQuery({
    queryKey: ['festivals', params],
    queryFn: () => api.get(endpoints.festivals, { params }) as Promise<any>,
  });
}

export function useFestivalDetail(slug: string) {
  return useQuery({
    queryKey: ['festival', slug],
    queryFn: () => api.get(endpoints.festival(slug)) as Promise<any>,
    enabled: !!slug,
  });
}
