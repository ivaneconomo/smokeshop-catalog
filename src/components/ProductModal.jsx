import { SaleStamp } from './SaleStamp';
import { BestSellerStamp } from './BestSellerStamp';
import Badge from './Badge';
import { getVisibleFlavors } from '../utils/products';

const ProductModal = ({
  openItem,
  setOpenItem,
  closeBtnRef,
  activeStore = 'all',
}) => {
  const visibleFlavors = getVisibleFlavors(openItem, activeStore);

  return (
    <div
      className='fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center'
      onClick={() => setOpenItem(null)}
      aria-hidden='true'
    >
      <div
        className='
        max-w-lg
        max-h-[70vh]
        animate-fadeIn
        animate-fadeOut
        overflow-auto
        relative
        bg-slate-200
        dark:bg-slate-800
        rounded-xl
        grid
        grid-cols-1
        sm:grid-cols-5
        p-4
        '
        role='dialog'
        aria-modal='true'
        aria-label={`${openItem.brand} ${openItem.model}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen y Stamps */}
        <div className='col-span-2 flex'>
          <img
            src={openItem.image || openItem.img || openItem.src}
            alt={`${openItem.brand} ${openItem.model}`}
            className='object-contain'
            loading='eager'
          />

          {openItem.on_sale && (
            <SaleStamp className='max-w-50 sm:max-w-40 top-0 left-0' />
          )}
          {openItem.on_featured && (
            <BestSellerStamp className='max-w-50 sm:max-w-40 top-0 left-0' />
          )}
        </div>

        {/* Detalles del producto */}
        <div className='text-slate-900 dark:text-white col-span-3 p-4 space-y-4 bg-slate-50 dark:bg-slate-700 border-0 rounded-xl'>
          <div className=''>
            <p className='font-semibold text-2xl'>
              {openItem.brand}
              {` `}
              {openItem.model}
            </p>{' '}
            {` `}
            {openItem.puffs ? (
              <span className='text-slate-500 dark:text-slate-300'>
                {openItem.puffs} puffs
              </span>
            ) : null}
          </div>

          {/* Badges */}
          {visibleFlavors.length > 0 && (
            <div className='space-y-2'>
              <p>Available Flavors </p>
              <div className='grid grid-cols-2 sm:grid-cols-2 gap-1 max-h-60 overflow-auto'>
                {visibleFlavors.map((f, i) => (
                  <Badge key={i} color={f.color}>
                    {f.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botón de cerrar */}
        <button
          ref={closeBtnRef}
          onClick={() => setOpenItem(null)}
          className='absolute top-2 right-2 rounded-full bg-slate-200 dark:bg-slate-800 border-slate-50 dark:border-slate-900/50 border p-2 hover:text-white hover:bg-red-500 transition-colors'
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
