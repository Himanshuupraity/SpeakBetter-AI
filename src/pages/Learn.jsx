import { Link } from 'react-router-dom';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import { NAV_GROUPS } from '../components/layout/navigation.js';

const DESCRIPTIONS = {
  '/daily': 'Your personalised plan for today',
  '/speak': 'Talk with Emma and get a full report',
  '/conversation': 'Role-play real-life situations',
  '/pronunciation': 'Practise difficult sounds',
  '/speed': 'Are you speaking too fast or too slowly?',
  '/grammar': '14 topics with quizzes',
  '/vocabulary': 'Daily words, flashcards & review',
  '/writing': 'Emails, messages & bug reports',
  '/reading': 'Articles from A1 to C1',
  '/listening': 'Conversations & short talks',
  '/mistakes': 'Review and fix your weak areas',
  '/history': 'All your past sessions',
};

/** Mobile hub for every practice section. */
export default function Learn() {
  const groups = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => DESCRIPTIONS[i.to]) })).filter((g) => g.items.length);
  return (
    <div>
      <PageHeader title="Learn & Practise" subtitle="Everything in one place" icon={LayoutGrid} />
      <div className="space-y-5">
        {groups.map((g) => (
          <section key={g.label} aria-labelledby={`g-${g.label}`}>
            <h2 id={`g-${g.label}`} className="mb-2 px-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">{g.label}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-soft hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><item.icon className="size-5" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{item.label}</span>
                      <span className="block text-sm text-slate-500">{DESCRIPTIONS[item.to]}</span>
                    </span>
                    <ChevronRight className="size-5 text-slate-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
