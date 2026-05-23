// src/hooks/useStoreProducts.js
import { useEffect, useState, useRef, useCallback } from 'react';
import { getProducts } from '../services/api';
import { cacheKeyForProducts, readCache, saveCache } from '../utils/cache';
import { ALL_KINDS, matchesProductKind } from '../utils/productKinds';

// Fuera del hook para poder usarlo en lazy initializers
function sortProducts(arr) {
  const a = Array.isArray(arr) ? arr : [];
  return [...a].sort((x, y) => {
    const xo = x?.sort_order ?? Infinity;
    const yo = y?.sort_order ?? Infinity;
    if (xo !== yo) return xo - yo;
    const xp = Number(x?.puffs ?? -1);
    const yp = Number(y?.puffs ?? -1);
    if (xp !== yp) return xp - yp;
    const xb = (x?.brand || '').localeCompare(y?.brand || '');
    if (xb !== 0) return xb;
    return (x?.model || '').localeCompare(y?.model || '');
  });
}

/**
 * Stale-while-revalidate:
 * - Si hay cache en localStorage → muestra datos inmediatamente (sin spinner) y refresca en background.
 * - Si no hay cache → spinner bloqueante hasta que responda el backend.
 * - Refresh manual → mantiene lo que hay en pantalla mientras actualiza.
 */
export default function useStoreProducts({
  storeId,
  kind,
  version = 'v2',
  ttlMs,
} = {}) {
  const resolvedStoreId = storeId || 'all';

  // Lazy initializers: leen localStorage en el primer render, sin flicker
  const [items, setItems] = useState(() => {
    const key = cacheKeyForProducts(resolvedStoreId, version, ALL_KINDS);
    const cached = readCache(key);
    if (!cached || !Array.isArray(cached)) return [];
    return sortProducts(cached).filter((item) => matchesProductKind(item, kind));
  });

  const [loading, setLoad] = useState(() => {
    const key = cacheKeyForProducts(resolvedStoreId, version, ALL_KINDS);
    const cached = readCache(key);
    return !cached || !Array.isArray(cached);
  });

  const [fromCache, setFromCache] = useState(() => {
    const key = cacheKeyForProducts(resolvedStoreId, version, ALL_KINDS);
    const cached = readCache(key);
    return !!(cached && Array.isArray(cached));
  });

  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const keyRef = useRef(cacheKeyForProducts(resolvedStoreId, version, ALL_KINDS));

  const filterProducts = useCallback(
    (arr) => sortProducts(arr).filter((item) => matchesProductKind(item, kind)),
    [kind],
  );

  // Refresh manual (no bloquea la UI)
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await getProducts();
      const payload = Array.isArray(data) ? data : data?.items || [];
      const sorted = sortProducts(payload);
      setItems(filterProducts(sorted));
      setFromCache(false);
      saveCache(keyRef.current, sorted, ttlMs);
    } catch (e) {
      setError(e?.message || 'Error al cargar productos');
    } finally {
      setIsRefreshing(false);
    }
  }, [filterProducts, ttlMs]);

  // Carga inicial + background refresh (stale-while-revalidate)
  useEffect(() => {
    let mounted = true;

    const key = cacheKeyForProducts(resolvedStoreId, version, ALL_KINDS);
    keyRef.current = key;

    const cached = readCache(key);
    const hasCache = !!(cached && Array.isArray(cached));

    if (hasCache) {
      // Muestra cache en pantalla mientras el backend responde
      setItems(filterProducts(cached));
      setFromCache(true);
      setLoad(false);
    }

    setError(null);

    (async () => {
      try {
        const data = await getProducts();
        const payload = Array.isArray(data) ? data : data?.items || [];
        const sorted = sortProducts(payload);
        if (!mounted) return;
        setItems(filterProducts(sorted));
        setFromCache(false);
        saveCache(key, sorted, ttlMs);
      } catch (e) {
        if (!mounted) return;
        // Si no hay cache, muestra el error; si hay cache, lo ignora silenciosamente
        if (!hasCache) {
          setError(e?.message || 'Error al cargar productos');
          setItems([]);
        }
      } finally {
        if (mounted) setLoad(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [storeId, kind, version, ttlMs, resolvedStoreId, filterProducts]);

  return { items, loading, error, fromCache, isRefreshing, refresh };
}
