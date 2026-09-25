import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CircleCheck, Lightbulb, RotateCcw, X } from 'lucide-react';
import Badge, { DemoBadge } from './Badge.jsx';
import Button from './Button.jsx';
import { categoryLabel } from '../../services/engine/grammarRules.js';
import { cn } from '../../utils/cn.js';

export function practiceLinkFor(m) {
  if (m.category === 'pronunciation') return m.sound ? `/pronunciation?sound=${m.sound}` : '/pronunciation';
  if (m.topic) return `/grammar/${m.topic}?mode=practice`;
  if (m.category === 'vocabulary') return '/vocabulary';
  if (m.category === 'pace') return '/speed';
  if (m.category === 'spelling' || m.category === 'punctuation') return '/writing';
  return '/grammar';
}

/** What you said → correct version → why → quick practice question. */
export default function MistakeCard({ mistake, onMaster, onDelete, compact }) {
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(null);
  const m = mistake;
  const reasons = m.reasons?.length > 1 ? m.reasons : null;
  const isPace = m.category === 'pace';

  const check = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    const norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, '').replace(/\s+/g, ' ').trim();
    setChecked(norm(answer) === norm(m.practice.answer));
  };

  return (
    <article className={cn('rounded-2xl border bg-white p-4 shadow-soft dark:bg-slate-900', m.mastered ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-slate-200/80 dark:border-slate-800')}>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(m.categories?.length ? m.categories : [m.category]).map((c) => (
          <Badge key={c} tone="brand">{m.sound && c === 'pronunciation' ? `Pronunciation · ${m.sound.toUpperCase()}` : categoryLabel(c)}</Badge>
        ))}
        {m.count > 1 && <Badge tone="warning">Repeated {m.count}×</Badge>}
        {m.mastered && <Badge tone="success" icon={CircleCheck}>Mastered</Badge>}
        {m.demo && <DemoBadge label="Sample" />}
      </div>
      <dl className="space-y-2 text-[15px]">
        <div className="flex gap-2">
          <X className="mt-1 size-4 shrink-0 text-rose-500" aria-hidden="true" />
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{isPace ? 'Issue' : 'What you said'}</dt>
            <dd className={cn('text-slate-700 dark:text-slate-300', !isPace && 'line-through decoration-rose-400/60')}>{m.said}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Check className="mt-1 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{isPace ? 'Target' : 'Correct'}</dt>
            <dd className="font-semibold text-emerald-700 dark:text-emerald-300">{m.correct}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Lightbulb className="mt-1 size-4 shrink-0 text-amber-500" aria-hidden="true" />
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{isPace ? 'Tip' : 'Why'}</dt>
            {reasons ? (
              <dd>
                <ul className="list-disc space-y-1 pl-4 text-slate-600 dark:text-slate-300">
                  {reasons.map((r) => <li key={r.why}><span className="font-medium">{r.label}:</span> {r.why}</li>)}
                </ul>
              </dd>
            ) : (
              <dd className="text-slate-600 dark:text-slate-300">{m.why}</dd>
            )}
          </div>
        </div>
      </dl>

      {!compact && m.practice && (
        <form onSubmit={check} className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <label htmlFor={`p-${m.id}`} className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Quick practice</label>
          <p className="mt-1 text-sm font-medium">{m.practice.question}</p>
          <div className="mt-2 flex gap-2">
            <input
              id={`p-${m.id}`}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setChecked(null);
              }}
              placeholder="Your answer"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <Button type="submit" variant="secondary" disabled={!answer.trim()}>Check</Button>
          </div>
          {checked !== null && (
            <p role="status" className={cn('mt-2 text-sm font-medium', checked ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
              {checked ? 'Correct! Well done.' : `Not quite. Answer: “${m.practice.answer}”`}
            </p>
          )}
        </form>
      )}

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button to={practiceLinkFor(m)} size="sm" variant="primary" icon={RotateCcw}>Practice again</Button>
          {onMaster && (
            <Button size="sm" variant={m.mastered ? 'outline' : 'secondary'} icon={CircleCheck} onClick={() => onMaster(m)}>
              {m.mastered ? 'Mark as not mastered' : 'I’ve got it'}
            </Button>
          )}
          {onDelete && <Button size="sm" variant="ghost" onClick={() => onDelete(m)} aria-label="Remove this mistake">Remove</Button>}
        </div>
      )}
      {compact && (
        <Link to={practiceLinkFor(m)} className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Practice this →</Link>
      )}
    </article>
  );
}
