export const ALL_KINDS = '__all__';
export const UNKNOWN_KIND = 'Sin tipo';

export const canonicalKind = (kind) => {
  const value = String(kind || '').trim();
  if (!value || value === ALL_KINDS) return ALL_KINDS;
  return value;
};

export const getProductKind = (item) =>
  canonicalKind(item?.kind || item?.type || UNKNOWN_KIND);

export const matchesProductKind = (item, kind) => {
  const selectedKind = canonicalKind(kind);
  if (selectedKind === ALL_KINDS) return true;

  return getProductKind(item).toLowerCase() === selectedKind.toLowerCase();
};
