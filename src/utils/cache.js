// src/utils/cache.js
export const cacheKeyForProducts = (storeId, version, kindSafe) =>
  `products:${storeId}:${kindSafe}:${version}`;

export const saveCache = (key, data, ttlMs = 12 * 60 * 60 * 1000) => {
  try {
    const exp = Date.now() + ttlMs;
    localStorage.setItem(key, JSON.stringify({ data, exp }));
  } catch {
    // storage lleno o privado → ignorar
  }
};

export const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, exp } = JSON.parse(raw);
    if (!exp || Date.now() > exp) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};
