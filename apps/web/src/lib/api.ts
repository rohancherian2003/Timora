import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('timora_access_token') || localStorage.getItem('timora_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle 401 token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('timora_access_token');
      localStorage.removeItem('timora_auth_token');
      localStorage.removeItem('timora_user');
      localStorage.removeItem('timora_auth_user');
      localStorage.removeItem('timora_last_active');
    }
    return Promise.reject(error);
  }
);
