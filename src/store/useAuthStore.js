
import { create } from 'zustand';
import { fetchWithToken } from '../api/fetchWithToken';

const useAuthStore = create((set) => ({

    accessToken: localStorage.getItem('access') || null,
    refreshToken: localStorage.getItem('refresh') || null,
    user: (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    })(),



    login: async (access, refresh) => {
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        const me = await fetchWithToken('/me/');
        localStorage.setItem('user', JSON.stringify(me));
        set({ accessToken: access, refreshToken: refresh, user: me });
    },

    logout: () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        set({ accessToken: null, refreshToken: null, user: null });
    },
}));

export default useAuthStore;
