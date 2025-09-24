import { SaleStamp } from './SaleStamp';
import { BestSellerStamp } from './BestSellerStamp';

export const Card = ({ item, onPreview }) => {
  const imgSrc = item.image || item.img || item.src || '';
  const label = `Ver grande ${item.brand} ${item.model || ''}`.trim();

  return (
    <div className='bg-white rounded shadow hover:shadow-md transition-shadow duration-300 flex flex-col relative w-60 md:w-full'>
      <div className='relative'>
        {/* Botón accesible que abre el modal */}
        <button
          type='button'
          onClick={() => onPreview?.(item)}
          className='block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 rounded'
          aria-label={label}
          title={label}
        >
          <img
            src={imgSrc}
            alt={`${item.brand} ${item.model}`}
            className='object-contain w-full h-60 rounded pointer-events-none'
            loading='lazy'
          />
        </button>

        {item.sale && <SaleStamp className='w-24 h-24 top-0 right-4' />}
        {item.featured && (
          <BestSellerStamp className='w-24 h-24 top-0 right-4' />
        )}
      </div>

      <div className='p-2'>
        <h2 className='text-gray-950 font-semibold'>
          {item.brand}{' '}
          <span className='text-gray-500 font-light text-sm'>{item.model}</span>
        </h2>
      </div>
    </div>
  );
};

export default Card;
