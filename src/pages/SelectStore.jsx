import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCatalogConfig } from '../hooks/useCatalogConfig';

export default function SelectStore() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { stores, loading } = useCatalogConfig();

  // Inicializa con la tienda guardada para que el logo aparezca seleccionado al volver
  const [store, setStore] = useState(
    () => localStorage.getItem('activeStore') || '',
  );

  // Permite llegar con ?store=X desde un link externo
  useEffect(() => {
    const qs = new URLSearchParams(search);
    const s = qs.get('store');
    if (s) setStore(s);
  }, [search]);

  const confirmSelection = (id) => {
    localStorage.setItem('activeStore', id);
    navigate(`/categories?store=${id}`);
  };

  return (
    <section className='min-h-dvh flex flex-col py-12 gap-8 justify-center items-center md:gap-16'>
      <div className='text-center space-y-4'>
        <h1 className='text-3xl sm:text-5xl font-bold'>SmokeShop · Catálogo</h1>
        <h2 className='text-lg sm:text-xl dark:text-slate-50/70 text-slate-900/70'>
          Selecciona una tienda
        </h2>
      </div>

      {loading ? (
        <p className='text-slate-500'>Cargando tiendas…</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-4'>
          {stores.map((s) => (
            <div
              key={s.id}
              onClick={() => setStore(s.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStore(s.id);
                }
              }}
              role='button'
              tabIndex={0}
              className={`cursor-pointer select-none touch-manipulation transition-transform duration-200 flex flex-col items-center
                ${
                  store === s.id
                    ? 'scale-105 drop-shadow-[0_0_35px_rgba(251,191,36,0.4)]'
                    : 'opacity-90 hover:opacity-100 grayscale-75 hover:grayscale-0'
                }
              `}
            >
              <img
                src={s.logo}
                alt={s.name}
                className='max-w-38 md:max-w-32 lg:max-w-42 mx-auto'
                draggable={false}
                loading='eager'
              />

              {store === s.id ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmSelection(s.id);
                  }}
                  className='bg-emerald-500 text-white text-sm sm:text-base py-1.5 px-4 rounded-full shadow-md mt-2 md:mt-4 hover:bg-emerald-600 transition-colors duration-150 font-medium animate-fadeIn'
                >
                  Confirmar
                </button>
              ) : (
                <p className='py-1.5 px-4 mt-2 md:mt-4 text-base sm:text-lg font-medium text-center'>
                  {s.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
