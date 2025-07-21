import { useMutation } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useCrearCitacion = () => {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchWithToken('/citaciones/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  });
};
