import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const usePerfiles = () => {
  return useQuery({
    queryKey: ['perfiles'],
    queryFn: () => fetchWithToken('/perfiles/'),
  });
};
