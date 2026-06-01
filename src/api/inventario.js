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
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.json();
};

// ==================== SALAS ====================

export const getSalas = async () => {
    console.log(headersWithToken());
    const response = await fetch(`${API_BASE_URL}/inventario/salas/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const getSala = async (id) => {
    const response = await fetch(`${API_BASE_URL}/inventario/salas/${id}/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const createSala = async (data, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/salas/`, {
        method: 'POST',
        headers: headersWithToken(),
        body: JSON.stringify({ ...data, motivo }),
    });
    return handleResponse(response);
};

export const updateSala = async (id, data, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/salas/${id}/`, {
        method: 'PUT',
        headers: headersWithToken(),
        body: JSON.stringify({ ...data, motivo }),
    });
    return handleResponse(response);
};

export const patchSala = async (id, data, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/salas/${id}/`, {
        method: 'PATCH',
        headers: headersWithToken(),
        body: JSON.stringify({ ...data, motivo }),
    });
    return handleResponse(response);
};

export const deleteSala = async (id, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/salas/${id}/`, {
        method: 'DELETE',
        headers: headersWithToken(),
        body: JSON.stringify({ motivo }),
    });
    return handleResponse(response);
};

// ==================== ITEMS ====================

export const getItems = async (salaId = null) => {
    const endpoint = salaId
        ? `/inventario/items/?sala=${salaId}`
        : '/inventario/items/';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const getItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/inventario/items/${id}/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};

export const createItem = async (data, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/items/`, {
        method: 'POST',
        headers: headersWithToken(),
        body: JSON.stringify({ ...data, motivo }),
    });
    return handleResponse(response);
};

export const updateItem = async (id, data, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/items/${id}/`, {
        method: 'PUT',
        headers: headersWithToken(),
        body: JSON.stringify({ ...data, motivo }),
    });
    return handleResponse(response);
};

export const patchItem = async (id, data, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/items/${id}/`, {
        method: 'PATCH',
        headers: headersWithToken(),
        body: JSON.stringify({ ...data, motivo }),
    });
    return handleResponse(response);
};

export const deleteItem = async (id, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/items/${id}/`, {
        method: 'DELETE',
        headers: headersWithToken(),
        body: JSON.stringify({ motivo }),
    });
    return handleResponse(response);
};

export const transferItem = async (id, nuevaSalaId, motivo) => {
    const response = await fetch(`${API_BASE_URL}/inventario/items/${id}/transferir/`, {
        method: 'POST',
        headers: headersWithToken(),
        body: JSON.stringify({ nueva_sala_id: nuevaSalaId, motivo }),
    });
    return handleResponse(response);
};

// ==================== LOGS ====================

export const getLogs = async () => {
    const response = await fetch(`${API_BASE_URL}/inventario/logs/`, {
        method: 'GET',
        headers: headersWithToken(),
    });
    return handleResponse(response);
};