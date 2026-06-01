import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useEditarExcepcionAsistencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return await fetchWithToken(`/excepciones-asistencia/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['excepciones-asistencia']);
    },
  });
};
