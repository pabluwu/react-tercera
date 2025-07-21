// src/api/fetchWithToken.js
import useAuthStore from '../store/useAuthStore';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchWithToken = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().accessToken;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Redirigir al login si está fuera de contexto de React
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return await res.json();
};
