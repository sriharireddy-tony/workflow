import axios from 'axios';
import { STORAGE_KEYS } from '@/constants';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Request failed';
    const enhanced = new Error(message);
    enhanced.status = err.response?.status;
    enhanced.details = err.response?.data?.details;
    return Promise.reject(enhanced);
  }
);

export default apiClient;
