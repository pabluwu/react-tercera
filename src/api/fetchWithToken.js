// src/api/fetchWithToken.js
import useAuthStore from '../store/useAuthStore';
import { API_BASE_URL } from './apiConfig';

export const fetchWithToken = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().accessToken;

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Solo agregamos Content-Type si NO es FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return await res.json();
};
