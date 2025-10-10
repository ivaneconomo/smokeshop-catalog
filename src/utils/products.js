// src/utils/products.js
export function getVisibleFlavors(item, activeStore = 'all') {
  const all = Array.isArray(item?.flavors) ? item.flavors : [];
  if (activeStore === 'all') return all;

  // Solo sabores con disponible = true en la tienda activa
  return all.filter((f) => {
    const loc = f?.available_location?.[activeStore];
    return loc?.available === true;
  });
}
