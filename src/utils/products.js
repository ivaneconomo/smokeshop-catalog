// utils/products.js

// Paleta mínima para los badges de sabores disponibles
export const flavorColorMap = {
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-red-300',
    darkBorder: 'dark:border-red-400',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-orange-300',
    darkBorder: 'dark:border-orange-400',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-yellow-300',
    darkBorder: 'dark:border-yellow-400',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-green-300',
    darkBorder: 'dark:border-green-400',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-cyan-300',
    darkBorder: 'dark:border-cyan-400',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-blue-300',
    darkBorder: 'dark:border-blue-400',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-purple-300',
    darkBorder: 'dark:border-purple-400',
  },
  fuchsia: {
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-800',
    border: 'border-fuchsia-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-fuchsia-300',
    darkBorder: 'dark:border-fuchsia-400',
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-pink-300',
    darkBorder: 'dark:border-pink-400',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-slate-300',
    darkBorder: 'dark:border-slate-400',
  },
  neutral: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-800',
    border: 'border-neutral-300',
    darkBg: 'dark:bg-slate-700',
    darkText: 'dark:text-neutral-300',
    darkBorder: 'dark:border-neutral-400',
  },
};

// Devuelve true/false para disponibilidad del sabor según tienda activa
export function isFlavorAvailable(flavor, activeStore) {
  // Si no hay metadatos por tienda, considera no disponible a menos que quieras cambiar esta regla.
  const av = flavor?.available_location || {};
  if (!activeStore || activeStore === 'all') {
    // 'all' => disponible si alguna tienda lo tiene available=true
    return Object.values(av).some((s) => s?.available === true);
  }
  const storeMeta = av[activeStore];
  return storeMeta?.available === true; // puedes agregar && storeMeta.quantity > 0 si quieres condicionar a stock
}

// Devuelve todos los sabores con su status calculado
export function getFlavorStatus(item, activeStore) {
  const list = Array.isArray(item?.flavors) ? item.flavors : [];
  return list.map((f) => ({
    name: f.name,
    color: f.color,
    isAvailable: isFlavorAvailable(f, activeStore),
  }));
}
