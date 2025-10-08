// src/hooks/useTiposPermitidos.js
import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useTiposPermitidos = () => {
    return useQuery({
        queryKey: ['tipos-permitidos'],
        queryFn: () => fetchWithToken('/archivo/tipos-permitidos/'),
    });
};
