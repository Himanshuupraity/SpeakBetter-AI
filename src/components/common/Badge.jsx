import { cn } from '../../utils/cn.js';

const TONES = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

export default function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function DemoBadge({ className, label = 'Demo data' }) {
  return (
    <Badge tone="warning" className={className}>
      <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      {label}
    </Badge>
  );
}
