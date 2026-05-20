// Versión del esquema de caché. Cambiarla invalida todos los cachés existentes
// en localStorage, forzando un refetch. Útil al agregar/renombrar campos en el modelo.
export const CACHE_VERSION = 'v4';

// Tiempo de vida del caché de productos (12 horas)
export const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
