import { Link, useLocation, useParams } from 'react-router-dom';
import { CalendarDays, CircleCheck, Clock, Zap } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ScoreBar from '../components/common/ScoreBar.jsx';
import { DemoBadge } from '../components/common/Badge.jsx';
import SpeakingReport from '../components/speaking/SpeakingReport.jsx';
import WritingFeedback from '../components/learning/WritingFeedback.jsx';
import SpeedResult from '../components/speaking/SpeedResult.jsx';
import { SESSION_ICONS } from '../components/dashboard/SessionListItem.jsx';
import { useApp } from '../context/AppContext.jsx';
import { SESSION_TYPES } from '../utils/stats.js';
import { formatDate, formatTime } from '../utils/date.js';
import { scoreColor } from '../utils/levels.js';
import { getMode, DIFFICULTIES, PERSONALITIES } from '../data/conversationModes.js';

export default function SessionDetail() {
  const { sessionId } = useParams();
  const location = useLocation();
  const { state } = useApp();
  const s = state.sessions.find((x) => x.id === sessionId);
  const fresh = location.state?.fresh;

  if (!s) {
    return (
      <div>
        <PageHeader title="Session not found" back="/history" />
        <EmptyState title="We couldn’t find this session" action={<Button to="/history">Back to history</Button>}>It may have been removed when sample data was cleared.</EmptyState>
      </div>
    );
  }

  const Icon = SESSION_ICONS[s.type];
  const report = s.details?.report;

  return (
    <div>
      <PageHeader
        title={fresh ? 'Session complete!' : s.title}
        subtitle={fresh ? `${s.title} · +${s.xp} XP earned` : SESSION_TYPES[s.type]?.label}
        back={fresh ? undefined : '/history'}
        icon={fresh ? CircleCheck : Icon}
        actions={s.demo && <DemoBadge label="Sample" />}
      />
      <div className="mb-5 flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><CalendarDays className="size-4" aria-hidden="true" />{formatDate(s.date)}, {formatTime(s.date)}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><Clock className="size-4" aria-hidden="true" />{Math.max(1, Math.round(s.durationSec / 60))} min</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"><Zap className="size-4" aria-hidden="true" />{s.xp} XP</span>
        {s.type === 'speaking' && s.details?.mode && (
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            {getMode(s.details.mode).title} · {DIFFICULTIES.find((d) => d.id === s.details.difficulty)?.label} · {PERSONALITIES.find((p) => p.id === s.details.personality)?.label}
          </span>
        )}
      </div>

      {s.type === 'speaking' && report && <SpeakingReport report={report} />}
      {s.type === 'writing' && s.details?.feedback && <WritingFeedback feedback={s.details.feedback} original={s.details.text} />}
      {s.type === 'speed' && s.details?.result && <SpeedResult result={s.details.result} />}

      {!(s.type === 'speaking' && report) && !(s.type === 'writing' && s.details?.feedback) && !(s.type === 'speed' && s.details?.result) && (
        <div className="space-y-4">
          <Card className="text-center">
            <p className="text-sm font-medium text-slate-500">Score</p>
            <p className={`text-5xl font-extrabold tabular-nums ${scoreColor(s.score)}`}>{s.score}</p>
            {s.details?.correct != null && <p className="mt-1 text-sm text-slate-500">{s.details.correct} of {s.details.total} correct</p>}
            {s.details?.level && s.type === 'level-test' && <p className="mt-2 font-semibold">Estimated level: {s.details.level}</p>}
          </Card>
          {s.details?.results?.length > 0 && (
            <Card>
              <h2 className="mb-3 font-semibold">Answers</h2>
              <ul className="space-y-2 text-sm">
                {s.details.results.map((r) => (
                  <li key={r.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <p className="font-medium">{r.prompt}</p>
                    <p className={r.correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>{r.correct ? '✓' : '✗'} {r.selectedText ?? 'Not answered'}{!r.correct && ` — correct: ${r.correctText}`}</p>
                    {!r.correct && <p className="mt-1 text-slate-600 dark:text-slate-400">{r.explanation}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {s.skills && (
            <Card className="space-y-3">
              {Object.entries(s.skills).filter(([, v]) => typeof v === 'number').map(([k, v]) => <ScoreBar key={k} label={k[0].toUpperCase() + k.slice(1)} value={v} />)}
            </Card>
          )}
          {s.demo && <p className="text-center text-sm text-slate-500">This is a sample session — detailed answers are available for sessions you complete yourself.</p>}
        </div>
      )}

      {fresh && (
        <p className="mt-6 text-center text-sm">
          <Link to="/" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Back to dashboard</Link>
        </p>
      )}
    </div>
  );
}
