import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 dark:disabled:bg-brand-900',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};
const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-6 text-base gap-2 rounded-2xl',
};

export default function Button({ to, href, variant = 'primary', size = 'md', block, loading, icon: Icon, iconRight: IconRight, className, children, ...props }) {
  const classes = cn(
    'inline-flex select-none items-center justify-center font-semibold transition-colors disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    block && 'w-full',
    className,
  );
  const content = (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="size-[1.1em] shrink-0" aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className="size-[1.1em] shrink-0" aria-hidden="true" />}
    </>
  );
  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{content}</a>;
  return (
    <button type="button" className={classes} disabled={loading || props.disabled} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
