const DEFAULT_API_ORIGIN = 'https://test-api.terceraquillota.cl';
const envOrigin = (process.env.REACT_APP_API_ORIGIN || '').trim();
const API_ORIGIN = (envOrigin || DEFAULT_API_ORIGIN).replace(/\/+$/, '');

export const API_BASE_URL = `${API_ORIGIN}/api`;
