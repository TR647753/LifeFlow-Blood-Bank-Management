
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://lifeflow-backend-nkrh.onrender.com/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('bb_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const asset = (path) =>
  path
    ? `${API_URL.replace(/\/api$/, '')}${path}`
    : '';

export default api;
