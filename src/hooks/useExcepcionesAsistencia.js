import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useExcepcionesAsistencia = () => {
  return useQuery({
    queryKey: ['excepciones-asistencia'],
    queryFn: () => fetchWithToken('/excepciones-asistencia/'),
  });
};
