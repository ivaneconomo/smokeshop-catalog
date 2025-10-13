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
    <section className='min-h-dvh flex flex-col gap-8 pt-8 md:px-8 justify-center items-center md:gap-16'>
      <div className='text-center'>
        <h1 className='text-3xl sm:text-5xl font-bold'>SmokeShop · Catálogo</h1>
        <h2 className='text-lg sm:text-xl text-white/90'>
          Selecciona una tienda
        </h2>
      </div>

      <div className='flex flex-col items-center text-center gap-4 md:flex-row'>
        {STORES.map((s) => (
          <div
            key={s.id} // 👈 esto evita el warning
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
              className='max-w-38 md:max-w-60'
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
              <p className='py-1.5 px-4 mt-2 md:mt-4 text-base sm:text-lg font-medium'>
                {s.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
