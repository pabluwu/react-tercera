// const DEFAULT_API_ORIGIN = 'https://test-api.terceraquillota.cl';
// const DEFAULT_API_ORIGIN = 'http://127.0.0.1:8000';
const DEFAULT_API_ORIGIN = 'https://api.terceraquillota.cl';
const envOrigin = (process.env.REACT_APP_API_ORIGIN || '').trim();
const API_ORIGIN = (envOrigin || DEFAULT_API_ORIGIN).replace(/\/+$/, '');

export const API_BASE_URL = `${API_ORIGIN}/api`;
