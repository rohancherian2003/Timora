import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token if available (real tokens only, exclude demo sessions)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('timora_auth_token') || localStorage.getItem('timora_access_token');
  if (token && !token.startsWith('demo-') && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle 401 token expiry (exclude login endpoint to allow inline PIN error display)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('timora_auth_token');
        localStorage.removeItem('timora_auth_user');
        localStorage.removeItem('timora_access_token');
        localStorage.removeItem('timora_user');
        localStorage.removeItem('timora_last_active');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('timora:auth:unauthorized'));
        }
      }
    }
    return Promise.reject(error);
  }
);
