import { useMutation } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useCrearExcepcionAsistencia = () => {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchWithToken('/excepciones-asistencia/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  });
};
