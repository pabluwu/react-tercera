const DEFAULT_API_ORIGIN = 'http://test-api.terceraquillota.cl/api';
const envOrigin = (process.env.REACT_APP_API_ORIGIN || '').trim();
const API_ORIGIN = (envOrigin || DEFAULT_API_ORIGIN).replace(/\/+$/, '');

export const API_BASE_URL = `${API_ORIGIN}/api`;
