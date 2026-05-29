import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getProducts, archiveProduct } from '../services/api';
import { clearProductsCache } from '../utils/cache';
import { LoaderSpinner } from '../components/LoaderSpinner';

export default function ArchivedProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = () => {
    setLoading(true);
    getProducts({ archived: true })
      .then(setItems)
      .catch(() => toast.error('Error al cargar archivados'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArchived(); }, []);

  const handleRestore = async (id) => {
    try {
      await archiveProduct(id);
      clearProductsCache();
      setItems((prev) => prev.filter((p) => p._id !== id));
      toast.success('Producto restaurado');
    } catch {
      toast.error('No se pudo restaurar el producto');
    }
  };

  return (
    <section className='py-6 pb-12'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>Productos archivados</h1>
        <p className='text-sm text-slate-500 mt-1'>
          Estos productos no aparecen en el catálogo. Podés restaurarlos o eliminarlos definitivamente.
        </p>
      </div>

      {loading && <LoaderSpinner />}

      {!loading && items.length === 0 && (
        <p className='text-slate-400 dark:text-slate-500 text-sm mt-8 text-center'>
          No hay productos archivados.
        </p>
      )}

      {!loading && items.length > 0 && (
        <ul className='divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden'>
          {items.map((product) => (
            <li
              key={product._id}
              className='flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors'
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={`${product.brand} ${product.model}`}
                  className='h-12 w-12 rounded object-contain border border-slate-200 dark:border-slate-600 shrink-0'
                />
              )}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-slate-900 dark:text-white truncate'>
                  {product.brand} · {product.model}
                </p>
                <p className='text-xs text-slate-400 mt-0.5'>{product.kind}</p>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                <button
                  type='button'
                  onClick={() => handleRestore(product._id)}
                  className='rounded-md border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition'
                >
                  Restaurar
                </button>
                <Link
                  to={`/products/${product._id}/edit`}
                  className='rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 transition'
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
