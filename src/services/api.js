import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// GET simple: devuelve todos los productos
export async function getProducts() {
  const { data } = await api.get('/get-products');

  // tu backend devuelve { items, total, ... }.
  const items = Array.isArray(data) ? data : data.items || [];

  // normalizamos un id usable en el front
  return items.map((x) => ({ ...x, id: x.client_id ?? x._id }));
}
