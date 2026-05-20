import { useEffect, useMemo, useState } from 'react';
import { normalize } from '../utils/search';
import { isFlavorAvailable } from '../utils/products';

/**
 * Manages search query with debounce and applies text filtering on top of
 * a pre-filtered item list. Each catalog page computes its own baseItems
 * (applying availability/kind filters) and passes them here for text search.
 */
export function useCatalogFilters({ baseItems, store, showOnlyAvailable }) {
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

  const visibleItems = useMemo(() => {
    if (queryTokens.length === 0) return baseItems;

    return baseItems.filter((p) => {
      const productText = normalize(
        [p.brand, p.model, p.puffs, p.grams, p.dosage_mg, p.kind].join(' '),
      );
      if (queryTokens.every((t) => productText.includes(t))) return true;

      return [...(p.flavors ?? []), ...(p.strains ?? [])].some((variant) => {
        if (showOnlyAvailable && !isFlavorAvailable(variant, store)) return false;
        return queryTokens.every((t) => normalize(variant.name).includes(t));
      });
    });
  }, [baseItems, queryTokens, showOnlyAvailable, store]);

  return { query, setQuery, visibleItems };
}
