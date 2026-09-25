import { Link } from 'react-router-dom';
import { AudioLines, BookA, BookOpen, CircleCheck, GraduationCap, Headphones, Mic, PenLine } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const ICONS = { speaking: Mic, vocabulary: BookA, grammar: GraduationCap, listening: Headphones, writing: PenLine, pronunciation: AudioLines, reading: BookOpen };
const TINTS = {
  speaking: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  vocabulary: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  grammar: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  listening: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  writing: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  pronunciation: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  reading: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
};

export default function RecommendedPractice({ tasks }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {tasks.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <li key={t.id}>
            <Link to={t.to} className={cn('flex h-full items-start gap-3 rounded-2xl border p-3.5 transition-colors hover:border-brand-300 dark:hover:border-brand-500/50', t.done ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900')}>
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', TINTS[t.type])} aria-hidden="true"><Icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold">
                  {t.title} <span className="font-normal text-slate-500">· {t.minutes} min</span>
                  {t.done && <CircleCheck className="size-4 text-emerald-600" aria-label="Done today" />}
                </p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{t.reason}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
