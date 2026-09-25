import { cn } from '../../utils/cn.js';

export default function StatTile({ icon: Icon, label, value, hint, className, iconClass = 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300' }) {
  return (
    <div className={cn('min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-soft dark:border-slate-800 dark:bg-slate-900', className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', iconClass)} aria-hidden="true">
            <Icon className="size-4.5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs leading-tight font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg leading-tight font-bold break-words tabular-nums">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
