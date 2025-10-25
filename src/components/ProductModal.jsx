// components/ProductModal.jsx
import { useEffect, useMemo, useState } from 'react';
import { SaleStamp } from './SaleStamp';
import { BestSellerStamp } from './BestSellerStamp';
import FlavorBadge from './FlavorBadge';
import { getFlavorStatus } from '../utils/products';
import { patchFlavorAvailability } from '../services/api';
import { toast } from 'react-hot-toast';

const ProductModal = ({
  openItem,
  setOpenItem,
  closeBtnRef,
  activeStore = 'all',
  onAvailabilityChange, // notifica al padre para lista + cache
}) => {
  // Estado local
  const [item, setItem] = useState(openItem);
  const [editMode, setEditMode] = useState(false);

  // Pendientes por sabor (Set de flavorIds en curso)
  const [pending, setPending] = useState(() => new Set());

  const storeEditable = activeStore && activeStore !== 'all';

  useEffect(() => setItem(openItem), [openItem]);

  // Lista de sabores pintables
  const flavors = useMemo(
    () => getFlavorStatus(item, activeStore),
    [item, activeStore]
  );

  // name -> _id (para API por id real)
  const flavorIdByName = useMemo(() => {
    const map = new Map();
    for (const f of item?.flavors ?? []) map.set(f.name, f._id);
    return map;
  }, [item]);

  const toggleAvailability = async (flavorName, currentAvailable) => {
    if (!storeEditable || !editMode) return;

    const flavorId = flavorIdByName.get(flavorName);
    if (!flavorId) return;

    const flavorKey = String(flavorId);
    if (pending.has(flavorKey)) return; // evita doble click en el mismo sabor

    const next = !currentAvailable;

    // ---- OPTIMISTIC UI: aplicamos cambio local inmediato ----
    const prev = item;
    const draft = structuredClone(item);
    const target = draft.flavors.find((x) => String(x._id) === flavorKey);
    if (!target.available_location[activeStore]) {
      target.available_location[activeStore] = {
        available: false,
        quantity: 0,
      };
    }
    target.available_location[activeStore].available = next;

    setItem(draft);
    setOpenItem(draft);

    // ---- Notifica al padre (lista + cache) de inmediato ----
    onAvailabilityChange?.({
      productId: item._id,
      flavorId,
      storeId: activeStore,
      available: next,
    });

    // Marca pendiente este sabor
    setPending((old) => new Set([...old, flavorKey]));

    // Toasts
    const toastId = toast.loading('Guardando…');

    // Hint “despertando servidor” si tarda
    const wakeHint = setTimeout(() => {
      toast('Despertando servidor… ⏳');
    }, 800);

    try {
      await patchFlavorAvailability({
        productId: item._id,
        flavorId,
        storeId: activeStore,
        available: next,
      });

      clearTimeout(wakeHint);
      toast.success('Cambios guardados ✅', { id: toastId });
    } catch (e) {
      clearTimeout(wakeHint);

      // ---- ROLLBACK local ----
      setItem(prev);
      setOpenItem(prev);

      // ---- ROLLBACK en el padre ----
      onAvailabilityChange?.({
        productId: item._id,
        flavorId,
        storeId: activeStore,
        available: currentAvailable,
      });

      toast.error('No se pudo guardar ❌', { id: toastId });
      console.error(e);
    } finally {
      setPending((old) => {
        const n = new Set(old);
        n.delete(flavorKey);
        return n;
      });
    }
  };

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
        aria-label={`${item.brand} ${item.model}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen y Stamps */}
        <div className='col-span-3 flex items-center justify-center h-full p-4 sm:p-5 overflow-hidden'>
          <img
            src={item.image || item.img || item.src}
            alt={`${item.brand} ${item.model}`}
            className='object-contain w-full max-w-[22rem] max-h-[85%] mx-auto'
            loading='eager'
            draggable={false}
          />
          {item.on_sale && (
            <SaleStamp className='absolute top-0 left-0 max-w-48 sm:max-w-28 md:max-w-60' />
          )}
          {item.on_featured && (
            <BestSellerStamp className='absolute top-0 left-0 max-w-48 sm:max-w-28 md:max-w-60' />
          )}
        </div>

        {/* Detalles */}
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
          {/* Toggle edición */}
          <button
            type='button'
            onClick={() => storeEditable && setEditMode((v) => !v)}
            className={`fill-slate-900 dark:fill-slate-100
              absolute right-14 top-2
              inline-flex items-center justify-center
              rounded-full p-2 text-xs
              hover:bg-slate-400 dark:hover:bg-slate-900 transition
              ${
                editMode
                  ? 'bg-slate-400 dark:bg-slate-900'
                  : 'bg-slate-300 transition dark:bg-slate-600'
              }
            `}
            title={
              storeEditable
                ? editMode
                  ? 'Salir de edición'
                  : 'Habilitar edición'
                : 'Selecciona una tienda para editar'
            }
          >
            {editMode ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24'
                width='24'
                viewBox='0 -960 960 960'
              >
                <path d='m622-453-56-56 82-82-57-57-82 82-56-56 195-195q12-12 26.5-17.5T705-840q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L622-453ZM200-200h57l195-195-28-29-29-28-195 195v57ZM792-56 509-338 290-120H120v-169l219-219L56-792l57-57 736 736-57 57Zm-32-648-56-56 56 56Zm-169 56 57 57-57-57ZM424-424l-29-28 57 57-28-29Z' />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24'
                width='24'
                viewBox='0 -960 960 960'
              >
                <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
              </svg>
            )}
          </button>

          {/* Cerrar */}
          <button
            ref={closeBtnRef}
            onClick={() => setOpenItem(null)}
            className='absolute top-2 right-2 rounded-full bg-slate-300 dark:bg-slate-600 p-2 fill-slate-900 dark:fill-slate-100 hover:bg-slate-400 dark:hover:bg-slate-900 transition'
          >
            <span className='sr-only'>Close</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24'
              width='24'
              viewBox='0 -960 960 960'
            >
              <path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z' />
            </svg>
          </button>

          <header className='space-y-1'>
            <p className='font-semibold text-2xl leading-tight'>
              {item.brand} {item.model}
            </p>
            {item.puffs ? (
              <span className='text-slate-600 dark:text-slate-200 text-xl'>
                {item.puffs} puffs
              </span>
            ) : null}
          </header>

          {/* Sabores */}
          {flavors.length > 0 && (
            <section className='mt-6 space-y-2'>
              <p className='text-lg text-slate-700 dark:text-slate-200'>
                Sabores
              </p>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-1'>
                {flavors
                  .slice()
                  .sort((a, b) =>
                    a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1
                  )
                  .map((f) => {
                    const isInteractive = storeEditable && editMode;
                    const fid = flavorIdByName.get(f.name);
                    const isPending = fid ? pending.has(String(fid)) : false;

                    const clickEnabled = isInteractive && !isPending;

                    const actionTitle = clickEnabled
                      ? f.isAvailable
                        ? 'Desactivar en esta tienda'
                        : 'Activar en esta tienda'
                      : isInteractive
                      ? f.isAvailable
                        ? 'Desactivar (guardando...)'
                        : 'Activar (guardando...)'
                      : f.isAvailable
                      ? 'Disponible en esta tienda'
                      : 'No disponible en esta tienda';

                    // Ícono: si está pendiente, mostramos spinner en lugar del check/cuadro
                    const statusIcon = isInteractive ? (
                      isPending ? (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          width='16'
                          height='16'
                          className='animate-spin'
                          aria-hidden='true'
                          focusable='false'
                        >
                          <path
                            d='M12 2a10 10 0 1 0 10 10'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                          />
                        </svg>
                      ) : f.isAvailable ? (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          height='20'
                          width='20'
                          viewBox='0 -960 960 960'
                          className='fill-emerald-500 shrink-0'
                          aria-hidden='true'
                          focusable='false'
                        >
                          <path d='m429-336 238-237-51-51-187 186-85-84-51 51 136 135ZM216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h528q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Z' />
                        </svg>
                      ) : (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          height='20'
                          width='20'
                          viewBox='0 -960 960 960'
                          className='fill-rose-500 shrink-0'
                          aria-hidden='true'
                          focusable='false'
                        >
                          <path d='M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h528q29.7 0 50.85 21.15Q816-773.7 816-744v528q0 29.7-21.15 50.85Q773.7-144 744-144H216Z' />
                        </svg>
                      )
                    ) : null;

                    return (
                      <FlavorBadge
                        key={f.name}
                        color={f.color}
                        isAvailable={f.isAvailable}
                        title={actionTitle}
                        onClick={
                          clickEnabled
                            ? () => toggleAvailability(f.name, f.isAvailable)
                            : undefined
                        }
                        disabled={!clickEnabled}
                      >
                        <div
                          className={`flex items-center gap-1 select-none ${
                            isInteractive ? 'cursor-pointer' : ''
                          }`}
                        >
                          {statusIcon}
                          <span>{f.name}</span>
                        </div>
                      </FlavorBadge>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
