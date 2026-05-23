import { useEffect, useState } from 'react';
import { getStores, getProductTypes } from '../services/api';

const DEFAULT_STORES = [];
const DEFAULT_PRODUCT_TYPES = [];
const DEFAULT_STRAINS = ['Sativa', 'Indica', 'Hybrid'];
const LS_KEY = 'catalog_config';

function readConfigLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConfigLS(config) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(config));
  } catch {}
}

// Cache a nivel de módulo: inicializado desde localStorage para carga instantánea al refrescar
let cache = readConfigLS();

export function clearConfigCache() {
  cache = null;
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

export function useCatalogConfig() {
  const [config, setConfig] = useState(cache ?? null);
  // Si ya hay datos (localStorage o sesión previa), no bloquea con spinner
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    // Si el cache de módulo ya está lleno (misma sesión JS), no repetir el fetch
    if (cache) {
      setLoading(false);
      return;
    }

    Promise.all([getStores(), getProductTypes()])
      .then(([storesData, typesData]) => {
        const result = {
          stores: storesData.stores ?? DEFAULT_STORES,
          productTypes: typesData.product_types ?? DEFAULT_PRODUCT_TYPES,
          strains: typesData.strains ?? DEFAULT_STRAINS,
        };
        cache = result;
        saveConfigLS(result);
        setConfig(result);
      })
      .catch(() => {
        // Si hay datos en localStorage ya cargados, ignorar el error silenciosamente
        if (cache === null) {
          setConfig({
            stores: DEFAULT_STORES,
            productTypes: DEFAULT_PRODUCT_TYPES,
            strains: DEFAULT_STRAINS,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stores = config?.stores ?? DEFAULT_STORES;
  const productTypes = config?.productTypes ?? DEFAULT_PRODUCT_TYPES;
  const strains = config?.strains ?? DEFAULT_STRAINS;

  const storeById = Object.fromEntries(stores.map((s) => [s.id, s]));
  const kindByValue = Object.fromEntries(productTypes.map((t) => [t.value, t]));
  const componentLabelMap = Object.fromEntries(
    productTypes.flatMap((t) => t.components.map((c) => [c.key, c.label]))
  );

  return {
    loading,
    stores,
    storeById,
    productTypes,
    kindByValue,
    strains,
    componentLabelMap,
  };
}
