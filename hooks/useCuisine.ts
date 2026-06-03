import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '../lib/api';

type CuisineParams = {
  state?: string;
  meal_type?: string;
  is_vegetarian?: boolean;
  per_page?: number;
  page?: number;
};

export function useCuisine(params?: CuisineParams) {
  return useQuery({
    queryKey: ['cuisine', params],
    queryFn: () => api.get(endpoints.cuisine, { params }) as Promise<any>,
  });
}
