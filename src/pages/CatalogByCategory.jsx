import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import { LoaderSpinner } from '../components/LoaderSpinner';
import RefreshButton from '../components/RefreshButton';
import CatalogGrid from '../components/catalog/CatalogGrid';
import CatalogEmptyState from '../components/catalog/CatalogEmptyState';
import useStoreProducts from '../hooks/useStoreProducts';
import { useProductModal } from '../hooks/useProductModal';
import { useAvailability } from '../hooks/useAvailability';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { cacheKeyForProducts, saveCache } from '../utils/cache';
import { isProductAvailable } from '../utils/products';
import { ALL_KINDS, getProductKind, matchesProductKind } from '../utils/productKinds';
import { getKindVisibility, getEffects } from '../services/api';
import { CACHE_VERSION, CACHE_TTL_MS } from '../utils/constants';

export default function CatalogByCategory() {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [hiddenKindsByStore, setHiddenKindsByStore] = useState({});
  const [emojiMap, setEmojiMap] = useState({});

  useEffect(() => {
    getKindVisibility()
      .then((data) => setHiddenKindsByStore(data.hidden_kinds_by_store ?? {}))
      .catch(() => {});
    getEffects()
      .then((data) => {
        const map = {};
        (data.subcategories ?? []).forEach(({ name, emoji }) => { map[name] = emoji; });
        setEmojiMap(map);
      })
      .catch(() => {});
  }, []);

  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const rawKind = qs.get('kind');
  const store = qs.get('store') || localStorage.getItem('activeStore');

  useEffect(() => {
    if (rawKind) localStorage.setItem('lastKind', rawKind);
  }, [rawKind]);

  // Redirect to last visited kind on mount if none is set
  useEffect(() => {
    const saved = localStorage.getItem('lastKind');
    if (!qs.get('kind') && saved) {
      const nextQs = new URLSearchParams(search);
      nextQs.set('kind', saved);
      if (store) nextQs.set('store', store);
      navigate(`/categories?${nextQs.toString()}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { items, loading, error, fromCache, isRefreshing, refresh } = useStoreProducts({
    storeId: store,
    version: CACHE_VERSION,
    ttlMs: CACHE_TTL_MS,
  });

  const { openItem, setOpenItem, closeBtnRef } = useProductModal();

  const persistSnapshot = useCallback(
    (nextItems) => {
      try {
        saveCache(cacheKeyForProducts(store, CACHE_VERSION, ALL_KINDS), nextItems, CACHE_TTL_MS);
      } catch {
        /* noop */
      }
    },
    [store],
  );

  const { localItems, onAvailabilityChange, handlePreview } = useAvailability({
    items,
    setOpenItem,
    persistSnapshot,
  });

  const baseVisible = useMemo(() => {
    const filtered = localItems.filter(
      (item) => item.catalog_visible !== false && matchesProductKind(item, rawKind),
    );
    if (!showOnlyAvailable) return filtered;
    return filtered.filter((item) => isProductAvailable(item, store));
  }, [localItems, rawKind, showOnlyAvailable, store]);

  const kinds = useMemo(() => {
    const counts = new Map();
    localItems.forEach((item) => {
      const kind = getProductKind(item);
      counts.set(kind, (counts.get(kind) || 0) + 1);
    });
    const hiddenKinds = hiddenKindsByStore[store] ?? [];
    return [...counts.entries()]
      .filter(([name]) => !hiddenKinds.includes(name))
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [localItems, hiddenKindsByStore, store]);

  const { query, setQuery, visibleItems } = useCatalogFilters({
    baseItems: baseVisible,
    store,
    showOnlyAvailable,
  });

  const handleKindChange = (kind) => {
    const nextQs = new URLSearchParams(search);
    if (kind === ALL_KINDS) {
      nextQs.delete('kind');
    } else {
      nextQs.set('kind', kind);
    }
    if (store) nextQs.set('store', store);
    navigate(`/categories?${nextQs.toString()}`);
  };

  const showBlockingSpinner = loading && visibleItems.length === 0;
  const totalVisibleLabel =
    !rawKind ? 'Todos los tipos' : getProductKind({ kind: rawKind });

  return (
    <section className='pb-12'>
      <div className='mt-4 mb-6 flex flex-col gap-3'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <form className='grow' onSubmit={(e) => e.preventDefault()}>
            <label htmlFor='kind-search' className='sr-only'>Buscar</label>
            <div className='relative'>
              <div className='absolute inset-y-0 inset-s-0 flex items-center ps-3 pointer-events-none'>
                <svg className='w-4 h-4 text-gray-500 dark:text-gray-400' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'>
                  <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z' />
                </svg>
              </div>
              <input
                type='search'
                id='kind-search'
                className='block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Buscar producto o sabor'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete='off'
              />
            </div>
          </form>

          <div className='text-slate-500 flex items-center justify-between gap-2 text-xs sm:text-sm'>
            <div className='flex gap-2'>
              <span>Tienda activa:</span>
              <strong className='text-emerald-500'>{store || '-'}</strong>
              {fromCache && <span>desde cache</span>}
            </div>
            <RefreshButton onRefresh={refresh} isRefreshing={isRefreshing} variant='primary' />
          </div>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              {totalVisibleLabel}
            </h2>
            <p className='text-sm text-slate-500'>{visibleItems.length} productos para mostrar</p>
          </div>
          <label className='flex items-center gap-2 text-xs sm:text-sm cursor-pointer text-slate-600 dark:text-slate-300'>
            <input
              type='checkbox'
              checked={showOnlyAvailable}
              onChange={() => setShowOnlyAvailable((prev) => !prev)}
            />
            Solo disponibles
          </label>
        </div>

        {kinds.length > 0 && (
          <div className='flex gap-2 overflow-x-auto pb-1'>
            {kinds.map((kind) => (
              <button
                key={kind.name}
                type='button'
                onClick={() => handleKindChange(kind.name)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  rawKind === kind.name
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {kind.name} ({kind.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {!rawKind && !loading && (
        <p className='text-slate-400 dark:text-slate-500 my-8 text-sm'>
          Seleccione una categoría para ver los productos.
        </p>
      )}

      {showBlockingSpinner && <LoaderSpinner />}
      {error && !showBlockingSpinner && <p className='text-red-600 my-8'>{error}</p>}

      {rawKind && !showBlockingSpinner && !error && (
        visibleItems.length === 0
          ? <CatalogEmptyState />
          : <CatalogGrid items={visibleItems} onPreview={handlePreview} activeStore={store} emojiMap={emojiMap} />
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
