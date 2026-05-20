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
    'flex items-center justify-start text-left leading-snug ' +
    'px-2.5 py-1 rounded-sm border md:text-md transition h-full select-none w-full';

  const on = `${c.bg} ${c.text} ${c.border} ${c.darkBg} ${c.darkText} ${c.darkBorder}`;
  const off =
    'bg-slate-200 text-slate-500 border-slate-300 ' +
    'dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600 opacity-40 line-through';

  return (
    <div
      className={`${base} ${isAvailable ? on : off}`}
      title={title}
      aria-disabled={disabled}
      role='status'
      onClick={disabled ? undefined : onClick}
    >
      <div className="w-full flex items-center">{children ?? name}</div>
    </div>
  );
}