export default function OptionGroup({ title, options, selected, onToggle }) {
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
