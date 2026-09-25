import { Link } from 'react-router-dom';
import { ChevronRight, GraduationCap, TriangleAlert } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Badge from '../components/common/Badge.jsx';
import { GRAMMAR_TOPICS } from '../data/grammarTopics.js';
import { useApp } from '../context/AppContext.jsx';
import { scoreColor } from '../utils/levels.js';
import { cn } from '../utils/cn.js';

export default function Grammar() {
  const { state, stats } = useApp();
  const weakTopics = new Set(stats.weakAreas.map((w) => w.topic).filter(Boolean));
  const best = {};
  state.sessions.filter((s) => s.type === 'grammar' && s.details?.topicId).forEach((s) => {
    best[s.details.topicId] = Math.max(best[s.details.topicId] || 0, s.score);
  });

  return (
    <div>
      <PageHeader title="Grammar" subtitle="Simple explanations, examples and quizzes" icon={GraduationCap} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GRAMMAR_TOPICS.map((t) => (
          <li key={t.id}>
            <Link to={`/grammar/${t.id}`} className={cn('flex h-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-soft transition-colors hover:border-brand-300 dark:bg-slate-900 dark:hover:border-brand-500/50', weakTopics.has(t.id) ? 'border-amber-300 dark:border-amber-500/40' : 'border-slate-200/80 dark:border-slate-800')}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="font-semibold">{t.title}</h2>
                  <Badge>{t.level}</Badge>
                  {weakTopics.has(t.id) && <Badge tone="warning" icon={TriangleAlert}>Weak area</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.summary}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {t.questions.length} questions{best[t.id] != null && <> · Best: <span className={cn('font-semibold', scoreColor(best[t.id]))}>{best[t.id]}%</span></>}
                </p>
              </div>
              <ChevronRight className="mt-1 size-5 shrink-0 text-slate-400" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
