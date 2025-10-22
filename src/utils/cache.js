// src/utils/cache.js

// Clave "oficial" de productos (la que estás usando ahora).
// products:${storeId}:${kindSafe}:${version}
export const cacheKeyForProducts = (storeId, version, kindSafe) =>
  `products:${storeId}:${kindSafe}:${version}`;

// Clave "legacy" opcional (por si el hook quedó con otro orden en algún lado).
// products:${version}:${storeId}:${kindSafe}
export const legacyCacheKeyForProducts = (storeId, version, kindSafe) =>
  `products:${version}:${storeId}:${kindSafe}`;

export const saveCache = (key, data, ttlMs = 12 * 60 * 60 * 1000) => {
  try {
    const exp = Date.now() + ttlMs;
    localStorage.setItem(key, JSON.stringify({ data, exp }));
  } catch {
    // storage lleno o modo privado → ignorar
  }
};

export const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Backward-compat: si alguien guardó el array “crudo”, úsalo.
    if (Array.isArray(parsed)) return parsed;

    const { data, exp } = parsed || {};
    if (!exp || Date.now() > exp) {
      localStorage.removeItem(key);
      return null;
    }
    return data ?? null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};
