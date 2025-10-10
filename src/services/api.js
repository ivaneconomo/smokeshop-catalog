// src/services/api.js (frontend)
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000', // tu puerto del backend
});

export const getProducts = (opts = {}) =>
  api.get('/products', { params: opts }).then((r) => r.data);
