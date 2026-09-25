import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

export default function PageHeader({ title, subtitle, back, actions, icon: Icon }) {
  useDocumentTitle(title);
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {back && (
          <Link to={back} className="-ml-1 mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Go back">
            <ArrowLeft className="size-5" />
          </Link>
        )}
        {Icon && !back && (
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" aria-hidden="true">
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
