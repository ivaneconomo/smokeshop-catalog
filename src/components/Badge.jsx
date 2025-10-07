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

  const base = 'text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm border';

  return (
    <span
      className={`${c.bg} ${c.text} ${base} ${c.border} ${className}`}
      role='status'
      aria-label={`badge-${color}`}
    >
      {children}
    </span>
  );
}
