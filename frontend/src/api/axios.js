import axios from 'axios';

// Use relative URL so Vite's dev proxy handles it, keeping cookies on same origin.
// In production, set baseURL to your deployed API URL.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Global response interceptor: redirect to /login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
