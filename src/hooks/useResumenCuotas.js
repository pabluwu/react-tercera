import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useResumenCuotas = () => {
  return useQuery({
    queryKey: ['tesoreria', 'resumen-cuotas'],
    queryFn: () => fetchWithToken('/tesoreria/resumen-cuotas/'),
  });
};
