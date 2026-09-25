import { cn } from '../../utils/cn.js';

export default function ProgressBar({ value, max = 100, label, className, barClassName, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn('w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2', className)}
    >
      <div className={cn('h-full rounded-full bg-brand-600 transition-[width] duration-500 dark:bg-brand-500', barClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
