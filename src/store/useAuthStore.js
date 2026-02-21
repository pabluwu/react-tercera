
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
        // Guardar tokens en estado antes de pedir /me/ para que fetchWithToken use el Bearer correcto
        set({ accessToken: access, refreshToken: refresh });
        const me = await fetchWithToken('/me/');
        console.log(me, 'ver auth');
        localStorage.setItem('user', JSON.stringify(me));
        set({ user: me });
    },

    logout: () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        set({ accessToken: null, refreshToken: null, user: null });
    },
}));

export default useAuthStore;
