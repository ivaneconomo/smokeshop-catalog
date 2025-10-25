// src/pages/ProductsCatalog.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import ProductModal from '../components/ProductModal';
import { LoaderSpinner } from '../components/LoaderSpinner';
import useStoreProducts from '../hooks/useStoreProducts';
import RefreshButton from '../components/RefreshButton';
import { cacheKeyForProducts, saveCache } from '../utils/cache';
import { normalize } from '../utils/search'; // asegúrate de tener esta utilidad

const VERSION = 'v1';
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

export default function ProductsCatalog() {
  const [openItem, setOpenItem] = useState(null);
  const closeBtnRef = useRef(null);

  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const rawKind = qs.get('kind');
  const kindSafe = rawKind || '__all__';
  const store = qs.get('store') || localStorage.getItem('activeStore'); // viene de SelectStore

  const { items, loading, error, fromCache, isRefreshing, refresh } =
    useStoreProducts({
      storeId: store,
      kind: rawKind,
      version: VERSION,
      ttlMs: TTL_MS,
    });

  // ---------- Estado local para reflejar cambios sin refetch ----------
  const [localItems, setLocalItems] = useState([]);

  // Sincroniza localItems cuando cambia la fuente del hook
  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  // Modal ESC + scroll lock
  useEffect(() => {
    if (!openItem) return;
    const onKey = (e) => e.key === 'Escape' && setOpenItem(null);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openItem]);

  // visible ⇢ item.available === true
  //        && item.flavors is array with length > 0
  //        && some(flavor.available_location[store]?.available === true)
  const hasFlavorAvailableInStore = (item, storeId) => {
    if (!Array.isArray(item.flavors) || item.flavors.length === 0) return false;
    if (!storeId) return false; // sin tienda activa no mostramos
    return item.flavors.some(
      (f) => f?.available_location?.[storeId]?.available === true
    );
  };

  // ---------- BUSCADOR EN VIVO (sin sugerencias) ----------
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(t);
  }, [query]);

  const queryTokens = useMemo(() => {
    const qn = normalize(debouncedQuery);
    return qn ? qn.split(' ').filter(Boolean) : [];
  }, [debouncedQuery]);

  // Base: tus reglas actuales (producto disponible + al menos 1 flavor disponible en la tienda)
  const baseVisible = useMemo(
    () =>
      localItems.filter(
        (x) => x?.available === true && hasFlavorAvailableInStore(x, store)
      ),
    [localItems, store]
  );

  // Filtro por texto: si hay tokens, exige que el producto tenga algún flavor
  // disponible en la tienda activa cuyo nombre incluya TODOS los tokens.
  const visibleItems = useMemo(() => {
    if (queryTokens.length === 0) return baseVisible;

    return baseVisible.filter((p) =>
      (p.flavors ?? []).some((f) => {
        const available = !!f?.available_location?.[store]?.available;
        if (!available) return false;
        const nameNorm = normalize(f.name);
        return queryTokens.every((t) => nameNorm.includes(t));
      })
    );
  }, [baseVisible, queryTokens, store]);

  // Spinner bloqueante solo si no hay nada aún (primera carga sin caché)
  const showBlockingSpinner = loading && visibleItems.length === 0;

  // ---------- Persistencia (misma key y formato que el hook) ----------
  const persistSnapshot = useCallback(
    (nextItems) => {
      try {
        const key = cacheKeyForProducts(store, VERSION, kindSafe);
        saveCache(key, nextItems); // {data, exp} con TTL default
      } catch {
        /* noop */
      }
    },
    [store, kindSafe]
  );

  // ---------- Callback que el modal invoca tras el PATCH ----------
  const onAvailabilityChange = useCallback(
    ({ productId, flavorId, storeId, available }) => {
      // 1) Construye nextItems una sola vez
      const nextItems = localItems.map((p) => {
        if (String(p._id) !== String(productId)) return p;
        return {
          ...p,
          flavors: (p.flavors || []).map((f) => {
            if (String(f._id) !== String(flavorId)) return f;
            const prevStore = f?.available_location?.[storeId] || {
              available: false,
              quantity: 0,
            };
            return {
              ...f,
              available_location: {
                ...(f.available_location || {}),
                [storeId]: { ...prevStore, available },
              },
            };
          }),
        };
      });

      // 2) Aplica al estado visible
      setLocalItems(nextItems);

      // 3) Sincroniza el modal si corresponde (mientras está abierto)
      setOpenItem((prevOpen) => {
        if (!prevOpen || String(prevOpen._id) !== String(productId))
          return prevOpen;
        const nextFlavors = (prevOpen.flavors || []).map((f) =>
          String(f._id) === String(flavorId)
            ? {
                ...f,
                available_location: {
                  ...(f.available_location || {}),
                  [storeId]: {
                    ...(f.available_location?.[storeId] || { quantity: 0 }),
                    available,
                  },
                },
              }
            : f
        );
        return { ...prevOpen, flavors: nextFlavors };
      });

      // 4) Persistir en cache
      persistSnapshot(nextItems);
    },
    [localItems, persistSnapshot]
  );

  // ---------- Abrir modal siempre con el objeto más fresco ----------
  const handlePreview = useCallback(
    (id) => {
      const fresh = localItems.find((p) => String(p._id) === String(id));
      setOpenItem(fresh || null); // prioriza el snapshot más reciente
    },
    [localItems]
  );

  return (
    <section className='pb-4'>
      <div className='mt-4 mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        {/* Buscador en vivo */}
        <form class='grow'>
          <label
            for='default-search'
            class='mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white'
          >
            Search
          </label>
          <div class='relative'>
            <div class='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
              <svg
                class='w-4 h-4 text-gray-500 dark:text-gray-400'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 20 20'
              >
                <path
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                />
              </svg>
            </div>
            <input
              type='search'
              id='default-search'
              class='block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              placeholder='Buscar'
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete='off'
            />
          </div>
        </form>

        <div className='text-slate-500 flex items-center justify-between gap-2 text-xs sm:text-base'>
          <div className='flex gap-2'>
            <span>Tienda activa: </span>
            <strong className='text-emerald-500'>{store || '—'}</strong>
            {fromCache && <span>desde caché</span>}
          </div>

          <RefreshButton
            onRefresh={refresh}
            isRefreshing={isRefreshing}
            variant='primary'
          />
        </div>
      </div>

      {showBlockingSpinner && <LoaderSpinner />}

      {error && !showBlockingSpinner && (
        <p className='text-red-600 my-8'>🥲 {error}</p>
      )}

      {!showBlockingSpinner && !error && (
        <>
          {visibleItems.length === 0 ? (
            <p className='text-slate-500 my-8'>
              No hay productos para mostrar.
            </p>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 justify-items-center w-full min-h-screen auto-rows-max'>
              {visibleItems.map((item) => (
                <Card
                  key={item._id || item.client_id}
                  item={item}
                  onPreview={() => handlePreview(item._id || item.client_id)}
                  activeStore={store}
                />
              ))}
            </div>
          )}
        </>
      )}

      {openItem && (
        <ProductModal
          openItem={openItem}
          setOpenItem={setOpenItem}
          closeBtnRef={closeBtnRef}
          activeStore={store}
          onAvailabilityChange={onAvailabilityChange}
        />
      )}
    </section>
  );
}
