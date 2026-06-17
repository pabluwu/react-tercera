import { fetchWithToken } from './fetchWithToken';
import { API_BASE_URL } from './apiConfig';
import useAuthStore from '../store/useAuthStore';

// Obtener listado de perfiles de bomberos (para asignarles expedientes o accidentes)
export const getBomberosPerfiles = async () => {
  return fetchWithToken('/perfiles/');
};

// --- Expedientes de Salud ---

export const getExpedientes = async (filters = {}) => {
  let url = '/salud/expedientes/';
  const params = [];
  if (filters.bombero) params.push(`bombero=${filters.bombero}`);
  if (filters.categoria) params.push(`categoria=${filters.categoria}`);
  if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  return fetchWithToken(url);
};

export const createExpediente = async (formData) => {
  return fetchWithToken('/salud/expedientes/', {
    method: 'POST',
    body: formData, // FormData con archivo
  });
};

export const deleteExpediente = async (id) => {
  return fetchWithToken(`/salud/expedientes/${id}/`, {
    method: 'DELETE',
  });
};

// --- Accidentes ---

export const getAccidentes = async (filters = {}) => {
  let url = '/salud/accidentes/';
  const params = [];
  if (filters.bombero) params.push(`bombero=${filters.bombero}`);
  if (filters.estado) params.push(`estado=${filters.estado}`);
  if (filters.contexto) params.push(`contexto=${filters.contexto}`);
  if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  return fetchWithToken(url);
};

export const getAccidenteDetalle = async (id) => {
  return fetchWithToken(`/salud/accidentes/${id}/`);
};

export const createAccidente = async (data) => {
  return fetchWithToken('/salud/accidentes/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAccidente = async (id, data) => {
  return fetchWithToken(`/salud/accidentes/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// --- Movimientos / Hitos ---

export const createMovimiento = async (formData) => {
  return fetchWithToken('/salud/movimientos/', {
    method: 'POST',
    body: formData, // FormData para soportar archivo opcional
  });
};

export const deleteMovimiento = async (id) => {
  return fetchWithToken(`/salud/movimientos/${id}/`, {
    method: 'DELETE',
  });
};

// --- Descarga Segura ---

export const downloadSaludFile = async (endpoint, fileName) => {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: No se pudo descargar el archivo`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
