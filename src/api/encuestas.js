import useAuthStore from '../store/useAuthStore';
import { API_BASE_URL } from './apiConfig';

const getToken = () => {
    return useAuthStore.getState().accessToken;
};

const headersWithToken = (additionalHeaders = {}) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    ...additionalHeaders,
});

const handleResponse = async (response) => {
    if (response.status === 401) {
        window.location.href = '/login';
        return null;
    }
    if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Error ${response.status}`;
        try {
            const parsed = JSON.parse(errorText);
            if (Array.isArray(parsed)) {
                errorMsg = parsed.join(', ');
            } else if (typeof parsed === 'object') {
                errorMsg = Object.entries(parsed)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
                    .join(' | ');
            } else {
                errorMsg = parsed.detail || errorText;
            }
        } catch {
            errorMsg = errorText || errorMsg;
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const getFormularios = async () => {
    const response = await fetch(`${API_BASE_URL}/formularios/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const getFormularioDetail = async (id) => {
    const response = await fetch(`${API_BASE_URL}/formularios/${id}/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const getFormularioByUuid = async (uuid) => {
    const response = await fetch(`${API_BASE_URL}/formularios/uuid/${uuid}/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const createFormulario = async (data) => {
    const response = await fetch(`${API_BASE_URL}/formularios/`, {
        method: 'POST',
        headers: headersWithToken(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateFormulario = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/formularios/${id}/`, {
        method: 'PUT',
        headers: headersWithToken(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteFormulario = async (id) => {
    const response = await fetch(`${API_BASE_URL}/formularios/${id}/`, {
        method: 'DELETE',
        headers: headersWithToken(),
    });
    if (response.status === 204) {
        return true;
    }
    return handleResponse(response);
};

export const getFormularioResultados = async (id) => {
    const response = await fetch(`${API_BASE_URL}/formularios/${id}/resultados/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const submitFormularioRespuesta = async (data) => {
    const response = await fetch(`${API_BASE_URL}/formularios-respuestas/`, {
        method: 'POST',
        headers: headersWithToken(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};
