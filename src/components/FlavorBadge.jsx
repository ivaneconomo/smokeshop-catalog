// components/FlavorBadge.jsx
import { flavorColorMap } from '../utils/products';

export default function FlavorBadge({
  name,
  color = 'slate',
  isAvailable,
  title,
  disabled,
  onClick,
  children,
}) {
  if (!flavorColorMap[color]) color = 'slate';
  const c = flavorColorMap[color];

  const base =
    // centrado vertical (items-center), alineado a la izquierda (justify-start, text-left)
    'flex items-center justify-start text-left leading-snug ' +
    'px-2.5 py-1 rounded-sm border md:text-md transition h-full select-none';

  const on = `${c.bg} ${c.text} ${c.border} ${c.darkBg} ${c.darkText} ${c.darkBorder}`;
  const off =
    'bg-slate-200 text-slate-500 border-slate-300 ' +
    'dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600 opacity-40 line-through';

  return (
    <span
      className={`${base} ${isAvailable ? on : off}`}
      title={title}
      aria-disabled={disabled}
      role='status'
      onClick={disabled ? undefined : onClick}
    >
      <span>{children ?? name}</span>
    </span>
  );
}
