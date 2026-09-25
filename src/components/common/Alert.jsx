import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const TONES = {
  info: { cls: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-100', icon: Info },
  warning: { cls: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100', icon: TriangleAlert },
  error: { cls: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100', icon: CircleAlert },
  success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100', icon: CircleCheck },
};

export default function Alert({ tone = 'info', title, children, onDismiss, action, className }) {
  const { cls, icon: Icon } = TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-2xl border p-3.5 text-sm', cls, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="opacity-90">{children}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-m-1 h-8 w-8 shrink-0 rounded-lg p-1.5 opacity-70 hover:opacity-100" aria-label="Dismiss">
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
