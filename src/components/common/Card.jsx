import { cn } from '../../utils/cn.js';

export default function Card({ as: Tag = 'div', className, padded = true, children, ...props }) {
  return (
    <Tag className={cn('rounded-2xl border border-slate-200/80 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900', padded && 'p-4 sm:p-5', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardTitle({ icon: Icon, children, action, className }) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        {Icon && <Icon className="size-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />}
        {children}
      </h2>
      {action}
    </div>
  );
}
