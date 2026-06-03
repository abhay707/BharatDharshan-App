import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../lib/api';

type StatesParams = {
  region?: string;
  search?: string;
  per_page?: number;
  page?: number;
};

export function useStates(params?: StatesParams) {
  return useQuery({
    queryKey: ['states', params],
    queryFn: () => api.get(endpoints.states, { params }) as Promise<any>,
  });
}

export function useStateDetail(slug: string) {
  return useQuery({
    queryKey: ['state', slug],
    queryFn: () => api.get(endpoints.state(slug)) as Promise<any>,
    enabled: !!slug,
  });
}
