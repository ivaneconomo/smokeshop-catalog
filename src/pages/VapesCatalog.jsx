import { useEffect, useRef, useState } from 'react';
import VAPES from '../data/vapes';
import Card from '../components/Card';
import { SaleStamp } from '../components/SaleStamp';
import { BestSellerStamp } from '../components/BestSellerStamp';

export default function VapesCatalog() {
  const items = [...VAPES].sort((a, b) => a.id - b.id);
  const [openItem, setOpenItem] = useState(null);
  const closeBtnRef = useRef(null);

  // Cerrar con ESC y bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!openItem) return;

    const onKey = (e) => e.key === 'Escape' && setOpenItem(null);
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Enfocar el botón de cerrar para accesibilidad
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openItem]);

  return (
    <section className='mx-auto max-w-7xl px-4 py-6 flex flex-col items-center'>
      <h1 className='mb-6 text-2xl font-bold text-center'>Catálogo · Vapes</h1>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 justify-items-center w-full'>
        {items.map(
          (item) =>
            item.available && (
              <Card
                key={`${item.brand}-${item.model}-${item.id}`}
                item={item}
                onPreview={() => setOpenItem(item)}
              />
            )
        )}
      </div>

      {/* Modal */}
      {openItem && (
        <div
          className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'
          onClick={() => setOpenItem(null)}
          aria-hidden='true'
        >
          <div
            className='relative max-w-4xl w-full flex justify-center'
            role='dialog'
            aria-modal='true'
            aria-label={`${openItem.brand} ${openItem.model}`}
            onClick={(e) => e.stopPropagation()} // evita cerrar al click dentro
          >
            <div className='relative inline-block'>
              <img
                src={openItem.image || openItem.img || openItem.src}
                alt={`${openItem.brand} ${openItem.model}`}
                className='w-full max-w-md max-h-[80vh] rounded-xl shadow-2xl mx-auto'
                loading='eager'
              />
              {openItem.sale && (
                <SaleStamp className='w-36 h-36 top-0 right-6' />
              )}
              {openItem.featured && (
                <BestSellerStamp className='w-36 h-36 top-0 right-6' />
              )}
              <button
                ref={closeBtnRef}
                onClick={() => setOpenItem(null)}
                className='absolute top-2 right-2 rounded-full bg-zinc-200 hover:bg-white shadow-sm p-2 text-sm font-semibold dark:text-[#18181b]'
              >
                ❌
              </button>
              <div className='mt-3 text-center text-white'>
                <div className='text-lg font-semibold'>
                  {openItem.brand} {openItem.model}
                </div>
                {openItem.puffs ? (
                  <div className='text-white/80'>{openItem.puffs} puffs</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
