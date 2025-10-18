// src/hooks/useStoreProducts.js
import { useEffect, useState, useRef, useCallback } from 'react';
import { getProducts } from '../services/api';
import { cacheKeyForProducts, readCache, saveCache } from '../utils/cache';

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
  version = 'v1',
  ttlMs, // opcional
} = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoad] = useState(true); // bloqueante solo en primera carga sin caché
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // refresh manual en curso
  const keyRef = useRef(null);

  const sortProducts = (arr) => {
    const a = Array.isArray(arr) ? arr : [];
    return [...a].sort((x, y) => {
      const xp = Number(x?.puffs ?? -1);
      const yp = Number(y?.puffs ?? -1);
      if (xp !== yp) return xp - yp;
      const xb = (x?.brand || '').localeCompare(y?.brand || '');
      if (xb !== 0) return xb;
      return (x?.model || '').localeCompare(y?.model || '');
    });
  };

  // Refresh manual (no bloquea la UI)
  const refresh = useCallback(async () => {
    if (!storeId) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const params = { store: storeId };
      if (kind) params.kind = kind;

      const data = await getProducts(params);
      const payload = Array.isArray(data) ? data : data?.items || [];
      const sorted = sortProducts(payload);

      setItems(sorted);
      setFromCache(false);
      saveCache(keyRef.current, sorted, ttlMs);
    } catch (e) {
      setError(e?.message || 'Error al cargar productos');
      // mantenemos lo que haya (caché)
    } finally {
      setIsRefreshing(false);
    }
  }, [storeId, kind, ttlMs]);

  // Carga inicial
  useEffect(() => {
    let mounted = true;

    if (!storeId) {
      setItems([]);
      setLoad(false);
      setError(null);
      setFromCache(false);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoad(true);
      setError(null);

      const kindSafe = kind || '__all__';
      const key = cacheKeyForProducts(storeId, version, kindSafe);
      keyRef.current = key;

      const cached = readCache(key);
      if (cached && Array.isArray(cached)) {
        if (!mounted) return;
        setItems(cached);
        setFromCache(true);
        setLoad(false); // hay caché → no llamamos a DB
        return;
      }

      // Sin caché → llamada inicial a DB (bloqueante)
      try {
        const params = { store: storeId };
        if (kind) params.kind = kind;

        const data = await getProducts(params);
        const payload = Array.isArray(data) ? data : data?.items || [];
        const sorted = sortProducts(payload);

        if (!mounted) return;
        setItems(sorted);
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
  }, [storeId, kind, version, ttlMs]);

  return { items, loading, error, fromCache, isRefreshing, refresh };
}
