/** The post-conversation analysis report (also shown from Practice History). */
import { ArrowRight, Info, MessageSquareQuote, Mic, Sparkles, Target, ThumbsUp, TrendingUp } from 'lucide-react';
import Card, { CardTitle } from '../common/Card.jsx';
import ProgressRing from '../common/ProgressRing.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import MistakeCard from '../common/MistakeCard.jsx';
import Button from '../common/Button.jsx';
import Alert from '../common/Alert.jsx';
import EmmaAvatar from '../common/EmmaAvatar.jsx';
import { DemoBadge } from '../common/Badge.jsx';
import { SCORE_COMPONENTS } from '../../services/engine/scoring.js';
import { scoreColor } from '../../utils/levels.js';
import { cn } from '../../utils/cn.js';

const COMMON_GROUPS = [
  { label: 'Grammar mistakes', cats: ['subject-verb', 'verb-form', 'adjectives'] },
  { label: 'Verb tense', cats: ['verb-tense'] },
  { label: 'Articles', cats: ['articles'] },
  { label: 'Prepositions', cats: ['prepositions'] },
  { label: 'Plural / singular', cats: ['plural-singular'] },
  { label: 'Word order', cats: ['word-order'] },
  { label: 'Sentence formation', cats: ['sentence'] },
  { label: 'Wrong vocabulary', cats: ['vocabulary'] },
  { label: 'Pronunciation', cats: ['pronunciation'] },
];

export default function SpeakingReport({ report }) {
  const counts = report.categoryCounts || {};
  return (
    <div className="space-y-5">
      {report.fallback && <Alert tone="info">The AI analysis service was unavailable, so this report was generated in demo mode.</Alert>}

      <Card className="text-center">
        <div className="flex justify-end">{report.demo && <DemoBadge label="Demo analysis" />}</div>
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Overall score</p>
        <ProgressRing value={report.overall / 100} size={150} stroke={12} className="mx-auto mt-2" label={`Overall score ${report.overall} out of 100`} colorClass={report.overall >= 85 ? 'text-emerald-500' : report.overall >= 70 ? 'text-brand-600 dark:text-brand-400' : report.overall >= 50 ? 'text-amber-500' : 'text-rose-500'}>
          <div>
            <p className="text-4xl font-extrabold tabular-nums">{report.overall}</p>
            <p className="text-xs text-slate-500">/ 100</p>
          </div>
        </ProgressRing>
        <div className="mx-auto mt-4 flex max-w-md items-start gap-3 rounded-2xl bg-brand-50/70 p-3 text-left dark:bg-brand-500/10">
          <EmmaAvatar size="sm" />
          <p className="text-[15px] text-slate-700 dark:text-slate-200">{report.summary}</p>
        </div>
        {!report.reliable && <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">This was a short conversation, so the score is less reliable. Longer sessions give better feedback.</p>}
      </Card>

      <Card>
        <CardTitle icon={TrendingUp}>Score breakdown</CardTitle>
        <ul className="space-y-3.5">
          {SCORE_COMPONENTS.map((c) => {
            const pts = report.breakdown?.[c.id];
            const pct = report.percentages?.[c.id];
            return (
              <li key={c.id}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{c.label}</span>
                  <span className={cn('font-semibold tabular-nums', pct == null ? 'text-slate-400' : scoreColor(pct))}>
                    {pct == null ? 'Not measured' : `${pct}%`} <span className="font-normal text-slate-400">({pts ?? '–'}/{c.max} pts)</span>
                  </span>
                </div>
                <ProgressBar value={pct ?? 0} label={`${c.label} ${pct ?? 'not measured'}`} />
              </li>
            );
          })}
          <li>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="font-medium">Confidence <span className="text-xs font-normal text-slate-400">(indicator, not scored)</span></span>
              <span className={cn('font-semibold tabular-nums', scoreColor(report.confidence))}>{report.confidence}%</span>
            </div>
            <ProgressBar value={report.confidence} barClassName="bg-slate-400 dark:bg-slate-500" label={`Confidence ${report.confidence}`} />
          </li>
        </ul>
        <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold"><Info className="size-4" aria-hidden="true" />How is this scored?</summary>
          <div className="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
            <p>Grammar 20 · Vocabulary 20 · Pronunciation 20 · Fluency 20 · Sentence formation 10 · Naturalness 10 = 100 points.</p>
            <p><span className="font-medium">Pronunciation:</span> {report.notes?.pronunciation}</p>
            <p><span className="font-medium">Fluency:</span> {report.notes?.fluency}</p>
            <p>Browser speech recognition can’t judge individual sounds accurately. When a dedicated speech-assessment API is connected, these two scores will come from it.</p>
          </div>
        </details>
      </Card>

      {(report.strengths?.length > 0 || report.improvements?.length > 0) && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardTitle icon={ThumbsUp}>What went well</CardTitle>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">{report.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
          </Card>
          <Card>
            <CardTitle icon={Target}>Focus next</CardTitle>
            {report.improvements.length ? (
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">{report.improvements.map((s) => <li key={s}>{s}</li>)}</ul>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">Nothing major — keep practising to stay sharp!</p>
            )}
          </Card>
        </div>
      )}

      <section aria-labelledby="mistakes-h">
        <h2 id="mistakes-h" className="mb-3 flex items-center gap-2 text-lg font-bold"><Target className="size-5 text-rose-500" aria-hidden="true" />Your Mistakes <span className="text-sm font-normal text-slate-500">({report.mistakes?.length || 0})</span></h2>
        {report.mistakes?.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {report.mistakes.map((m, i) => <MistakeCard key={`${m.said}-${i}`} mistake={{ ...m, id: `r${i}` }} />)}
          </div>
        ) : (
          <Card className="text-sm text-slate-600 dark:text-slate-400">No mistakes detected in this conversation. Excellent! 🎉</Card>
        )}
      </section>

      <Card>
        <CardTitle>Common mistakes</CardTitle>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COMMON_GROUPS.map((g) => {
            const n = g.cats.reduce((sum, c) => sum + (counts[c] || 0), 0);
            return (
              <li key={g.label} className={cn('flex items-center justify-between rounded-xl border px-3 py-2 text-sm', n ? 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10' : 'border-slate-200 text-slate-400 dark:border-slate-800')}>
                <span className={n ? 'font-medium text-slate-800 dark:text-slate-100' : ''}>{g.label}</span>
                <span className="font-bold tabular-nums">{g.label === 'Pronunciation' && !n ? '–' : n}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-slate-500">Pronunciation mistakes need a speech-assessment API; practise sounds in the Pronunciation section.</p>
      </Card>

      {report.betterWays?.length > 0 && (
        <Card>
          <CardTitle icon={Sparkles}>Better way to say it</CardTitle>
          <div className="space-y-4">
            {report.betterWays.map((b) => (
              <div key={b.original} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500">You said: “{b.original}”</p>
                <dl className="mt-2 space-y-2 text-[15px]">
                  <div><dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Basic</dt><dd>{b.basic}</dd></div>
                  <div><dt className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">Natural</dt><dd className="font-medium">{b.natural}</dd></div>
                  <div><dt className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">Professional</dt><dd className="font-medium">{b.professional}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.transcript?.length > 0 && (
        <Card>
          <details>
            <summary className="flex cursor-pointer items-center gap-2 font-semibold"><MessageSquareQuote className="size-5 text-brand-600" aria-hidden="true" />Conversation transcript</summary>
            <ol className="mt-3 space-y-2 text-sm">
              {report.transcript.map((m, i) => (
                <li key={i} className={cn('rounded-xl px-3 py-2', m.role === 'ai' ? 'bg-slate-50 dark:bg-slate-800/60' : 'bg-brand-50 dark:bg-brand-500/10')}>
                  <span className="font-semibold">{m.role === 'ai' ? 'Emma' : 'You'}:</span> {m.text}
                </li>
              ))}
            </ol>
          </details>
        </Card>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button to="/mistakes" size="lg" icon={Target} iconRight={ArrowRight}>Practise my mistakes</Button>
        <Button to="/speak" size="lg" variant="outline" icon={Mic}>New conversation</Button>
      </div>
    </div>
  );
}
