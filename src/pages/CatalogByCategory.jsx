import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import ProductModal from '../components/ProductModal';
import { LoaderSpinner } from '../components/LoaderSpinner';
import RefreshButton from '../components/RefreshButton';
import useStoreProducts from '../hooks/useStoreProducts';
import { cacheKeyForProducts, saveCache } from '../utils/cache';
import { normalize } from '../utils/search';
import { isFlavorAvailable, isProductAvailable } from '../utils/products';
import {
  ALL_KINDS,
  getProductKind,
  matchesProductKind,
} from '../utils/productKinds';
import { getKindVisibility, getSubcategories } from '../services/api';

const VERSION = 'v4';
const TTL_MS = 12 * 60 * 60 * 1000;

export default function CatalogByCategory() {
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [openItem, setOpenItem] = useState(null);
  const [hiddenKinds, setHiddenKinds] = useState([]);
  const [emojiMap, setEmojiMap] = useState({});
  const closeBtnRef = useRef(null);

  useEffect(() => {
    getKindVisibility()
      .then((data) => setHiddenKinds(data.hidden_kinds ?? []))
      .catch(() => {});
    getSubcategories()
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
  const kindSafe = rawKind || ALL_KINDS;
  const store = qs.get('store') || localStorage.getItem('activeStore');

  useEffect(() => {
    if (rawKind) {
      localStorage.setItem('lastKind', rawKind);
    }
  }, [rawKind]);

  useEffect(() => {
    const saved = localStorage.getItem('lastKind');
    if (!qs.get('kind') && saved) {
      const nextQs = new URLSearchParams(search);
      nextQs.set('kind', saved);
      if (store) nextQs.set('store', store);
      navigate(`/categories?${nextQs.toString()}`, { replace: true });
    }
  // Solo al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { items, loading, error, fromCache, isRefreshing, refresh } =
    useStoreProducts({
      storeId: store,
      version: VERSION,
      ttlMs: TTL_MS,
    });

  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!openItem) return undefined;

    const onKey = (event) => event.key === 'Escape' && setOpenItem(null);
    const previousOverflow = document.body.style.overflow;

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openItem]);

  const baseVisible = useMemo(() => {
    const selectedItems = localItems.filter(
      (item) => item.catalog_visible !== false && matchesProductKind(item, rawKind),
    );

    if (!showOnlyAvailable) return selectedItems;

    return selectedItems.filter((item) => isProductAvailable(item, store));
  }, [localItems, rawKind, showOnlyAvailable, store]);

  const kinds = useMemo(() => {
    const counts = new Map();

    localItems.forEach((item) => {
      const kind = getProductKind(item);
      counts.set(kind, (counts.get(kind) || 0) + 1);
    });

    return [...counts.entries()]
      .filter(([name]) => !hiddenKinds.includes(name))
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [localItems, hiddenKinds]);

  const queryTokens = useMemo(() => {
    const normalizedQuery = normalize(debouncedQuery);
    return normalizedQuery ? normalizedQuery.split(' ').filter(Boolean) : [];
  }, [debouncedQuery]);

  const visibleItems = useMemo(() => {
    if (queryTokens.length === 0) return baseVisible;

    return baseVisible.filter((product) => {
      const productText = normalize(
        [
          product.brand,
          product.model,
          product.puffs,
          product.grams,
          product.dosage_mg,
          getProductKind(product),
        ].join(' '),
      );

      const variants = [...(product.flavors ?? []), ...(product.strains ?? [])];
      const variantMatch = variants.some((variant) => {
        const isAvailable = isFlavorAvailable(variant, store);
        if (showOnlyAvailable && !isAvailable) return false;
        return queryTokens.every((token) =>
          normalize(variant.name).includes(token),
        );
      });

      return (
        queryTokens.every((token) => productText.includes(token)) ||
        variantMatch
      );
    });
  }, [baseVisible, queryTokens, showOnlyAvailable, store]);

  const persistSnapshot = useCallback(
    (nextItems) => {
      try {
        const key = cacheKeyForProducts(store, VERSION, ALL_KINDS);
        saveCache(key, nextItems, TTL_MS);
      } catch {
        /* noop */
      }
    },
    [store],
  );

  const onAvailabilityChange = useCallback(
    ({ productId, flavorId, storeId, available }) => {
      const nextItems = localItems.map((product) => {
        if (String(product._id) !== String(productId)) return product;

        return {
          ...product,
          flavors: (product.flavors || []).map((flavor) => {
            if (String(flavor._id) !== String(flavorId)) return flavor;

            const previousStore = flavor?.available_location?.[storeId] || {
              available: false,
              quantity: 0,
            };

            return {
              ...flavor,
              available_location: {
                ...(flavor.available_location || {}),
                [storeId]: { ...previousStore, available },
              },
            };
          }),
        };
      });

      setLocalItems(nextItems);

      setOpenItem((previousOpen) => {
        if (!previousOpen || String(previousOpen._id) !== String(productId)) {
          return previousOpen;
        }

        return {
          ...previousOpen,
          flavors: (previousOpen.flavors || []).map((flavor) =>
            String(flavor._id) === String(flavorId)
              ? {
                  ...flavor,
                  available_location: {
                    ...(flavor.available_location || {}),
                    [storeId]: {
                      ...(flavor.available_location?.[storeId] || {
                        quantity: 0,
                      }),
                      available,
                    },
                  },
                }
              : flavor,
          ),
        };
      });

      persistSnapshot(nextItems);
    },
    [localItems, persistSnapshot],
  );

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

  const handlePreview = useCallback(
    (id) => {
      const fresh = localItems.find(
        (product) => String(product._id) === String(id),
      );
      setOpenItem(fresh || null);
    },
    [localItems],
  );

  const showBlockingSpinner = loading && visibleItems.length === 0;
  const totalVisibleLabel =
    kindSafe === ALL_KINDS
      ? 'Todos los tipos'
      : getProductKind({ kind: rawKind });

  return (
    <section className='pb-12'>
      <div className='mt-4 mb-6 flex flex-col gap-3'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <form className='grow' onSubmit={(event) => event.preventDefault()}>
            <label htmlFor='kind-search' className='sr-only'>
              Buscar
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 inset-s-0 flex items-center ps-3 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-500 dark:text-gray-400'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 20 20'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z'
                  />
                </svg>
              </div>
              <input
                type='search'
                id='kind-search'
                className='block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Buscar producto o sabor'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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

            <RefreshButton
              onRefresh={refresh}
              isRefreshing={isRefreshing}
              variant='primary'
            />
          </div>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              {totalVisibleLabel}
            </h2>
            <p className='text-sm text-slate-500'>
              {visibleItems.length} productos para mostrar
            </p>
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

      {error && !showBlockingSpinner && (
        <p className='text-red-600 my-8'>{error}</p>
      )}

      {rawKind && !showBlockingSpinner && !error && (
        <>
          {visibleItems.length === 0 ? (
            <p className='text-slate-500 my-8'>
              No hay productos para mostrar.
            </p>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 w-full items-start'>
              {visibleItems.map((item) => (
                <Card
                  key={item._id || item.client_id}
                  item={item}
                  onPreview={() => handlePreview(item._id || item.client_id)}
                  activeStore={store}
                  emojiMap={emojiMap}
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
