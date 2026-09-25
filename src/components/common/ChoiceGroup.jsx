import { useId } from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Accessible single-choice group (radio semantics) rendered as chips or cards.
 * options: [{ id, label, description?, icon? }]
 */
export default function ChoiceGroup({ label, options, value, onChange, variant = 'chips', columns, className, hideLabel }) {
  const name = useId();
  return (
    <fieldset className={className}>
      <legend className={cn('mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300', hideLabel && 'sr-only')}>{label}</legend>
      <div className={cn(variant === 'chips' ? 'flex flex-wrap gap-2' : 'grid gap-2', columns)}>
        {options.map((opt) => {
          const checked = value === opt.id;
          const Icon = opt.icon;
          return (
            <label
              key={opt.id}
              className={cn(
                'relative cursor-pointer border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                variant === 'chips' ? 'inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium' : 'flex items-start gap-3 rounded-2xl p-3.5',
                checked
                  ? 'border-brand-600 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
              )}
            >
              <input type="radio" name={name} value={opt.id} checked={checked} onChange={() => onChange(opt.id)} className="sr-only" />
              {Icon && <Icon className={cn('shrink-0', variant === 'chips' ? 'size-4' : 'mt-0.5 size-5')} aria-hidden="true" />}
              {variant === 'chips' ? (
                opt.label
              ) : (
                <span className="min-w-0">
                  <span className="block font-semibold">{opt.label}</span>
                  {opt.description && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{opt.description}</span>}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
