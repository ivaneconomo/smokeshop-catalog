import { useEffect, useState } from 'react';
import { getStores, getProductTypes } from '../services/api';

const DEFAULT_STORES = [];
const DEFAULT_PRODUCT_TYPES = [];
const DEFAULT_STRAINS = ['Sativa', 'Indica', 'Hybrid'];

// Cache a nivel de módulo: se comparte entre todas las instancias del hook
// en la misma sesión, evitando requests duplicados al montar múltiples componentes.
let cache = null;

export function clearConfigCache() {
  cache = null;
}

export function useCatalogConfig() {
  // Si ya hay cache, arranca con loading=false para no mostrar spinners innecesarios
  const [config, setConfig] = useState(cache ?? null);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    // Evita volver a fetchear si otro componente ya llenó el cache
    if (cache) return;

    Promise.all([getStores(), getProductTypes()])
      .then(([storesData, typesData]) => {
        const result = {
          stores: storesData.stores ?? DEFAULT_STORES,
          productTypes: typesData.product_types ?? DEFAULT_PRODUCT_TYPES,
          strains: typesData.strains ?? DEFAULT_STRAINS,
        };
        cache = result;
        setConfig(result);
      })
      .catch(() => {
        // Si el backend falla, devuelve valores vacíos para no romper la UI
        const fallback = {
          stores: DEFAULT_STORES,
          productTypes: DEFAULT_PRODUCT_TYPES,
          strains: DEFAULT_STRAINS,
        };
        setConfig(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  const stores = config?.stores ?? DEFAULT_STORES;
  const productTypes = config?.productTypes ?? DEFAULT_PRODUCT_TYPES;
  const strains = config?.strains ?? DEFAULT_STRAINS;

  // { store_6: { id, name, logo }, ... } — para lookup directo sin .find()
  const storeById = Object.fromEntries(stores.map((s) => [s.id, s]));

  // { Nicotine: { value, label, fields, components }, ... } — para lookup por kind
  const kindByValue = Object.fromEntries(productTypes.map((t) => [t.value, t]));

  // Mapa global key→label uniendo los componentes de todos los kinds.
  // Permite que Card y ProductModal muestren el label sin conocer el kind del producto.
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
