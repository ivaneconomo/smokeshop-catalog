import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// 🔎 request log
api.interceptors.request.use((config) => {
  console.groupCollapsed(
    `%c${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    'color:#09f'
  );
  console.log('params:', config.params);
  console.log('data:', config.data);
  console.groupEnd();
  return config;
});

// 🔎 response / error log
api.interceptors.response.use(
  (res) => {
    console.groupCollapsed(
      `%cRES ${res.status} ${res.config.url}`,
      'color:#0a0'
    );
    console.log('data:', res.data);
    console.groupEnd();
    return res;
  },
  (err) => {
    const res = err.response;
    console.groupCollapsed(
      `%cERR ${res?.status ?? ''} ${err.config?.url ?? ''}`,
      'color:#f33'
    );
    console.log('data:', res?.data);
    console.log('message:', err.message);
    console.groupEnd();
    return Promise.reject(err);
  }
);

export default api;
export const getProducts = (opts = {}) =>
  api.get('/products', { params: opts }).then((r) => r.data);

export const createProduct = (payload) =>
  api.post('/products', payload).then((r) => r.data);

export const reorderProducts = (ids) =>
  api.patch('/products/reorder', { ids }).then((r) => r.data);

export const getKindVisibility = () =>
  api.get('/settings/kind-visibility').then((r) => r.data);

export const updateKindVisibility = (hidden_kinds) =>
  api.patch('/settings/kind-visibility', { hidden_kinds }).then((r) => r.data);

export const getProductById = (id) =>
  api.get(`/products/${id}`).then((r) => r.data);

export const updateProduct = (id, data) =>
  api.patch(`/products/${id}`, data).then((r) => r.data);

export const getSubcategories = () =>
  api.get('/settings/subcategories').then((r) => r.data);

export const updateSubcategories = (subcategories) =>
  api.patch('/settings/subcategories', { subcategories }).then((r) => r.data);

export const patchFlavorAvailability = ({
  productId,
  flavorId,
  storeId,
  available,
}) =>
  api
    .patch(`/products/${productId}/flavors/${flavorId}/availability`, {
      storeId,
      available,
    })
    .then((r) => r.data);
