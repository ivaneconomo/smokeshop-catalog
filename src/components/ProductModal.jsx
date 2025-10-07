import { SaleStamp } from './SaleStamp';
import { BestSellerStamp } from './BestSellerStamp';
import Badge from './Badge';

const ProductModal = ({ openItem, setOpenItem, closeBtnRef }) => {
  return (
    <div
      className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={() => setOpenItem(null)}
      aria-hidden='true'
    >
      <div
        className='relative max-w-4xl flex justify-center bg-white backdrop-blur-md p-4 rounded-xl shadow-lg'
        role='dialog'
        aria-modal='true'
        aria-label={`${openItem.brand} ${openItem.model}`}
        onClick={(e) => e.stopPropagation()} // evita cerrar al click dentro
      >
        <div className='relative inline-block'>
          <img
            src={openItem.image || openItem.img || openItem.src}
            alt={`${openItem.brand} ${openItem.model}`}
            className='w-full max-w-md max-h-[80vh] rounded-xl mx-auto'
            loading='eager'
          />
          {openItem.on_sale && (
            <SaleStamp className='max-w-28 max-h-28 md:max-w-40 md:max-h-40 top-6 right-8 md:right-6' />
          )}
          {openItem.on_featured && (
            <BestSellerStamp className='max-w-28 max-h-28 md:max-w-40 md:max-h-40 top-6 right-8 md:right-6' />
          )}
          <button
            ref={closeBtnRef}
            onClick={() => setOpenItem(null)}
            className='absolute top-2 right-2 rounded-full bg-zinc-200 hover:bg-white shadow-sm p-2 text-sm font-semibold dark:text-[#18181b]'
          >
            ❌
          </button>
          <div className='mt-3 text-center'>
            <div className='text-lg font-semibold flex justify-center gap-2 items-center dark:text-gray-900'>
              {openItem.brand} {openItem.model}
              {openItem.puffs ? (
                <div className='text-gray-700/80 font-normal dark:text-gray-400'>
                  {openItem.puffs} puffs
                </div>
              ) : null}
            </div>

            <div className='mt-2 grid grid-cols-3 gap-1 justify-center'>
              {openItem.flavors?.map((f, i) => (
                <Badge key={i} color={f.color}>
                  {f.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
