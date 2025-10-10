import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Puedes traer este listado del backend luego.
// Por ahora lo dejamos fijo para avanzar rápido.
const DEFAULT_STORES = [
  { id: 'all', label: 'Todas las tiendas' },
  { id: 'store_6', label: 'Tienda 6' },
  { id: 'store_22', label: 'Tienda 22' },
  { id: 'store_28', label: 'Tienda 28' },
];

export default function StoreSelector({ stores = DEFAULT_STORES }) {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const initial =
    qs.get('store') ||
    localStorage.getItem('activeStore') ||
    stores[0]?.id ||
    'all';

  const [value, setValue] = useState(initial);

  useEffect(() => {
    // sincroniza URL y localStorage cuando cambia value
    const next = new URLSearchParams(search);
    if (value && value !== 'all') next.set('store', value);
    else next.delete('store');

    localStorage.setItem('activeStore', value);
    navigate(`${pathname}?${next.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className='w-full max-w-screen-md mb-4'>
      <label className='block text-sm text-slate-600 mb-1'>Tienda</label>
      <select
        className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
