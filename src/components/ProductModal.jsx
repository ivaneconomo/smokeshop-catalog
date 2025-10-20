import { SaleStamp } from './SaleStamp';
import { BestSellerStamp } from './BestSellerStamp';
import FlavorBadge from './FlavorBadge';
import { getFlavorStatus } from '../utils/products';

const ProductModal = ({
  openItem,
  setOpenItem,
  closeBtnRef,
  activeStore = 'all',
}) => {
  const flavors = getFlavorStatus(openItem, activeStore);

  return (
    <div
      className='fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4'
      onClick={() => setOpenItem(null)}
      aria-hidden='true'
    >
      {/* Contenedor principal del modal */}
      <div
        className='
    relative
    w-[min(92vw,1100px)]
    h-[90vh]
    [@media(min-height:799px)]:h-[60vh]
    [@media(min-height:799)]:w-[100vh]
    max-h-[900px]
    overflow-hidden
    rounded-xl
    bg-slate-200 dark:bg-slate-800
    shadow-xl
    animate-fadeIn
    grid grid-cols-1 sm:grid-cols-6 gap-0 sm:gap-3
    p-4
  '
        role='dialog'
        aria-modal='true'
        aria-label={`${openItem.brand} ${openItem.model}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen y Stamps */}
        <div className='col-span-3 flex items-center justify-center h-full p-4 sm:p-5 overflow-hidden'>
          <img
            src={openItem.image || openItem.img || openItem.src}
            alt={`${openItem.brand} ${openItem.model}`}
            className='
              object-contain
              w-full
              max-w-[22rem]
              max-h-[85%]
              mx-auto
            '
            loading='eager'
            draggable={false}
          />

          {openItem.on_sale && (
            <SaleStamp className='absolute top-0 left-0 max-w-48 sm:max-w-28 md:max-w-60' />
          )}
          {openItem.on_featured && (
            <BestSellerStamp className='absolute top-0 left-0 max-w-48 sm:max-w-28 md:max-w-60' />
          )}
        </div>

        {/* Detalles del producto */}
        <div
          className='
            col-span-3
            bg-slate-50 dark:bg-slate-700
            text-slate-900 dark:text-white
            rounded-xl
            p-4 sm:p-5
            overflow-y-auto
            h-[95%]
            self-center
          '
        >
          <header className='space-y-1'>
            <p className='font-semibold text-2xl leading-tight'>
              {openItem.brand} {openItem.model}
            </p>
            {openItem.puffs ? (
              <span className='text-slate-600 dark:text-slate-200 text-xl'>
                {openItem.puffs} puffs
              </span>
            ) : null}
          </header>

          {/* Sabores */}
          {flavors.length > 0 && (
            <section className='mt-6 space-y-2'>
              <p className='text-lg text-slate-700 dark:text-slate-200'>
                Sabores
              </p>

              <div
                className='
                  grid grid-cols-1 sm:grid-cols-2 gap-1.5
                  overflow-auto
                  pr-1
                  h-[calc(100%-2rem)]
                '
              >
                {flavors
                  .slice()
                  .sort((a, b) =>
                    a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1
                  )
                  .map((f) => (
                    <FlavorBadge
                      key={f.name}
                      name={f.name}
                      color={f.color}
                      isAvailable={f.isAvailable}
                      title={
                        f.isAvailable
                          ? 'Disponible en esta tienda'
                          : 'No disponible en esta tienda'
                      }
                    />
                  ))}
              </div>
            </section>
          )}
        </div>

        {/* Botón de cerrar */}
        <button
          ref={closeBtnRef}
          onClick={() => setOpenItem(null)}
          className='
            absolute top-2 right-2
            rounded-full
            bg-slate-200 dark:bg-slate-800
            border border-slate-300/60 dark:border-slate-900/40
            p-3
            hover:text-white hover:bg-red-500
            transition-colors
          '
        >
          <span className='sr-only'>Close</span>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2.5}
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M18 6 6 18M6 6l12 12' />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
