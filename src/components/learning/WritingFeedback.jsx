import { Check, Copy, Lightbulb, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Card, { CardTitle } from '../common/Card.jsx';
import ScoreBar from '../common/ScoreBar.jsx';
import MistakeCard from '../common/MistakeCard.jsx';
import Alert from '../common/Alert.jsx';
import { DemoBadge } from '../common/Badge.jsx';
import { scoreColor } from '../../utils/levels.js';
import { cn } from '../../utils/cn.js';

const LABELS = { grammar: 'Grammar', spelling: 'Spelling & punctuation', structure: 'Sentence structure', vocabulary: 'Vocabulary', tone: 'Tone', clarity: 'Clarity', professionalism: 'Professionalism' };

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked — ignore */
        }
      }}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}{copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function WritingFeedback({ feedback: f, original }) {
  return (
    <div className="space-y-5">
      {f.fallback && <Alert tone="info">The AI service was unavailable, so this feedback was generated in demo mode.</Alert>}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Writing score</p>
            <p className={cn('text-4xl font-extrabold tabular-nums', scoreColor(f.overall))}>{f.overall}<span className="text-lg text-slate-400">/100</span></p>
            <p className="text-xs text-slate-500">{f.stats.words} words · {f.stats.sentences} sentences</p>
          </div>
          {f.demo && <DemoBadge label="Demo feedback" />}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(f.scores).map(([k, v]) => <ScoreBar key={k} label={LABELS[k]} value={v} />)}
        </div>
      </Card>

      {original && (
        <Card>
          <CardTitle>What you wrote</CardTitle>
          <p className="text-[15px] whitespace-pre-wrap text-slate-700 dark:text-slate-300">{original}</p>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle icon={Check} action={<CopyButton text={f.correctedText} />}>Correct</CardTitle>
          <p className="text-[15px] whitespace-pre-wrap">{f.correctedText}</p>
        </Card>
        <Card className="border-brand-100 dark:border-brand-500/20">
          <CardTitle icon={Sparkles} action={<CopyButton text={f.professionalVersion} />}>More professional</CardTitle>
          <p className="text-[15px] whitespace-pre-wrap">{f.professionalVersion}</p>
        </Card>
      </div>

      <Card>
        <CardTitle icon={Lightbulb}>Tips</CardTitle>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">{f.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </Card>

      {f.mistakes.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Corrections ({f.mistakes.length})</h2>
          <div className="grid gap-3 lg:grid-cols-2">{f.mistakes.map((m, i) => <MistakeCard key={i} mistake={{ ...m, id: `w${i}` }} />)}</div>
        </section>
      )}
    </div>
  );
}
