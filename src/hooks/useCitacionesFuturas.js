import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';
import { formatISO } from 'date-fns';

export const useCitacionesFuturas = () => {
    const hoy = formatISO(new Date(), { representation: 'complete' });

    return useQuery({
        queryKey: ['citaciones_futuras'],
        queryFn: () => fetchWithToken(`/citaciones/?fecha_desde=${hoy}`),
    });
};
