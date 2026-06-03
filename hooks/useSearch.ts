import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../lib/api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.get(endpoints.search(query)) as Promise<any>,
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000, // search results stale after 1 min
  });
}
