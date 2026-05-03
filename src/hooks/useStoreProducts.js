// src/hooks/useStoreProducts.js
import { useEffect, useState, useRef, useCallback } from 'react';
import { getProducts } from '../services/api';
import { cacheKeyForProducts, readCache, saveCache } from '../utils/cache';
import { ALL_KINDS, matchesProductKind } from '../utils/productKinds';

/**
 * Cache-first + refresh manual no bloqueante.
 * - Carga inicial:
 *    - Si hay caché válido → lo muestra y NO llama a DB.
 *    - Si NO hay caché → spinner bloqueante hasta que responda DB.
 * - Refresh manual:
 *    - Mantiene caché en pantalla, muestra "actualizando…", y reemplaza al llegar DB.
 */
export default function useStoreProducts({
  storeId,
  kind,
  version = 'v2',
  ttlMs, // opcional
} = {}) {
  const resolvedStoreId = storeId || 'all';
  const [items, setItems] = useState([]);
  const [loading, setLoad] = useState(true); // bloqueante solo en primera carga sin caché
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // refresh manual en curso
  const keyRef = useRef(null);

  const sortProducts = (arr) => {
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
  };

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
      // mantenemos lo que haya (caché)
    } finally {
      setIsRefreshing(false);
    }
  }, [filterProducts, ttlMs]);

  // Carga inicial
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoad(true);
      setError(null);

      const kindSafe = ALL_KINDS;
      const key = cacheKeyForProducts(resolvedStoreId, version, kindSafe);
      keyRef.current = key;

      const cached = readCache(key);
      if (cached && Array.isArray(cached)) {
        if (!mounted) return;
        setItems(filterProducts(cached));
        setFromCache(true);
        setLoad(false);
      }

      // Sin caché → llamada inicial a DB (bloqueante)
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
        setError(e?.message || 'Error al cargar productos');
        setItems([]); // sin caché + error → vacío
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
