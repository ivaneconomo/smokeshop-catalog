import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getProductById, updateProduct, updateEffects, updateProductTypes, archiveProduct, deleteProduct } from '../services/api';
import { clearConfigCache } from '../hooks/useCatalogConfig';
import { clearProductsCache } from '../utils/cache';
import { LoaderSpinner } from '../components/LoaderSpinner';
import { useCatalogConfig } from '../hooks/useCatalogConfig';
import ProductForm from '../components/ProductForm';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { productTypes, strains, loading: configLoading } = useCatalogConfig();

  const [pageLoading, setPageLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);
  const [isArchived, setIsArchived] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteInputRef = useRef(null);

  useEffect(() => {
    if (configLoading) return;

    // Reset state so ProductForm never mounts with stale data from a previous product
    setPageLoading(true);
    setInitialValues(null);

    getProductById(id)
      .then((prod) => {
        setIsArchived(prod.archived ?? false);
        setInitialValues({
          kind: prod.kind || '',
          brand: prod.brand || '',
          model: prod.model || '',
          image: prod.image || '',
          description: prod.description || '',
          minPrice: String(prod.min_price ?? ''),
          suggestedPrice: String(prod.suggested_price ?? ''),
          flavorNames: (prod.flavors ?? []).map((f) => f.name).join('\n'),
          flavorList: (prod.flavors ?? []).map((f) => ({ name: f.name, strain: f.strain ?? '', color: f.color ?? '' })),
          puffs: prod.kind === 'Nicotine' ? String(prod.puffs ?? '') : '',
          grams: prod.kind === 'Kits' ? String(prod.grams ?? '') : '',
          selectedStrains: prod.kind === 'Kits' ? (prod.strains ?? []).map((s) => s.name) : [],
          weightG: prod.kind === 'Edibles' ? String(prod.weight_g ?? '') : '',
          servings: prod.kind === 'Edibles' ? String(prod.servings ?? '') : '',
          dosageMg: prod.kind === 'Edibles' ? String(prod.dosage_mg ?? '') : '',
          selectedComponents: Object.entries(prod.components ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k),
          effectLevels: Object.fromEntries(
            (prod.subcategories ?? []).map(({ name, level }) => [name, level]),
          ),
          onSale: prod.on_sale ?? false,
          onFeatured: prod.on_featured ?? false,
        });
      })
      .catch(() => toast.error('Error al cargar el producto'))
      .finally(() => setPageLoading(false));
  }, [id, configLoading, productTypes]);

  const handleArchive = async () => {
    try {
      const res = await archiveProduct(id);
      setIsArchived(res.archived);
      clearProductsCache();
      toast.success(res.archived ? 'Producto archivado' : 'Producto restaurado');
    } catch {
      toast.error('No se pudo archivar el producto');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id);
      clearProductsCache();
      toast.success('Producto eliminado');
      navigate('/categories');
    } catch {
      toast.error('No se pudo eliminar el producto');
    }
  };

  if (pageLoading || configLoading || !initialValues) return <LoaderSpinner />;

  const handleSubmit = async (payload, { effects, strains, productTypes }) => {
    try {
      await updateProduct(id, payload);
      await updateEffects(effects).catch(() => {});
      await updateProductTypes(productTypes, strains).catch(() => {});
      clearConfigCache();
      clearProductsCache();
      toast.success('Producto actualizado');
      navigate(`/categories?kind=${payload.kind}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo actualizar');
    }
  };

  return (
    <section className='py-6 pb-12'>
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>Editar producto</h1>
          <p className='text-sm text-slate-500'>
            {productTypes.find((t) => t.value === initialValues?.kind)?.label ?? initialValues?.kind}
          </p>
        </div>
        {isArchived && (
          <span className='mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'>
            Archivado
          </span>
        )}
      </div>

      <ProductForm
        key={id}
        mode='edit'
        initialValues={initialValues ?? {}}
        productTypes={productTypes}
        strains={strains}
        onSubmit={handleSubmit}
        submitLabel='Guardar cambios'
        onCancel={() => navigate(-1)}
      />

      {/* Zona de peligro */}
      <div className='mt-10 border-t border-slate-200 dark:border-slate-700 pt-8'>
        <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide'>
          Archivar o eliminar producto
        </p>
        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={handleArchive}
            className='inline-flex items-center gap-2 rounded-md border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/40'
          >
            {isArchived ? 'Restaurar producto' : 'Archivar producto'}
          </button>
          <button
            type='button'
            onClick={() => setShowDeleteConfirm(true)}
            className='inline-flex items-center gap-2 rounded-md border border-red-400 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/40'
          >
            Eliminar definitivamente
          </button>
        </div>
      </div>

      {/* Modal confirmación borrado */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='w-full max-w-sm rounded-lg bg-white dark:bg-slate-800 p-6 shadow-xl'>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-white mb-2'>
              Eliminar producto
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400 mb-4'>
              Esta acción es <strong>permanente</strong>. Se eliminará el producto y su imagen de Cloudinary. Escribí{' '}
              <strong>ELIMINAR</strong> para confirmar.
            </p>
            <input
              ref={deleteInputRef}
              type='text'
              placeholder='ELIMINAR'
              className='w-full rounded-md border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500'
            />
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => { setShowDeleteConfirm(false); deleteInputRef.current.value = ''; }}
                className='rounded-md px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={() => {
                  if (deleteInputRef.current?.value === 'ELIMINAR') {
                    handleDelete();
                  } else {
                    toast.error('Escribí ELIMINAR para confirmar');
                  }
                }}
                className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition'
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
