import { cn } from '../../utils/cn.js';

/** Circular progress; `value` is 0..1. */
export default function ProgressRing({ value, size = 120, stroke = 10, className, children, label, colorClass = 'text-brand-600 dark:text-brand-400' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }} role="img" aria-label={label || `${Math.round(v * 100)}% complete`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          className={cn('fill-none stroke-current transition-[stroke-dashoffset] duration-700', colorClass)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
