import { inputClass } from '../../utils/formStyles';

export default function ChecklistSelector({
  title,
  items,
  selected,
  onToggle,
  newInput,
  onNewInputChange,
  onAdd,
}) {
  return (
    <fieldset className='space-y-3'>
      <legend className='text-sm font-medium text-slate-700 dark:text-slate-200'>
        {title}
      </legend>
      {items.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {items.map(({ key, label }) => (
            <button
              key={key}
              type='button'
              onClick={() => onToggle(key)}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                selected.includes(key)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className='flex gap-2'>
        <input
          className={inputClass}
          value={newInput}
          onChange={(e) => onNewInputChange(e.target.value)}
          placeholder='Nuevo…'
          autoComplete='off'
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
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
