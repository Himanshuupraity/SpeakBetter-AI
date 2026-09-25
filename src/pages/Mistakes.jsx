import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import MistakeCard, { practiceLinkFor } from '../components/common/MistakeCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { categoryLabel } from '../services/engine/grammarRules.js';

const SOURCES = [
  { id: 'all', label: 'All sources' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'writing', label: 'Writing' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'pronunciation', label: 'Pronunciation' },
  { id: 'speed', label: 'Speaking speed' },
];

export default function Mistakes() {
  const { state, stats, updateMistake, deleteMistake } = useApp();
  const toast = useToast();
  const [status, setStatus] = useState('open');
  const [source, setSource] = useState('all');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => [...new Set(state.mistakes.map((m) => m.category))], [state.mistakes]);
  const list = state.mistakes
    .filter((m) => (status === 'open' ? !m.mastered : status === 'mastered' ? m.mastered : true))
    .filter((m) => source === 'all' || m.source === source)
    .filter((m) => category === 'all' || m.category === category || m.categories?.includes(category))
    .sort((a, b) => (b.count || 1) - (a.count || 1) || new Date(b.lastSeen) - new Date(a.lastSeen));

  const top = stats.weakAreas.slice(0, 5);

  return (
    <div>
      <PageHeader title="My Mistakes" subtitle="Every mistake is a lesson — practise them until they’re gone" icon={Target} />
      {state.mistakes.length === 0 ? (
        <EmptyState icon={Target} title="No mistakes collected yet" action={<Button to="/speak">Talk with Emma</Button>}>
          Mistakes from speaking, writing, grammar quizzes, vocabulary and pronunciation will be collected here automatically.
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-5 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardTitle>Your top weak areas</CardTitle>
              {top.length ? (
                <ol className="space-y-1">
                  {top.map((w, i) => (
                    <li key={w.key}>
                      <Link to={practiceLinkFor({ category: w.category, sound: w.sound, topic: w.topic })} className="flex min-h-12 items-center gap-3 rounded-xl px-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-rose-50 text-sm font-bold text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">{i + 1}</span>
                        <span className="flex-1 font-medium">{w.label}</span>
                        <span className="text-sm text-slate-500">{w.count}×</span>
                        <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">You’ve mastered all your mistakes. Brilliant! 🎉</p>
              )}
            </Card>
            <Card className="grid grid-cols-2 gap-3 text-center">
              <div><p className="text-2xl font-bold">{stats.openMistakes}</p><p className="text-xs text-slate-500">To practise</p></div>
              <div><p className="text-2xl font-bold text-emerald-600">{stats.mistakesCorrected}</p><p className="text-xs text-slate-500">Mastered</p></div>
            </Card>
          </div>

          <div>
            <div className="mb-3 space-y-3">
              <ChoiceGroup label="Status" hideLabel options={[{ id: 'open', label: 'To practise' }, { id: 'mastered', label: 'Mastered' }, { id: 'all', label: 'All' }]} value={status} onChange={setStatus} />
              <div className="flex flex-wrap gap-2">
                <label className="sr-only" htmlFor="src">Source</label>
                <select id="src" value={source} onChange={(e) => setSource(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                  {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <label className="sr-only" htmlFor="cat">Category</label>
                <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <option value="all">All categories</option>
                  {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select>
              </div>
            </div>
            {list.length ? (
              <div className="space-y-3">
                {list.map((m) => (
                  <MistakeCard
                    key={m.id}
                    mistake={m}
                    onMaster={(x) => {
                      updateMistake(x.id, { mastered: !x.mastered });
                      if (!x.mastered) toast.show('Nice! Marked as mastered (+5 XP).', { type: 'success' });
                    }}
                    onDelete={(x) => {
                      deleteMistake(x.id);
                      toast.show('Mistake removed.', { type: 'info' });
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Nothing here">No mistakes match these filters.</EmptyState>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
