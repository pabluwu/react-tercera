import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useBomberos = () => {
  return useQuery({
    queryKey: ['bomberos'],
    queryFn: () => fetchWithToken('/perfiles/'),
  });
};
