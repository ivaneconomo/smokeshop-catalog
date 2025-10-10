// src/hooks/useStoreProducts.js
import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import { cacheKeyForProducts, readCache, saveCache } from '../utils/cache';

/**
 * Hook para traer productos por tienda + kind, con caché en localStorage.
 * - Clave de caché: products:${storeId}:${kind||'__all__'}:${version}
 * - TTL por defecto: lo define saveCache si no pasas ttlMs
 */
export default function useStoreProducts({
  storeId,
  kind,
  version = 'v1',
  ttlMs, // opcional
} = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!storeId) {
      setItems([]);
      setLoad(false);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoad(true);
      setError(null);

      // 1) intenta cache (ahora incluye kind en la key)
      const kindSafe = kind || '__all__';
      const key = cacheKeyForProducts(storeId, version, kindSafe);
      const cached = readCache(key);

      if (cached && Array.isArray(cached)) {
        setItems(cached);
        setFromCache(true);
        setLoad(false);
      }

      // 2) si no hay caché válido, trae del backend
      if (!cached) {
        try {
          const params = { store: storeId };
          if (kind) params.kind = kind;

          const data = await getProducts(params);
          const arr = Array.isArray(data) ? data : data?.items || [];

          // orden defensivo
          const sorted = [...arr].sort((a, b) => {
            const ap = Number(a?.puffs ?? -1);
            const bp = Number(b?.puffs ?? -1);
            if (ap !== bp) return ap - bp;
            const ab = (a?.brand || '').localeCompare(b?.brand || '');
            if (ab !== 0) return ab;
            return (a?.model || '').localeCompare(b?.model || '');
          });

          if (!mounted) return;
          setItems(sorted);
          setFromCache(false);
          saveCache(key, sorted, ttlMs);
        } catch (e) {
          if (!mounted) return;
          setError(e?.message || 'Error al cargar productos');
          if (!cached) setItems([]); // si no había caché, deja vacío
        } finally {
          if (mounted) setLoad(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [storeId, kind, version, ttlMs]);

  return { items, loading, error, fromCache };
}
