import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getProductById, updateProduct, updateEffects, updateProductTypes } from '../services/api';
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

  useEffect(() => {
    if (configLoading) return;

    getProductById(id)
      .then((prod) => {
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

  if (pageLoading || configLoading) return <LoaderSpinner />;

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
      <div className='mb-5'>
        <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>Editar producto</h1>
        <p className='text-sm text-slate-500'>
          {productTypes.find((t) => t.value === initialValues?.kind)?.label ?? initialValues?.kind}
        </p>
      </div>
      <ProductForm
        mode='edit'
        initialValues={initialValues ?? {}}
        productTypes={productTypes}
        strains={strains}
        onSubmit={handleSubmit}
        submitLabel='Guardar cambios'
        onCancel={() => navigate(-1)}
      />
    </section>
  );
}
