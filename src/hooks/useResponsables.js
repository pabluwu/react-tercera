import { useQuery } from '@tanstack/react-query';
import { fetchWithToken } from '../api/fetchWithToken';

export const useResponsables = () => {
    return useQuery({
        queryKey: ['responsables'],
        queryFn: () => fetchWithToken('/citaciones/responsables/'),
    });
};
