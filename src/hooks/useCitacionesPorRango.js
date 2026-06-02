import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';
import { formatISO } from 'date-fns';

export const useCitacionesPorRango = (desde, hasta) => {
    return useQuery({
        queryKey: ['citaciones_rango', desde, hasta],
        queryFn: () => {
            const params = new URLSearchParams();
            if (desde) params.append('fecha_desde', formatISO(desde));
            if (hasta) params.append('fecha_hasta', formatISO(hasta));
            return fetchWithToken(`/citaciones/?${params.toString()}`);
        },
        enabled: !!desde && !!hasta,
    });
};
