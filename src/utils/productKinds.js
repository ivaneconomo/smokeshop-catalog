// Sentinel que indica "sin filtro de tipo"; evita usar null/undefined como señal
export const ALL_KINDS = '__all__';
export const UNKNOWN_KIND = 'Sin tipo';

export const canonicalKind = (kind) => {
  const value = String(kind || '').trim();
  if (!value || value === ALL_KINDS) return ALL_KINDS;
  return value;
};

// Soporta tanto 'kind' (nuevo schema) como 'type' (legacy) para no romper datos viejos
export const getProductKind = (item) =>
  canonicalKind(item?.kind || item?.type || UNKNOWN_KIND);

export const matchesProductKind = (item, kind) => {
  const selectedKind = canonicalKind(kind);
  if (selectedKind === ALL_KINDS) return true;

  // Comparación case-insensitive para tolerar inconsistencias de capitalización en DB
  return getProductKind(item).toLowerCase() === selectedKind.toLowerCase();
};
