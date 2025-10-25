// src/components/FlavorSearch.jsx
import { useEffect, useState } from 'react';
import { normalize, tokenize } from '../utils/search';

export default function FlavorSearch({
  placeholder = 'Buscar sabores…',
  debounceMs = 180,
  defaultValue = '',
  onChangeText, // (text: string) => void
  onChangeTokens, // (tokens: string[]) => void
  autoFocus = false,
}) {
  const [q, setQ] = useState(defaultValue);
  const [debouncedQ, setDebouncedQ] = useState(defaultValue);

  // Debounce del texto
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), debounceMs);
    return () => clearTimeout(t);
  }, [q, debounceMs]);

  // Notifica cambios (texto y tokens normalizados)
  useEffect(() => {
    onChangeText?.(debouncedQ);
    const qn = normalize(debouncedQ);
    onChangeTokens?.(qn ? tokenize(qn) : []);
  }, [debouncedQ, onChangeText, onChangeTokens]);

  return (
    <input
      className='w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-800'
      placeholder={placeholder}
      value={q}
      onChange={(e) => setQ(e.target.value)}
      autoComplete='off'
      autoFocus={autoFocus}
    />
  );
}
