/** Result of a speaking-speed attempt (also shown from Practice History). */
import { Clock, Info, Lightbulb, MessageSquareText, PauseCircle, Waves } from 'lucide-react';
import Card, { CardTitle } from '../common/Card.jsx';
import StatTile from '../common/StatTile.jsx';
import { LineChart, ChartTable } from '../common/Charts.jsx';
import PaceGauge from './PaceGauge.jsx';
import { PACE_SCALE } from '../../services/engine/paceAnalyzer.js';
import { cn } from '../../utils/cn.js';

const TONE = {
  perfect: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
  slow: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  'too-slow': 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  fast: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
  'too-fast': 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
};

export default function SpeedResult({ result: r, audioUrl }) {
  return (
    <div className="space-y-4">
      <Card className="text-center">
        <PaceGauge wpm={r.wpm} range={r.range} />
        <div className={cn('mt-2 rounded-2xl border p-3 text-left', TONE[r.verdict])} role="status">
          <p className="text-lg font-bold">{r.headline}</p>
          <p className="mt-1 text-sm opacity-90">{r.message}</p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 text-sm">
          <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">Pace score: {r.score}/100</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{r.contextLabel}: {r.range[0]}–{r.range[1]} wpm</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={MessageSquareText} label="Words spoken" value={r.words} />
        <StatTile icon={Clock} label="Speaking time" value={`${r.speakingSec}s`} />
        <StatTile icon={PauseCircle} label="Long pauses" value={r.method === 'timer' ? '–' : r.longPauses} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" />
        <StatTile icon={Waves} label="Steadiness" value={r.consistency == null ? '–' : `${r.consistency}%`} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" />
      </div>

      {r.timeline?.length >= 2 && (
        <Card>
          <CardTitle>Your pace over time</CardTitle>
          <div className="mx-auto max-w-xl"><LineChart data={r.timeline} min={PACE_SCALE.min} max={PACE_SCALE.max} unit=" wpm" band={r.range} label="Words per minute in each 10-second window" /></div>
          <p className="mt-1 text-xs text-slate-500">Green band = ideal pace. Each point is one 10-second part of your speech.</p>
          <ChartTable data={r.timeline} valueLabel="Words per minute" caption="Pace per 10 seconds" />
        </Card>
      )}

      <Card>
        <CardTitle icon={Lightbulb}>How to improve</CardTitle>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">{r.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </Card>

      {(r.transcript || audioUrl) && (
        <Card>
          {audioUrl && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold text-slate-500">Your recording</p>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
          {r.transcript && (
            <details>
              <summary className="cursor-pointer text-sm font-semibold">What we heard</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{r.transcript}</p>
            </details>
          )}
        </Card>
      )}

      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {r.method === 'timer'
          ? 'Measured with a timer and the passage length, because speech recognition isn’t available in this browser.'
          : 'Measured from your browser’s speech recognition. Speed is measured from your first word to your last, so silence before you start doesn’t count.'}
      </p>
    </div>
  );
}
