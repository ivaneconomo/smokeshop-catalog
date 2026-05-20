import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createProduct, updateEffects, updateProductTypes } from '../services/api';
import { clearConfigCache } from '../hooks/useCatalogConfig';
import { useCatalogConfig } from '../hooks/useCatalogConfig';
import ProductForm from '../components/ProductForm';

const clearProductCache = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('products:'))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    /* noop */
  }
};

export default function CreateProduct() {
  const navigate = useNavigate();
  const { productTypes, strains, stores, loading: configLoading } = useCatalogConfig();

  if (configLoading) return null;

  const handleSubmit = async (payload, { effects, strains, productTypes }) => {
    try {
      await createProduct(payload);
      await updateEffects(effects).catch(() => {});
      await updateProductTypes(productTypes, strains).catch(() => {});
      clearConfigCache();
      clearProductCache();
      toast.success('Producto creado');
      navigate(`/categories?kind=${payload.kind}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo crear');
    }
  };

  return (
    <section className='py-6 pb-12'>
      <div className='mb-5'>
        <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>Nuevo producto</h1>
      </div>
      <ProductForm
        mode='create'
        stores={stores}
        productTypes={productTypes}
        strains={strains}
        onSubmit={handleSubmit}
        submitLabel='Crear producto'
      />
    </section>
  );
}
