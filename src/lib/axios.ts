import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Axios instance with base URL
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch {
      // localStorage parse failure — ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses — clear session and redirect to auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
