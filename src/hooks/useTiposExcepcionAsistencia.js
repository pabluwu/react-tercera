import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useTiposExcepcionAsistencia = () => {
  return useQuery({
    queryKey: ['tipos-excepcion-asistencia'],
    queryFn: () => fetchWithToken('/excepciones-asistencia/tipos/'),
  });
};
