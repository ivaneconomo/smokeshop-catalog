import { useEffect, useMemo, useRef, useState } from 'react';
import { getEffects } from '../services/api';
import { inputClass, labelClass } from '../utils/formStyles';
import { getRandomFlavorColor } from '../utils/products';
import ChecklistSelector from './form/ChecklistSelector';
import CloudinaryUpload from './form/CloudinaryUpload';
import FlavorStrainEditor from './form/FlavorStrainEditor';
import Toggle from './form/Toggle';
import SubcategorySelector from './form/SubcategorySelector';

const parseNames = (value) =>
  value
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);

/**
 * Shared form body for creating and editing products.
 *
 * Props:
 *   mode            'create' | 'edit'  — controls availability init and placeholder copy
 *   initialValues   object             — pre-filled values (for edit mode)
 *   stores          array              — needed to build available_location in create mode
 *   productTypes    array
 *   strains         array
 *   onSubmit        async (payload, subcategories) => void  — called with built payload
 *   submitLabel     string
 *   onCancel        () => void | undefined
 */
export default function ProductForm({
  mode = 'create',
  initialValues = {},
  stores = [],
  productTypes = [],
  strains = [],
  onSubmit,
  submitLabel = 'Guardar',
  onCancel,
}) {
  const [kind, setKind] = useState(initialValues.kind ?? '');
  const [brand, setBrand] = useState(initialValues.brand ?? '');
  const [model, setModel] = useState(initialValues.model ?? '');
  const [image, setImage] = useState(initialValues.image ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [minPrice, setMinPrice] = useState(initialValues.minPrice ?? '');
  const [suggestedPrice, setSuggestedPrice] = useState(initialValues.suggestedPrice ?? '');
  const [flavorNames, setFlavorNames] = useState(initialValues.flavorNames ?? '');
  const [flavorList, setFlavorList] = useState(initialValues.flavorList ?? []);
  const [puffs, setPuffs] = useState(initialValues.puffs ?? '');
  const [grams, setGrams] = useState(initialValues.grams ?? '');
  const [selectedStrains, setSelectedStrains] = useState(initialValues.selectedStrains ?? []);
  const [localStrains, setLocalStrains] = useState(strains);
  const [newStrainInput, setNewStrainInput] = useState('');
  const [weightG, setWeightG] = useState(initialValues.weightG ?? '');
  const [servings, setServings] = useState(initialValues.servings ?? '');
  const [dosageMg, setDosageMg] = useState(initialValues.dosageMg ?? '');
  const [selectedComponents, setSelectedComponents] = useState(initialValues.selectedComponents ?? []);
  const [localComponents, setLocalComponents] = useState([]);
  const [newComponentInput, setNewComponentInput] = useState('');
  const [effectLevels, setEffectLevels] = useState(initialValues.effectLevels ?? {});
  const [newEffectInput, setNewEffectInput] = useState('');
  const [newEffectEmoji, setNewEffectEmoji] = useState('');
  const [effects, setEffects] = useState([]);
  const [onSale, setOnSale] = useState(initialValues.onSale ?? false);
  const [onFeatured, setOnFeatured] = useState(initialValues.onFeatured ?? false);
  const [submitting, setSubmitting] = useState(false);

  // Loads effects list and merges with any pre-existing levels from initialValues.
  useEffect(() => {
    getEffects()
      .then((d) => {
        const list = d.subcategories ?? [];
        setEffects(list);
        const base = Object.fromEntries(list.map(({ name }) => [name, 0]));
        setEffectLevels((prev) => ({ ...base, ...prev }));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sets default kind when productTypes load (create mode only — edit passes a non-empty kind).
  useEffect(() => {
    if (productTypes.length > 0 && !kind) {
      setKind(productTypes[0].value);
    }
  }, [productTypes, kind]);

  // Syncs component checkboxes when kind or productTypes changes.
  // Uses two refs to distinguish "first load" from "user changed kind".
  const componentsSyncedRef = useRef(false);
  const prevKindRef = useRef(kind);
  useEffect(() => {
    const kindDef = productTypes.find((t) => t.value === kind);
    if (!kindDef) return;

    const kindChanged = prevKindRef.current !== kind;
    prevKindRef.current = kind;

    if (!componentsSyncedRef.current) {
      // First valid run: populate from initialValues
      componentsSyncedRef.current = true;
      setLocalComponents(kindDef.components);
      setSelectedComponents(initialValues.selectedComponents ?? []);
      return;
    }

    // Only reset when the user explicitly changed the kind, not when productTypes refreshes
    if (kindChanged) {
      setLocalComponents(kindDef.components);
      setSelectedComponents([]);
    }
  // initialValues.selectedComponents intentionally omitted — it's only used on first sync
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, productTypes]);

  const kindDef = useMemo(
    () => productTypes.find((t) => t.value === kind) ?? null,
    [productTypes, kind],
  );

  const hasField = (field) => kindDef?.fields?.includes(field) ?? false;

  const availabilityForStores = () =>
    Object.fromEntries(stores.map((s) => [s.id, { available: true, quantity: 0 }]));

  const handleKindChange = (newKind) => {
    setKind(newKind);
    setPuffs('');
    setGrams('');
    setSelectedStrains([]);
    setFlavorNames('');
    setWeightG('');
    setServings('');
    setDosageMg('');
  };

  const toggleComponent = (key) =>
    setSelectedComponents((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const toggleStrain = (strain) =>
    setSelectedStrains((prev) =>
      prev.includes(strain) ? prev.filter((s) => s !== strain) : [...prev, strain],
    );

  const setEffectLevel = (name, level) =>
    setEffectLevels((prev) => ({ ...prev, [name]: level }));

  const addEffect = () => {
    const name = newEffectInput.trim();
    const emoji = newEffectEmoji.trim();
    if (!name) return;
    if (!effects.find((s) => s.name === name)) {
      setEffects((prev) =>
        [...prev, { name, emoji }].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }
    setEffectLevels((prev) => ({ ...prev, [name]: prev[name] ?? 3 }));
    setNewEffectInput('');
    setNewEffectEmoji('');
  };

  const addComponent = () => {
    const label = newComponentInput.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/\s+/g, '_');
    if (!localComponents.find((c) => c.key === key)) {
      setLocalComponents((prev) =>
        [...prev, { key, label }].sort((a, b) => a.label.localeCompare(b.label)),
      );
    }
    setSelectedComponents((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setNewComponentInput('');
  };

  const addStrain = () => {
    const name = newStrainInput.trim();
    if (!name) return;
    if (!localStrains.includes(name)) {
      setLocalStrains((prev) => [...prev, name].sort());
    }
    setSelectedStrains((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setNewStrainInput('');
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
      subcategories: Object.entries(effectLevels)
        .filter(([, lvl]) => lvl > 0)
        .map(([name, level]) => ({ name, level })),
      on_sale: onSale,
      on_featured: onFeatured,
    };

    if (mode === 'create') base.available = true;

    if (hasField('puffs') && hasField('flavors')) {
      // Nicotine: entrada masiva por textarea, sin strain
      const existingColorMap = Object.fromEntries(
        (initialValues.flavorList ?? []).map((f) => [f.name.toLowerCase(), f.color])
      );
      base.flavors = parseNames(flavorNames).map((name) => ({
        name,
        color: existingColorMap[name.toLowerCase()] || getRandomFlavorColor(),
        ...(mode === 'create' && { available_location: availabilityForStores() }),
      }));
    } else if (hasField('grams') || hasField('dosage_mg')) {
      // Kits y Edibles: lista estructurada con strain por sabor
      base.flavors = flavorList.map(({ name, strain, color }) => ({
        name,
        color: color || getRandomFlavorColor(),
        ...(strain && { strain }),
        ...(mode === 'create' && { available_location: availabilityForStores() }),
      }));
    }

    if (hasField('puffs')) base.puffs = Number(puffs || 0);
    if (hasField('grams')) base.grams = Number(grams || 0);

    if (hasField('strains')) {
      base.strains = selectedStrains.map((name) => ({
        name,
        ...(mode === 'create' && { available_location: availabilityForStores() }),
      }));
    }

    if (hasField('weight_g')) base.weight_g = Number(weightG || 0);
    if (hasField('servings')) base.servings = Number(servings || 1);
    if (hasField('dosage_mg')) base.dosage_mg = Number(dosageMg || 0);
    if (hasField('components')) {
      base.components = Object.fromEntries(
        localComponents.map((c) => [c.key, selectedComponents.includes(c.key)]),
      );
    }

    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const updatedProductTypes = productTypes.map((t) =>
      t.value === kind ? { ...t, components: localComponents } : t,
    );
    try {
      await onSubmit(buildPayload(), {
        effects,
        strains: localStrains,
        productTypes: updatedProductTypes,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            {productTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Imagen
          <CloudinaryUpload value={image} onChange={setImage} />
        </label>

        <label className={labelClass}>
          Marca
          <input
            className={inputClass}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            placeholder={mode === 'create' ? 'Geek Bar' : undefined}
          />
        </label>

        <label className={labelClass}>
          Producto
          <input
            className={inputClass}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            placeholder={mode === 'create' ? 'Pulse X' : undefined}
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
        subcategories={effects}
        levels={effectLevels}
        onLevelChange={setEffectLevel}
        newInput={newEffectInput}
        onNewInputChange={setNewEffectInput}
        newEmoji={newEffectEmoji}
        onNewEmojiChange={setNewEffectEmoji}
        onAdd={addEffect}
      />

      {hasField('puffs') && (
        <div className='grid gap-3 sm:grid-cols-[1fr_2fr]'>
          <label className={labelClass}>
            Puffs
            <input
              type='number'
              className={inputClass}
              value={puffs}
              onChange={(e) => setPuffs(e.target.value)}
              placeholder='Ej: 12000'
              min='0'
            />
          </label>
          <label className={labelClass}>
            Sabores
            <textarea
              className={inputClass}
              rows='3'
              value={flavorNames}
              onChange={(e) => setFlavorNames(e.target.value)}
              placeholder={
                mode === 'create'
                  ? 'Blue Razz, Miami Mint, Watermelon Ice'
                  : 'Un sabor por línea o separados por coma'
              }
            />
          </label>
        </div>
      )}

      {hasField('grams') && (
        <div className='space-y-4'>
          <label className={labelClass}>
            Gramos
            <input
              type='number'
              className={inputClass}
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder='Ej: 3'
              min='0'
              step='0.5'
            />
          </label>

          {hasField('strains') && (
            <ChecklistSelector
              title='Strains'
              items={localStrains.map((s) => ({ key: s, label: s }))}
              selected={selectedStrains}
              onToggle={toggleStrain}
              newInput={newStrainInput}
              onNewInputChange={setNewStrainInput}
              onAdd={addStrain}
            />
          )}

          {hasField('components') && (
            <ChecklistSelector
              title='Componentes'
              items={localComponents}
              selected={selectedComponents}
              onToggle={toggleComponent}
              newInput={newComponentInput}
              onNewInputChange={setNewComponentInput}
              onAdd={addComponent}
            />
          )}

          <FlavorStrainEditor
            flavors={flavorList}
            strains={localStrains}
            onChange={setFlavorList}
          />
        </div>
      )}

      {hasField('dosage_mg') && (
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

          <FlavorStrainEditor
            flavors={flavorList}
            strains={localStrains}
            onChange={setFlavorList}
          />

          {hasField('components') && (
            <ChecklistSelector
              title='Componentes'
              items={localComponents}
              selected={selectedComponents}
              onToggle={toggleComponent}
              newInput={newComponentInput}
              onNewInputChange={setNewComponentInput}
              onAdd={addComponent}
            />
          )}
        </div>
      )}

      <div className='flex flex-wrap gap-3'>
        <Toggle checked={onSale} onChange={setOnSale} label='Oferta' />
        <Toggle checked={onFeatured} onChange={setOnFeatured} label='Destacado' />
      </div>

      <div className='flex justify-end gap-3'>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            className='rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
          >
            Cancelar
          </button>
        )}
        <button
          type='submit'
          disabled={submitting}
          className='rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
