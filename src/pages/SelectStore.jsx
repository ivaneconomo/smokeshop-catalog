import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STORES = [
  { id: 'store_6', label: 'Tienda 6', img: '/images/logo_kings.png' },
  { id: 'store_22', label: 'Tienda 22', img: '/images/logo_souvenir.png' },
  { id: 'store_28', label: 'Tienda 28', img: '/images/logo_exotic.png' },
];

export default function SelectStore() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [store, setStore] = useState(
    () => localStorage.getItem('activeStore') || ''
  );

  useEffect(() => {
    const qs = new URLSearchParams(search);
    const s = qs.get('store');
    if (s) setStore(s);
  }, [search]);

  const confirmSelection = (id) => {
    localStorage.setItem('activeStore', id);
    navigate(`/products?store=${id}`);
  };

  return (
    <section className='mx-auto px-4 sm:px-8 lg:px-10 text-center min-h-[100svh] flex flex-col justify-center gap-12 sm:gap-16'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl sm:text-5xl font-bold'>SmokeShop · Catálogo</h1>
        <h2 className='text-lg sm:text-xl'>Selecciona una tienda</h2>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 justify-items-center mx-auto max-w-4xl'>
        {STORES.map((s) => (
          <div key={s.id} className='relative flex flex-col items-center'>
            <div
              onClick={() => setStore(s.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStore(s.id);
                }
              }}
              role='button'
              tabIndex={0}
              className={`cursor-pointer select-none touch-manipulation transition-transform duration-200
                ${
                  store === s.id
                    ? 'scale-105 drop-shadow-[0_0_35px_rgba(251,191,36,0.4)]'
                    : 'opacity-90 hover:opacity-100 grayscale-75 hover:grayscale-0'
                }
              `}
            >
              <img
                src={s.img}
                alt={s.label}
                className='
                  w-56 max-w-full sm:w-64 md:w-72
                  max-h-56 sm:max-h-64 md:max-h-72
                  object-contain rounded-xl
                '
                draggable={false}
                loading='eager'
              />

              {store === s.id ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmSelection(s.id);
                  }}
                  className='bg-emerald-500 text-white text-sm sm:text-base py-1.5 px-4 rounded-full shadow-md mt-3 hover:bg-emerald-600 transition-colors duration-150 font-medium animate-fadeIn'
                >
                  Confirmar
                </button>
              ) : (
                <p className='py-2 text-base sm:text-lg font-medium'>
                  {s.label}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
