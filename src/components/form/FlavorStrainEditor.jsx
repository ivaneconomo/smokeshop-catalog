import { useState } from 'react';
import { inputClass } from '../../utils/formStyles';
import { getRandomFlavorColor } from '../../utils/products';

export const STRAIN_CHIP_CLASS = {
  Hybrid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Sativa: 'bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300',
  Indica: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};
const DEFAULT_CHIP = 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';

export function strainChipClass(strain) {
  return STRAIN_CHIP_CLASS[strain] ?? DEFAULT_CHIP;
}

export default function FlavorStrainEditor({ flavors, strains, onChange }) {
  const [newName, setNewName] = useState('');
  const [newStrain, setNewStrain] = useState('');

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    onChange([...flavors, { name, strain: newStrain, color: getRandomFlavorColor() }]);
    setNewName('');
    setNewStrain('');
  };

  const remove = (idx) => onChange(flavors.filter((_, i) => i !== idx));

  const updateStrain = (idx, strain) =>
    onChange(flavors.map((f, i) => (i === idx ? { ...f, strain } : f)));

  return (
    <fieldset className='space-y-3'>
      <legend className='text-sm font-medium text-slate-700 dark:text-slate-200'>
        Sabores
      </legend>

      {flavors.length > 0 && (
        <ul className='space-y-1.5'>
          {flavors.map((f, i) => (
            <li key={i} className='flex items-center gap-2'>
              <span className='flex-1 text-sm text-slate-800 dark:text-slate-200 truncate'>
                {f.name}
              </span>
              {strains.length > 0 && (
                <select
                  value={f.strain ?? ''}
                  onChange={(e) => updateStrain(i, e.target.value)}
                  className='rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                >
                  <option value=''>— strain —</option>
                  {strains.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              <button
                type='button'
                onClick={() => remove(i)}
                className='text-slate-400 hover:text-rose-500 transition text-lg leading-none'
                aria-label='Eliminar'
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className='flex gap-2'>
        <input
          className={inputClass}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder='Nombre del sabor…'
          autoComplete='off'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        {strains.length > 0 && (
          <select
            value={newStrain}
            onChange={(e) => setNewStrain(e.target.value)}
            className='rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
          >
            <option value=''>strain</option>
            {strains.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <button
          type='button'
          onClick={add}
          className='shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition'
        >
          Agregar
        </button>
      </div>
    </fieldset>
  );
}
