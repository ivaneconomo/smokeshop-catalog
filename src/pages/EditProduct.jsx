import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getProductById,
  updateProduct,
  getSubcategories,
  updateSubcategories,
} from '../services/api';
import { LoaderSpinner } from '../components/LoaderSpinner';

const PRODUCT_TYPES = [
  { value: 'Nicotine', label: 'Nicotine disposable' },
  { value: 'Kits', label: 'HHC disposable' },
  { value: 'Edibles', label: 'Edible' },
];

const STRAINS = ['Sativa', 'Indica', 'Hybrid'];

const HHC_COMPONENTS = [
  ['hhc', 'HHC'],
  ['d8', 'Delta 8'],
  ['d10', 'Delta 10'],
  ['cbd', 'CBD'],
  ['mushrooms', 'Mushrooms'],
  ['mushroom_blend', 'Mushroom Blend'],
];

const EDIBLE_COMPONENTS = [
  ['hhc', 'HHC'],
  ['d8', 'Delta 8'],
  ['d10', 'Delta 10'],
  ['cbd', 'CBD'],
  ['cbg', 'CBG'],
  ['cbn', 'CBN'],
  ['muscimol', 'Muscimol'],
  ['amanita_muscaria', 'Amanita'],
  ['lion_mane', "Lion's mane"],
  ['reishi', 'Reishi'],
  ['cordyceps', 'Cordyceps'],
  ['turkey_tail', 'Turkey tail'],
  ['mad_honey', 'Mad honey'],
  ['mushroom_blend', 'Mushroom Blend'],
];

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900';

const labelClass =
  'flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200';

const emptyComponents = (pairs) =>
  Object.fromEntries(pairs.map(([key]) => [key, false]));

const parseNames = (value) =>
  value
    .split(/[\n,]+/)
    .map((n) => n.trim())
    .filter(Boolean);

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  const [kind, setKind] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [flavorNames, setFlavorNames] = useState('');
  const [puffs, setPuffs] = useState('');
  const [grams, setGrams] = useState('');
  const [selectedStrains, setSelectedStrains] = useState([]);
  const [weightG, setWeightG] = useState('');
  const [servings, setServings] = useState('');
  const [dosageMg, setDosageMg] = useState('');
  const [hhcComponents, setHhcComponents] = useState(() =>
    emptyComponents(HHC_COMPONENTS),
  );
  const [edibleComponents, setEdibleComponents] = useState(() =>
    emptyComponents(EDIBLE_COMPONENTS),
  );
  const [subcategoryLevels, setSubcategoryLevels] = useState({});
  const [newSubInput, setNewSubInput] = useState('');
  const [newSubEmoji, setNewSubEmoji] = useState('');
  const [subcategories, setSubcategories] = useState([
    { name: 'High', emoji: '🚀' },
    { name: 'Relax', emoji: '🌊' },
    { name: 'Trippy', emoji: '🍄' },
  ]);
  const [onSale, setOnSale] = useState(false);
  const [onFeatured, setOnFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getProductById(id), getSubcategories()])
      .then(([prod, subData]) => {
        setKind(prod.kind || '');
        setBrand(prod.brand || '');
        setModel(prod.model || '');
        setImage(prod.image || '');
        setDescription(prod.description || '');
        setMinPrice(String(prod.min_price ?? ''));
        setSuggestedPrice(String(prod.suggested_price ?? ''));
        const list = subData.subcategories ?? [
          { name: 'High', emoji: '🚀' },
          { name: 'Relax', emoji: '🌊' },
          { name: 'Trippy', emoji: '🍄' },
        ];
        const levels = {};
        list.forEach(({ name }) => { levels[name] = 0; });
        (prod.subcategories ?? []).forEach(({ name, level }) => { levels[name] = level; });
        setSubcategoryLevels(levels);
        setOnSale(prod.on_sale ?? false);
        setOnFeatured(prod.on_featured ?? false);
        setFlavorNames((prod.flavors ?? []).map((f) => f.name).join('\n'));

        if (prod.kind === 'Nicotine') {
          setPuffs(String(prod.puffs ?? ''));
        }
        if (prod.kind === 'Kits') {
          setGrams(String(prod.grams ?? ''));
          setSelectedStrains((prod.strains ?? []).map((s) => s.name));
          if (prod.components) {
            setHhcComponents((prev) => ({ ...prev, ...prod.components }));
          }
        }
        if (prod.kind === 'Edibles') {
          setWeightG(String(prod.weight_g ?? ''));
          setServings(String(prod.servings ?? ''));
          setDosageMg(String(prod.dosage_mg ?? ''));
          if (prod.components) {
            setEdibleComponents((prev) => ({ ...prev, ...prod.components }));
          }
        }

        setSubcategories(list);
      })
      .catch(() => toast.error('Error al cargar el producto'))
      .finally(() => setPageLoading(false));
  }, [id]);

  const setSubcategoryLevel = (name, level) => {
    setSubcategoryLevels((prev) => ({ ...prev, [name]: level }));
  };

  const addSubcategory = () => {
    const name = newSubInput.trim();
    const emoji = newSubEmoji.trim();
    if (!name) return;
    if (!subcategories.find((s) => s.name === name)) {
      setSubcategories((prev) =>
        [...prev, { name, emoji }].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
    setSubcategoryLevels((prev) => ({ ...prev, [name]: prev[name] ?? 3 }));
    setNewSubInput('');
    setNewSubEmoji('');
  };

  const selectedTypeLabel = useMemo(
    () => PRODUCT_TYPES.find((t) => t.value === kind)?.label ?? kind,
    [kind],
  );

  const handleKindChange = (newKind) => {
    setKind(newKind);
    setPuffs('');
    setGrams('');
    setSelectedStrains([]);
    setFlavorNames('');
    setWeightG('');
    setServings('');
    setDosageMg('');
    setHhcComponents(emptyComponents(HHC_COMPONENTS));
    setEdibleComponents(emptyComponents(EDIBLE_COMPONENTS));
  };

  const toggleComponent = (key, group) => {
    const setter = group === 'hhc' ? setHhcComponents : setEdibleComponents;
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStrain = (strain) => {
    setSelectedStrains((prev) =>
      prev.includes(strain)
        ? prev.filter((s) => s !== strain)
        : [...prev, strain],
    );
  };

  const buildPayload = () => {
    const base = {
      kind,
      brand: brand.trim(),
      model: model.trim(),
      image: image.trim(),
      description: description.trim(),
      min_price: Number(minPrice),
      suggested_price: Number(suggestedPrice),
      subcategories: Object.entries(subcategoryLevels)
        .filter(([, lvl]) => lvl > 0)
        .map(([name, level]) => ({ name, level })),
      on_sale: onSale,
      on_featured: onFeatured,
    };

    if (kind === 'Nicotine') {
      return {
        ...base,
        puffs: Number(puffs || 0),
        flavors: parseNames(flavorNames).map((name) => ({
          name,
          color: 'white',
        })),
      };
    }

    if (kind === 'Kits') {
      return {
        ...base,
        grams: Number(grams || 0),
        components: hhcComponents,
        strains: selectedStrains.map((name) => ({ name })),
      };
    }

    return {
      ...base,
      weight_g: Number(weightG || 0),
      servings: Number(servings || 1),
      dosage_mg: Number(dosageMg || 0),
      components: edibleComponents,
      flavors: parseNames(flavorNames).map((name) => ({ name, color: 'white' })),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = buildPayload();
      await updateProduct(id, payload);

      await updateSubcategories(subcategories).catch(() => {});

      toast.success('Producto actualizado');
      navigate(`/categories?kind=${payload.kind}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <LoaderSpinner />;

  const flavorLabel = kind === 'Edibles' ? 'Sabores o variantes' : 'Sabores';

  return (
    <section className='py-6 pb-12'>
      <div className='mb-5'>
        <h1 className='text-2xl font-semibold text-slate-900 dark:text-white'>
          Editar producto
        </h1>
        <p className='text-sm text-slate-500'>{selectedTypeLabel}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className='space-y-5 rounded-md border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70'
      >
        <div className='grid gap-3 sm:grid-cols-2'>
          <label className={labelClass}>
            Categoría
            <select
              className={inputClass}
              value={kind}
              onChange={(e) => handleKindChange(e.target.value)}
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Imagen
            <input
              className={inputClass}
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder='URL opcional'
            />
          </label>

          <label className={labelClass}>
            Marca
            <input
              className={inputClass}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </label>

          <label className={labelClass}>
            Producto
            <input
              className={inputClass}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </label>

          <label className={labelClass}>
            Precio mínimo
            <input
              className={inputClass}
              type='number'
              min='0'
              step='0.01'
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              required
            />
          </label>

          <label className={labelClass}>
            Precio sugerido
            <input
              className={inputClass}
              type='number'
              min='0'
              step='0.01'
              value={suggestedPrice}
              onChange={(e) => setSuggestedPrice(e.target.value)}
              required
            />
          </label>
        </div>

        <label className={labelClass}>
          Descripción
          <textarea
            className={inputClass}
            rows='2'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <SubcategorySelector
          subcategories={subcategories}
          levels={subcategoryLevels}
          onLevelChange={setSubcategoryLevel}
          newInput={newSubInput}
          onNewInputChange={setNewSubInput}
          newEmoji={newSubEmoji}
          onNewEmojiChange={setNewSubEmoji}
          onAdd={addSubcategory}
          inputClass={inputClass}
        />

        {kind === 'Nicotine' && (
          <div className='grid gap-3 sm:grid-cols-[1fr_2fr]'>
            <label className={labelClass}>
              Puffs
              <input
                type='number'
                className={inputClass}
                value={puffs}
                onChange={(e) => setPuffs(e.target.value)}
                min='0'
              />
            </label>

            <label className={labelClass}>
              {flavorLabel}
              <textarea
                className={inputClass}
                rows='4'
                value={flavorNames}
                onChange={(e) => setFlavorNames(e.target.value)}
                placeholder='Un sabor por línea o separados por coma'
              />
            </label>
          </div>
        )}

        {kind === 'Kits' && (
          <div className='space-y-4'>
            <label className={labelClass}>
              Gramos
              <input
                type='number'
                className={inputClass}
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                min='0'
                step='0.5'
              />
            </label>

            <OptionGroup
              title='Strains'
              options={STRAINS.map((s) => [s, s])}
              selected={Object.fromEntries(
                STRAINS.map((s) => [s, selectedStrains.includes(s)]),
              )}
              onToggle={toggleStrain}
            />

            <OptionGroup
              title='Componentes'
              options={HHC_COMPONENTS}
              selected={hhcComponents}
              onToggle={(key) => toggleComponent(key, 'hhc')}
            />
          </div>
        )}

        {kind === 'Edibles' && (
          <div className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-3'>
              <label className={labelClass}>
                Peso
                <input
                  className={inputClass}
                  type='number'
                  min='0'
                  value={weightG}
                  onChange={(e) => setWeightG(e.target.value)}
                  placeholder='g'
                />
              </label>
              <label className={labelClass}>
                Piezas
                <input
                  className={inputClass}
                  type='number'
                  min='1'
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Dosis
                <input
                  className={inputClass}
                  type='number'
                  min='0'
                  value={dosageMg}
                  onChange={(e) => setDosageMg(e.target.value)}
                  placeholder='mg'
                />
              </label>
            </div>

            <label className={labelClass}>
              {flavorLabel}
              <textarea
                className={inputClass}
                rows='4'
                value={flavorNames}
                onChange={(e) => setFlavorNames(e.target.value)}
                placeholder='Un sabor por línea o separados por coma'
              />
            </label>

            <OptionGroup
              title='Componentes'
              options={EDIBLE_COMPONENTS}
              selected={edibleComponents}
              onToggle={(key) => toggleComponent(key, 'edible')}
            />
          </div>
        )}

        <div className='flex flex-wrap gap-3'>
          <Toggle checked={onSale} onChange={setOnSale} label='Oferta' />
          <Toggle
            checked={onFeatured}
            onChange={setOnFeatured}
            label='Destacado'
          />
        </div>

        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={submitting}
            className='rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
}

function OptionGroup({ title, options, selected, onToggle }) {
  return (
    <fieldset>
      <legend className='mb-2 text-sm font-medium text-slate-700 dark:text-slate-200'>
        {title}
      </legend>
      <div className='flex flex-wrap gap-2'>
        {options.map(([value, label]) => (
          <button
            key={value}
            type='button'
            onClick={() => onToggle(value)}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              selected[value]
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className='flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function SubcategorySelector({ subcategories, levels, onLevelChange, newInput, onNewInputChange, newEmoji, onNewEmojiChange, onAdd, inputClass }) {
  return (
    <fieldset className='space-y-3'>
      <legend className='text-sm font-medium text-slate-700 dark:text-slate-200'>
        Subcategorías
      </legend>
      {subcategories.length > 0 && (
        <div className='space-y-2'>
          {subcategories.map(({ name, emoji }) => {
            const lvl = levels[name] ?? 0;
            const active = lvl > 0;
            return (
              <div key={name} className={`flex items-center gap-3 transition-opacity ${active ? '' : 'opacity-40'}`}>
                <span className='text-lg w-6 text-center'>{emoji || '•'}</span>
                <span className='text-sm w-16 text-slate-700 dark:text-slate-200'>{name}</span>
                <input
                  type='range'
                  min='0'
                  max='5'
                  step='1'
                  value={lvl}
                  onChange={(e) => onLevelChange(name, Number(e.target.value))}
                  className='flex-1 accent-blue-500'
                />
                <span className='text-xs w-4 text-right text-slate-500 dark:text-slate-400 tabular-nums'>{lvl}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className='flex gap-2'>
        <input
          className='w-12 rounded-md border border-slate-300 bg-white text-center text-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800'
          value={newEmoji}
          onChange={(e) => onNewEmojiChange(e.target.value)}
          placeholder='😊'
          maxLength={2}
        />
        <input
          className={inputClass}
          value={newInput}
          onChange={(e) => onNewInputChange(e.target.value)}
          placeholder='Nueva subcategoría…'
          autoComplete='off'
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
        />
        <button
          type='button'
          onClick={onAdd}
          className='shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition'
        >
          Agregar
        </button>
      </div>
    </fieldset>
  );
}
