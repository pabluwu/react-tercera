import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useEliminarExcepcionAsistencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      return await fetchWithToken(`/excepciones-asistencia/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: false }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['excepciones-asistencia']);
    },
  });
};
