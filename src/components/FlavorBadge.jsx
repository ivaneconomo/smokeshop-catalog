// components/FlavorBadge.jsx
import { flavorColorMap } from '../utils/products';

export default function FlavorBadge({
  name,
  color = 'slate',
  isAvailable,
  title,
}) {
  if (!flavorColorMap[color]) color = 'slate';
  const c = flavorColorMap[color];

  const base =
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border  md:text-md transition';
  const on = `${c.bg} ${c.text} ${c.border} ${c.darkBg} ${c.darkText} ${c.darkBorder}`;
  const off =
    'bg-slate-200 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600 opacity-40 line-through';

  return (
    <span
      className={`${base} ${isAvailable ? on : off}`}
      title={title}
      aria-disabled={!isAvailable}
      role='status'
    >
      {name}
      {!isAvailable && <span className='sr-only'>(no disponible)</span>}
    </span>
  );
}
