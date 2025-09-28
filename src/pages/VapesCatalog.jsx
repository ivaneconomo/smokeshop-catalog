import { useEffect, useRef, useState } from 'react';
import VAPES from '../data/vapes';
import Card from '../components/Card';
import ProductModal from '../components/ProductModal';

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

      {openItem && (
        <ProductModal
          openItem={openItem}
          setOpenItem={setOpenItem}
          closeBtnRef={closeBtnRef}
        />
      )}
    </section>
  );
}
