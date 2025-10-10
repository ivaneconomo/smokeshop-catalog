const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12h

export function cacheKeyForProducts(storeId, version = 'v1', kind = '__all__') {
  return `products:${storeId}:${kind}:${version}`;
}

export function saveCache(key, payload, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();
  const record = { payload, ts: now, ttl: ttlMs };
  localStorage.setItem(key, JSON.stringify(record));
}

export function readCache(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const { payload, ts, ttl } = JSON.parse(raw);
    if (typeof ts !== 'number' || typeof ttl !== 'number') return null;
    if (Date.now() - ts > ttl) return null; // expiró
    return payload;
  } catch {
    return null;
  }
}

export function clearCache(keyPrefix = 'products:') {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(keyPrefix))
    .forEach((k) => localStorage.removeItem(k));
}
