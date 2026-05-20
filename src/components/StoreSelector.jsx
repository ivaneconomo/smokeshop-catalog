import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCatalogConfig } from '../hooks/useCatalogConfig';

export default function StoreSelector() {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const { stores } = useCatalogConfig();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const allOption = { id: 'all', name: 'Todas las tiendas' };
  const options = [allOption, ...stores];

  // Prioridad: QP > localStorage > primer opción disponible
  const initial =
    qs.get('store') ||
    localStorage.getItem('activeStore') ||
    options[0]?.id ||
    'all';

  const [value, setValue] = useState(initial);

  // Sincroniza URL y localStorage al cambiar tienda; replace evita entradas extra en el historial
  // Se omite navigate/pathname de deps a propósito: solo debe correr cuando cambia value
  useEffect(() => {
    const next = new URLSearchParams(search);
    if (value && value !== 'all') next.set('store', value);
    else next.delete('store');
    localStorage.setItem('activeStore', value);
    navigate(`${pathname}?${next.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className='w-full max-w-3xl mb-4'>
      <label className='block text-sm text-slate-600 mb-1'>Tienda</label>
      <select
        className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
