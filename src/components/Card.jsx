import { Link } from 'react-router-dom';
import { SaleStamp } from './SaleStamp';
import { BestSellerStamp } from './BestSellerStamp';
import { useCatalogConfig } from '../hooks/useCatalogConfig';

export const Card = ({
  item,
  onPreview,
  className = '',
  priority = false,
  emojiMap = {},
}) => {
  const { componentLabelMap } = useCatalogConfig();
  // Soporta múltiples nombres de campo de imagen por compatibilidad con datos históricos
  const imgSrc =
    item.image ||
    item.img ||
    item.src ||
    'https://res.cloudinary.com/dxgcm42sb/image/upload/fl_preserve_transparency/v1759513293/samples/logo.jpg?_s=public-apps';
  const label = `Ver grande ${item.brand} ${item.model || ''}`.trim();

  // Solo muestra subcategorías con nivel > 0 (0 significa "no aplica")
  const activeSubcats = (item.subcategories ?? []).filter((s) => s.level > 0);
  const activeComponents = Object.entries(item.components ?? {}).filter(
    ([, v]) => v,
  );

  const isEdible = item.kind === 'Edibles';
  const isKit = item.kind === 'Kits';

  // Los Edibles no muestran puffs/gramos porque sus detalles relevantes van en dosage_mg
  const details = isEdible
    ? []
    : [
        item.puffs ? `${item.puffs} puffs` : null,
        item.grams ? `${item.grams}g` : null,
        item.dosage_mg ? `${item.dosage_mg}mg` : null,
        !item.puffs && !item.grams && !item.dosage_mg ? item.kind : null,
      ].filter(Boolean);

  const SubcatBars = ({ items }) =>
    items.map((s) => (
      <div key={s.name} className='flex items-center gap-1.5'>
        <span className='text-sm leading-none'>{emojiMap[s.name] || '•'}</span>
        <div className='flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden'>
          <div
            className='h-full rounded-full bg-linear-to-r from-blue-400 to-purple-500'
            style={{ width: `${(s.level / 5) * 100}%` }}
          />
        </div>
      </div>
    ));

  return (
    <div
      className={[
        'group relative flex flex-col rounded-md border border-slate-200/60 bg-slate-50 shadow-sm transition-shadow duration-300',
        'hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60',
        'w-full',
        className,
      ].join(' ')}
    >
      {/* Image */}
      <div className='relative'>
        <button
          type='button'
          onClick={() => onPreview?.(item)}
          className='block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 rounded-t-md'
          aria-label={label}
          title={label}
        >
          <div className='relative w-full aspect-square overflow-hidden rounded-t-md'>
            <img
              src={imgSrc}
              alt={`${item.brand} ${item.model ?? ''}`}
              className='absolute inset-0 h-full w-full object-contain pointer-events-none'
              loading={priority ? 'eager' : 'lazy'}
              sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            />
          </div>
        </button>

        {item.on_sale && (
          <SaleStamp className='left-0 top-0 max-w-48 sm:max-w-32 md:max-w-36' />
        )}
        {item.on_featured && !item.on_sale && (
          <BestSellerStamp className='left-0 top-0 max-w-48 sm:max-w-32 md:max-w-36' />
        )}
      </div>

      {/* Content */}
      {isEdible ? (
        <div className='py-2 px-3 flex flex-col gap-1.5 flex-1'>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-white leading-snug'>
            <span className='truncate block'>
              {item.brand}
              {' · '}
              <span className='font-light text-slate-800 dark:text-slate-300'>
                {item.model}
              </span>
              {item.dosage_mg > 0 && (
                <span className='font-light text-slate-500 dark:text-slate-400'>
                  {' · '}
                  {item.dosage_mg} mg
                </span>
              )}
            </span>
          </h2>

          {activeComponents.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {activeComponents.map(([key]) => (
                <span
                  key={key}
                  className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200'
                >
                  {componentLabelMap[key] || key}
                </span>
              ))}
            </div>
          )}

          {activeSubcats.length > 0 && (
            <div className='flex flex-col gap-1 mt-auto pt-1'>
              <SubcatBars items={activeSubcats} />
            </div>
          )}
        </div>
      ) : (
        <div className='py-2 px-3 space-y-1.5 flex-1'>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-white leading-snug'>
            <span className='truncate block'>
              {item.brand}
              {' • '}
              <span className='font-light text-slate-800 dark:text-slate-300'>
                {item.model}
              </span>
              {isKit && details.length > 0 && (
                <span className='dark:text-slate-100/70 font-extralight'>
                  {' • '}
                  {details.join(' - ')}
                </span>
              )}
            </span>
          </h2>
          {!isKit && details.length > 0 && (
            <h3 className='dark:text-slate-100/70'>{details.join(' - ')}</h3>
          )}
          {isKit && activeComponents.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {activeComponents.map(([key]) => (
                <span
                  key={key}
                  className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200'
                >
                  {componentLabelMap[key] || key}
                </span>
              ))}
            </div>
          )}

          {activeSubcats.length > 0 && (
            <div className='flex flex-col gap-1 mt-2'>
              <SubcatBars items={activeSubcats} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;
