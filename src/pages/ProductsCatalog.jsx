import { useEffect, useRef, useState } from 'react';
import Card from '../components/Card';
import ProductModal from '../components/ProductModal';
import { getProducts } from '../services/api'; // 👈 axios
import { LoaderSpinner } from '../components/LoaderSpinner';

export default function ProductsCatalog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [openItem, setOpenItem] = useState(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getProducts(); // 👈 trae todo
        if (!mounted) return;
        // orden simple por client_id (tu seed lo tiene)
        setItems([...data].sort((a, b) => (a.puffs > b.puffs ? 1 : -1)));
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Error al cargar productos');
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!openItem) return;
    const onKey = (e) => e.key === 'Escape' && setOpenItem(null);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openItem]);

  return (
    <section className='mx-auto max-w-7xl px-4 py-6 flex flex-col items-center'>
      <h1 className='mb-6 text-2xl font-bold text-center'>Catálogo · Vapes</h1>

      {loading && <LoaderSpinner />}
      {err && !loading && (
        <p className='text-red-600 my-8'>🥲 Hubo un problema: {err}</p>
      )}

      {!loading && !err && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 justify-items-center w-full'>
          {items
            .filter((x) => x.available) // si querés solo disponibles
            .map((item) => (
              <Card
                key={item._id || item.client_id} // 👈 key estable
                item={item}
                onPreview={() => setOpenItem(item)}
              />
            ))}
        </div>
      )}

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
