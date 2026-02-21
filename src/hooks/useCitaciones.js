import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useCitaciones = ({ fechaDesde, fechaHasta, enabled = true }) => {
  return useQuery({
    queryKey: ['citaciones', fechaDesde ?? null, fechaHasta ?? null],
    queryFn: () => {
      const params = new URLSearchParams();
      if (fechaDesde) params.set('fecha_desde', fechaDesde);
      if (fechaHasta) params.set('fecha_hasta', fechaHasta);
      const query = params.toString();
      return fetchWithToken(`/citaciones/${query ? `?${query}` : ''}`);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};
