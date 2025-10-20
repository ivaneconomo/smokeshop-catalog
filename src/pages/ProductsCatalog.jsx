// src/pages/ProductsCatalog.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../components/Card';
import ProductModal from '../components/ProductModal';
import { LoaderSpinner } from '../components/LoaderSpinner';
import useStoreProducts from '../hooks/useStoreProducts';
import RefreshButton from '../components/RefreshButton';

export default function ProductsCatalog() {
  const [openItem, setOpenItem] = useState(null);
  const closeBtnRef = useRef(null);

  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const kind = qs.get('kind');
  const store = qs.get('store') || localStorage.getItem('activeStore'); // viene de SelectStore

  const { items, loading, error, fromCache, isRefreshing, refresh } =
    useStoreProducts({
      storeId: store,
      kind,
      version: 'v1',
      ttlMs: 12 * 60 * 60 * 1000, // 12h
    });

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

  // Regla EXACTA:
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

  const visibleItems = items.filter(
    (x) => x?.available === true && hasFlavorAvailableInStore(x, store)
  );

  // Spinner bloqueante solo si no hay nada aún (primera carga sin caché)
  const showBlockingSpinner = loading && visibleItems.length === 0;

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
                  onPreview={() => setOpenItem(item)}
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
        />
      )}
    </section>
  );
}
