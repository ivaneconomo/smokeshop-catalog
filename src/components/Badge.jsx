// src/components/ColorBadge.jsx
import { COLOR_MAP } from '../utils/colorMap';

/**
 * Props:
 *  - color: la key guardada en DB ('red', 'blue', etc.)
 *  - children: texto del badge
 *  - className: clases extra
 */
export default function ColorBadge({
  color = 'neutral',
  children,
  className = '',
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.neutral; // fallback

  const base =
    'text-xs text-center border p-[0.5px] rounded-md flex items-center justify-center';

  return (
    <span
      className={`${c.light} ${c.dark} ${base} ${className}`}
      role='status'
      aria-label={`badge-${color}`}
    >
      {children}
    </span>
  );
}
