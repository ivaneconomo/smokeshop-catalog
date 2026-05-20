import axios from 'axios';

// Instancia base — la URL se toma de la variable de entorno en producción
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Loguea cada request en la consola del browser (solo visible en dev)
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

// Loguea la respuesta; propaga el error tal cual para que cada llamador lo maneje
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

// ── Productos ─────────────────────────────────────────────────────────────────

export const getProducts = (opts = {}) =>
  api.get('/products', { params: opts }).then((r) => r.data);

export const createProduct = (payload) =>
  api.post('/products', payload).then((r) => r.data);

export const reorderProducts = (ids) =>
  api.patch('/products/reorder', { ids }).then((r) => r.data);

export const getProductById = (id) =>
  api.get(`/products/${id}`).then((r) => r.data);

export const updateProduct = (id, data) =>
  api.patch(`/products/${id}`, data).then((r) => r.data);

// Cambia la disponibilidad de un sabor para una tienda específica
export const patchFlavorAvailability = ({ productId, flavorId, storeId, available }) =>
  api
    .patch(`/products/${productId}/flavors/${flavorId}/availability`, { storeId, available })
    .then((r) => r.data);

// ── Settings: visibilidad de categorías ──────────────────────────────────────

// Devuelve los kinds ocultos en el catálogo público
export const getKindVisibility = () =>
  api.get('/settings/kind-visibility').then((r) => r.data);

export const updateKindVisibility = (store_id, hidden_kinds) =>
  api.patch('/settings/kind-visibility', { store_id, hidden_kinds }).then((r) => r.data);

// ── Settings: efectos de los productos ───────────────────────────────────────

export const getEffects = () =>
  api.get('/settings/subcategories').then((r) => r.data);

export const updateEffects = (subcategories) =>
  api.patch('/settings/subcategories', { subcategories }).then((r) => r.data);

// ── Settings: tiendas ─────────────────────────────────────────────────────────

// Devuelve la lista de tiendas con id, nombre y logo
export const getStores = () =>
  api.get('/settings/stores').then((r) => r.data);

export const updateStores = (stores) =>
  api.patch('/settings/stores', { stores }).then((r) => r.data);

// ── Settings: tipos de producto ───────────────────────────────────────────────

// Devuelve los kinds disponibles con sus labels, campos y componentes
export const getProductTypes = () =>
  api.get('/settings/product-types').then((r) => r.data);

// product_types y strains son opcionales — se puede actualizar solo uno de los dos
export const updateProductTypes = (product_types, strains) =>
  api.patch('/settings/product-types', { product_types, strains }).then((r) => r.data);
