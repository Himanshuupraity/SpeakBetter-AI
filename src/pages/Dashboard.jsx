import { Link } from 'react-router-dom';
import { ArrowRight, BookA, ChartLine, CircleCheck, Flame, Mic, Sparkles, Target, Trophy } from 'lucide-react';
import Card, { CardTitle } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ProgressRing from '../components/common/ProgressRing.jsx';
import ScoreBar from '../components/common/ScoreBar.jsx';
import StatTile from '../components/common/StatTile.jsx';
import EmmaAvatar from '../components/common/EmmaAvatar.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { DemoBadge } from '../components/common/Badge.jsx';
import SessionListItem from '../components/dashboard/SessionListItem.jsx';
import RecommendedPractice from '../components/dashboard/RecommendedPractice.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { teacherService } from '../services/teacherService.js';
import { generatePlan } from '../utils/plan.js';
import { greeting } from '../utils/date.js';
import { cefrLabel, scoreColor, xpLevel } from '../utils/levels.js';
import { cn } from '../utils/cn.js';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { state, stats } = useApp();
  const { profile } = state;
  const plan = generatePlan(profile, stats);
  const insight = teacherService.getInsight(stats, profile);
  const lvl = xpLevel(state.xp);
  const remaining = plan.tasks.filter((t) => !t.done);
  const goalDone = stats.todayMinutes >= stats.goalMinutes;

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting()}, {profile.name || 'there'} 👋</h1>
          <p className="mt-0.5 text-slate-600 dark:text-slate-400">Ready to improve your English?</p>
        </div>
        {state.hasDemoData && <DemoBadge className="mt-1.5 shrink-0" />}
      </section>

      {/* Today's goal */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-5">
          <ProgressRing value={stats.goalProgress} size={112} stroke={11} label={`Today's goal ${Math.round(stats.goalProgress * 100)}% complete`} colorClass={goalDone ? 'text-emerald-500' : 'text-brand-600 dark:text-brand-400'}>
            <div>
              <p className="text-2xl font-bold tabular-nums">{Math.round(stats.goalProgress * 100)}%</p>
              <p className="text-[11px] text-slate-500">of goal</p>
            </div>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">Today’s goal</p>
            <p className="text-xl font-bold tabular-nums">{stats.todayMinutes} / {stats.goalMinutes} min</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{goalDone ? 'Goal complete — great work! 🎉' : `${Math.max(0, stats.goalMinutes - stats.todayMinutes)} minutes to go`}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"><Flame className="size-4" aria-hidden="true" />{stats.streak}-day streak</span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{cefrLabel(profile.level)}</span>
            </div>
          </div>
        </div>
        <Button to="/speak" size="lg" block icon={Mic} className="mt-5">Start Practice</Button>
      </Card>

      {/* Emma */}
      <Card className="flex items-start gap-3 border-brand-100 bg-brand-50/60 dark:border-brand-500/20 dark:bg-brand-500/10">
        <EmmaAvatar size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Emma <span className="font-normal text-slate-500">· your English coach</span></p>
          <p className="mt-0.5 text-[15px] text-slate-700 dark:text-slate-200">“{insight.message}”</p>
          <Link to={insight.to} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
            {insight.action} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Card>

      {/* Recommended */}
      <section aria-labelledby="rec-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="rec-title" className="flex items-center gap-2 text-base font-semibold"><Sparkles className="size-5 text-brand-600" aria-hidden="true" />Your Recommended Practice</h2>
          <Link to="/daily" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Today’s plan</Link>
        </div>
        {remaining.length ? (
          <RecommendedPractice tasks={remaining} />
        ) : (
          <Card className="flex items-center gap-3 text-sm"><CircleCheck className="size-6 text-emerald-600" aria-hidden="true" />You’ve completed every activity in today’s plan. Anything extra is a bonus!</Card>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Scores */}
        <Card>
          <CardTitle icon={ChartLine} action={<Link to="/progress" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Details</Link>}>Your scores</CardTitle>
          <div className="mb-4 flex items-baseline gap-2">
            <span className={cn('text-4xl font-extrabold tabular-nums', stats.overall != null && scoreColor(stats.overall))}>{stats.overall ?? '—'}</span>
            <span className="text-sm text-slate-500">Overall English score</span>
          </div>
          <div className="space-y-3">
            <ScoreBar label="Speaking" value={stats.skillScores.speaking} />
            <ScoreBar label="Grammar" value={stats.skillScores.grammar} />
            <ScoreBar label="Vocabulary" value={stats.skillScores.vocabulary} />
            <ScoreBar label="Pronunciation" value={stats.skillScores.pronunciation} />
          </div>
          {stats.overall == null && <p className="mt-3 text-sm text-slate-500">Complete a few activities to see your scores.</p>}
        </Card>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={BookA} label="Words learned" value={stats.wordsLearned} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" />
            <StatTile icon={Target} label="Mistakes corrected" value={stats.mistakesCorrected} iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" />
            <StatTile icon={Mic} label="Conversations" value={stats.conversations} />
            <StatTile icon={Trophy} label="Level" value={lvl.current.name} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" />
          </div>
          <Card>
            <CardTitle action={<Link to="/history" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">See all</Link>}>Recent practice</CardTitle>
            {state.sessions.length ? (
              <div className="-mx-2">{state.sessions.slice(0, 4).map((s) => <SessionListItem key={s.id} session={s} />)}</div>
            ) : (
              <EmptyState icon={Mic} title="No sessions yet" action={<Button to="/speak" size="sm">Start speaking</Button>}>Your practice sessions will appear here.</EmptyState>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
