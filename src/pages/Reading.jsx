import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Clock, Square, Volume2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Quiz from '../components/common/Quiz.jsx';
import { READINGS } from '../data/readings.js';
import { useApp } from '../context/AppContext.jsx';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { scoreColor } from '../utils/levels.js';
import { cn } from '../utils/cn.js';
import StickyActions from '../components/common/StickyActions.jsx';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

function ArticleList() {
  const { state } = useApp();
  const [level, setLevel] = useState(LEVELS.includes(state.profile.level) ? state.profile.level : 'B1');
  const best = {};
  state.sessions.filter((s) => s.type === 'reading' && s.details?.articleId).forEach((s) => {
    best[s.details.articleId] = Math.max(best[s.details.articleId] || 0, s.score);
  });
  const list = READINGS.filter((r) => r.level === level);
  return (
    <div>
      <PageHeader title="Reading Practice" subtitle="Short articles at your level, with questions" icon={BookOpen} />
      <ChoiceGroup label="Level" hideLabel className="mb-4" options={LEVELS.map((l) => ({ id: l, label: l === state.profile.level ? `${l} · Your level` : l }))} value={level} onChange={setLevel} />
      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((r) => (
          <li key={r.id}>
            <Link to={`/reading/${r.id}`} className="flex h-full items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5"><Badge tone="brand">{r.level}</Badge><Badge>{r.topic}</Badge></div>
                <h2 className="mt-2 font-semibold">{r.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{r.paragraphs[0]}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="size-3.5" aria-hidden="true" />{r.minutes} min read · {r.questions.length} questions
                  {best[r.id] != null && <> · Best: <span className={cn('font-semibold', scoreColor(best[r.id]))}>{best[r.id]}%</span></>}
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

function Article({ article }) {
  const { recordSession } = useApp();
  const tts = useTextToSpeech();
  const [stage, setStage] = useState('read');
  const startedAt = useRef(Date.now());
  const others = READINGS.filter((r) => r.level === article.level && r.id !== article.id);

  const complete = (graded) => {
    recordSession({
      type: 'reading',
      title: article.title,
      durationSec: (Date.now() - startedAt.current) / 1000,
      score: graded.score,
      skills: { reading: graded.score },
      details: { articleId: article.id, level: article.level, correct: graded.correct, total: graded.total, results: graded.results },
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={article.title} subtitle={`${article.level} · ${article.topic} · ${article.minutes} min`} back="/reading" />
      {stage === 'read' ? (
        <div className="space-y-5">
          <Card>
            <div className="mb-3 flex justify-end">
              {tts.supported && (tts.speaking ? (
                <Button size="sm" variant="outline" icon={Square} onClick={tts.cancel}>Stop</Button>
              ) : (
                <Button size="sm" variant="secondary" icon={Volume2} onClick={() => tts.speak(article.paragraphs.join(' '), { rate: 0.9 })}>Listen</Button>
              ))}
            </div>
            <div className="space-y-4 text-[17px] leading-relaxed">
              {article.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
          </Card>
          <Card>
            <CardTitle>Key words</CardTitle>
            <dl className="space-y-2 text-sm">
              {article.glossary.map((g) => (
                <div key={g.word} className="flex gap-2"><dt className="font-semibold">{g.word}:</dt><dd className="text-slate-600 dark:text-slate-400">{g.meaning}</dd></div>
              ))}
            </dl>
          </Card>
          <StickyActions>
            <Button size="lg" block onClick={() => { tts.cancel(); setStage('quiz'); }}>I’ve finished reading — answer questions</Button>
          </StickyActions>
        </div>
      ) : (
        <div>
          <details className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <summary className="cursor-pointer font-semibold">Show the article again</summary>
            <div className="mt-2 space-y-2 text-slate-700 dark:text-slate-300">{article.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
          </details>
          <Quiz questions={article.questions} mode="quiz" onComplete={complete} onRetry={() => (startedAt.current = Date.now())} />
          {others.length > 0 && (
            <p className="mt-6 text-center text-sm">Next: <Link to={`/reading/${others[0].id}`} onClick={() => setStage('read')} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">{others[0].title}</Link></p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Reading() {
  const { articleId } = useParams();
  if (!articleId) return <ArticleList />;
  const article = READINGS.find((r) => r.id === articleId);
  if (!article) return <EmptyState title="Article not found" action={<Button to="/reading">All articles</Button>} />;
  return <Article key={article.id} article={article} />;
}
