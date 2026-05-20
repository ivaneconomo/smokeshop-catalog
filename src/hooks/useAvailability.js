import { useCallback, useEffect, useState } from 'react';

/**
 * Manages local product list state and the optimistic availability update callback.
 * Both catalog pages share identical logic for reflecting flavor availability changes
 * without requiring a full refetch.
 */
export function useAvailability({ items, setOpenItem, persistSnapshot }) {
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const onAvailabilityChange = useCallback(
    ({ productId, flavorId, storeId, available }) => {
      const nextItems = localItems.map((p) => {
        if (String(p._id) !== String(productId)) return p;
        return {
          ...p,
          flavors: (p.flavors || []).map((f) => {
            if (String(f._id) !== String(flavorId)) return f;
            const prevStore = f?.available_location?.[storeId] || { available: false, quantity: 0 };
            return {
              ...f,
              available_location: { ...(f.available_location || {}), [storeId]: { ...prevStore, available } },
            };
          }),
        };
      });

      setLocalItems(nextItems);

      setOpenItem((prevOpen) => {
        if (!prevOpen || String(prevOpen._id) !== String(productId)) return prevOpen;
        return {
          ...prevOpen,
          flavors: (prevOpen.flavors || []).map((f) =>
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
              : f,
          ),
        };
      });

      persistSnapshot(nextItems);
    },
    [localItems, setOpenItem, persistSnapshot],
  );

  const handlePreview = useCallback(
    (id) => {
      const fresh = localItems.find((p) => String(p._id) === String(id));
      setOpenItem(fresh || null);
    },
    [localItems, setOpenItem],
  );

  return { localItems, onAvailabilityChange, handlePreview };
}
