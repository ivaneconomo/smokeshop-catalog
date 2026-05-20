import { inputClass } from '../../utils/formStyles';

export default function SubcategorySelector({
  subcategories,
  levels,
  onLevelChange,
  newInput,
  onNewInputChange,
  newEmoji,
  onNewEmojiChange,
  onAdd,
}) {
  return (
    <fieldset className='space-y-3'>
      <legend className='text-sm font-medium text-slate-700 dark:text-slate-200'>
        Efectos
      </legend>
      {subcategories.length > 0 && (
        <div className='space-y-2'>
          {subcategories.map(({ name, emoji }) => {
            const lvl = levels[name] ?? 0;
            return (
              <div
                key={name}
                className={`flex items-center gap-3 transition-opacity ${lvl > 0 ? '' : 'opacity-40'}`}
              >
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
                <span className='text-xs w-4 text-right text-slate-500 dark:text-slate-400 tabular-nums'>
                  {lvl}
                </span>
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
          placeholder='Nuevo efecto…'
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
