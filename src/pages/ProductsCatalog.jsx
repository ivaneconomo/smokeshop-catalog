// src/pages/ProductsCatalog.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import ProductModal from '../components/ProductModal';
import { LoaderSpinner } from '../components/LoaderSpinner';
import useStoreProducts from '../hooks/useStoreProducts';
import RefreshButton from '../components/RefreshButton';
import { cacheKeyForProducts, saveCache } from '../utils/cache';

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

  // Render desde localItems (refleja cambios del modal)
  const visibleItems = useMemo(
    () =>
      localItems.filter(
        (x) => x?.available === true && hasFlavorAvailableInStore(x, store)
      ),
    [localItems, store]
  );

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
      <div className='text-slate-500 mt-8 mb-2 flex items-center justify-between text-xs sm:text-base'>
        <div className='flex items-center gap-2'>
          <span>Tienda activa: </span>
          <strong className='text-emerald-500'>{store || '—'}</strong>
          {fromCache && <span>desde caché</span>}
        </div>

        <RefreshButton
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          variant='primary' // o "outline" si quieres el estilo gris
        />
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
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 justify-items-center w-full'>
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
