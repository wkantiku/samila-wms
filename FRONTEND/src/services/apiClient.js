import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token on every request
apiClient.interceptors.request.use((config) => {
  try {
    const session = localStorage.getItem('wms_session');
    if (session) {
      const { token } = JSON.parse(session);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Handle 401 — clear session
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wms_session');
      localStorage.removeItem('wms_pwa_session');
    }
    return Promise.reject(err?.response?.data || err);
  }
);

export default apiClient;
