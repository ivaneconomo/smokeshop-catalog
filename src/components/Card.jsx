import { SaleStamp } from './SaleStamp';
import { BestSellerStamp } from './BestSellerStamp';

// Props extra opcionales:
// - className: para ajustar desde afuera si hace falta
// - priority: si quieres mantener 'eager' en los primeros ítems
export const Card = ({ item, onPreview, className = '', priority = true }) => {
  const imgSrc = item.image || item.img || item.src || '';
  const label = `Ver grande ${item.brand} ${item.model || ''}`.trim();

  return (
    <div
      className={[
        'group relative flex flex-col rounded-md border border-slate-200/60 bg-slate-50 shadow-sm transition-shadow duration-300',
        'hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60',
        // Ancho fluido por defecto; el grid/parent define columnas
        'w-full',
        className,
      ].join(' ')}
    >
      {/* Imagen en contenedor con aspect ratio para mantener proporciones */}
      <div className='relative'>
        <button
          type='button'
          onClick={() => onPreview?.(item)}
          className='block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 rounded-t-md'
          aria-label={label}
          title={label}
        >
          {/* Contenedor con aspect ratio: más alto en móviles, más compacto en desktop */}
          <div className='relative w-full aspect-square overflow-hidden rounded-t-md'>
            <img
              src={imgSrc}
              alt={`${item.brand} ${item.model ?? ''}`}
              className='absolute inset-0 h-full w-full object-contain pointer-events-none'
              loading={priority ? 'eager' : 'lazy'}
              // Ajusta cómo se descarga en cada breakpoint para mejor CLS/LCP
              sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            />
          </div>
        </button>

        {/* Sellos responsivos */}
        {item.on_sale && (
          <SaleStamp className='left-0 top-0 max-w-48 sm:max-w-32 md:max-w-36' />
        )}
        {item.on_featured && (
          <BestSellerStamp className='left-0 top-0 max-w-48 sm:max-w-32 md:max-w-36' />
        )}
      </div>

      {/* Texto */}
      <div className='py-2 px-3'>
        <h2 className='text-lg font-semibold text-slate-900 dark:text-white leading-snug'>
          <span className='truncate block'>
            {item.brand}
            {' · '}
            <span className='font-light text-slate-800 dark:text-slate-300'>
              {item.model}
            </span>
          </span>
        </h2>
        <h3 className='dark:text-slate-100/70 '>{item.puffs} puffs</h3>
        {/* Lugar para subtítulo, precio o badges si luego quieres */}
        {/* <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.description}</p> */}
      </div>
    </div>
  );
};

export default Card;
