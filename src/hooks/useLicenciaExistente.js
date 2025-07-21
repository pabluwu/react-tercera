import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useLicenciaExistente = (autorId, citacionId) => {

  return useQuery({
    enabled: !!autorId && !!citacionId,
    queryKey: ['licencia_existente', autorId, citacionId],
    queryFn: () =>
      fetchWithToken(`/licencias/?autor=${autorId}&citacion=${citacionId}`),
  });
};
