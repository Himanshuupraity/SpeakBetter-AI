import { useState } from 'react';
import { Award, BookA, ChartLine, Clock, Flame, Lock, MessagesSquare, Mic, PenLine, Target } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import StatTile from '../components/common/StatTile.jsx';
import Tabs from '../components/common/Tabs.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Icon from '../components/common/Icon.jsx';
import { DemoBadge } from '../components/common/Badge.jsx';
import { BarChart, ChartTable, LineChart } from '../components/common/Charts.jsx';
import { useApp } from '../context/AppContext.jsx';
import { SKILLS, trend } from '../utils/stats.js';
import { formatMinutes } from '../utils/date.js';
import { scoreColor, xpLevel, XP_LEVELS } from '../utils/levels.js';
import { achievementProgress } from '../data/achievements.js';
import { cn } from '../utils/cn.js';

export default function Progress() {
  const { state, stats } = useApp();
  const [period, setPeriod] = useState('week');
  const lvl = xpLevel(state.xp);
  const achievements = achievementProgress(stats);
  const skills = SKILLS.filter((s) => ['speaking', 'grammar', 'vocabulary', 'pronunciation'].includes(s.id) || stats.skillScores[s.id] != null);

  return (
    <div className="space-y-5">
      <PageHeader title="Progress & Analytics" subtitle="See how your English is improving" icon={ChartLine} actions={state.hasDemoData && <DemoBadge />} />

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div>
            <p className="text-sm font-medium text-slate-500">Overall English score</p>
            <p className={cn('text-5xl font-extrabold tabular-nums', stats.overall != null && scoreColor(stats.overall))}>{stats.overall ?? '—'}</p>
            <p className="text-sm text-slate-500">Level {state.profile.level}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-x-5 gap-y-1 text-sm sm:ml-auto sm:w-auto">
            {SKILLS.filter((s) => stats.skillScores[s.id] != null).map((s) => (
              <p key={s.id} className="flex justify-between gap-2"><span className="text-slate-500">{s.label}</span><span className={cn('font-semibold tabular-nums', scoreColor(stats.skillScores[s.id]))}>{stats.skillScores[s.id]}</span></p>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Your level</p>
              <p className="text-2xl font-bold">{lvl.current.name}</p>
            </div>
            <p className="text-right text-sm"><span className="text-2xl font-bold tabular-nums">{state.xp}</span> XP</p>
          </div>
          <ProgressBar value={lvl.progress * 100} className="mt-3" label="Progress to next level" />
          <p className="mt-1.5 text-xs text-slate-500">{lvl.next ? `${lvl.next.minXp - state.xp} XP to ${lvl.next.name}` : 'Top level reached!'}</p>
          <ol className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
            {XP_LEVELS.map((l, i) => <li key={l.name} className={cn('rounded-full px-2 py-0.5', i <= lvl.index ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800')}>{l.name}</li>)}
          </ol>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile icon={Clock} label="Total practice time" value={formatMinutes(stats.totalMinutes)} />
        <StatTile icon={MessagesSquare} label="Total conversations" value={stats.conversations} />
        <StatTile icon={BookA} label="Words learned" value={stats.wordsLearned} iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" />
        <StatTile icon={Target} label="Mistakes corrected" value={stats.mistakesCorrected} iconClass="bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" />
        <StatTile icon={Mic} label="Speaking sessions" value={stats.countByType.speaking || 0} />
        <StatTile icon={PenLine} label="Writing sessions" value={stats.countByType.writing || 0} iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" />
      </div>

      <Card>
        <CardTitle icon={Flame} action={<span className="text-sm text-slate-500">🔥 {stats.streak} days · best {stats.bestStreak}</span>}>This week</CardTitle>
        <BarChart data={stats.last7Days} unit=" min" goal={state.profile.dailyMinutes} label="Minutes practised on each of the last 7 days, with daily goal line" />
        <p className="mt-1 text-xs text-slate-500">Dashed line = daily goal ({state.profile.dailyMinutes} min). Green bars reached the goal.</p>
        <ChartTable data={stats.last7Days} valueLabel="Minutes" caption="Minutes practised per day" />
      </Card>

      <section aria-labelledby="trends">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="trends" className="text-lg font-bold">Skill trends</h2>
          <Tabs tabs={[{ id: 'week', label: 'Weekly' }, { id: 'month', label: 'Monthly' }]} value={period} onChange={setPeriod} label="Trend period" className="w-56" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((s) => {
            const data = trend(state.sessions, s.id, period, period === 'week' ? 6 : 4);
            const values = data.map((d) => d.value).filter((v) => v != null);
            return (
              <Card key={s.id}>
                <div className="mb-1 flex items-baseline justify-between">
                  <h3 className="font-semibold">{s.label}</h3>
                  <p className="text-sm text-slate-500 tabular-nums">{values.length ? values.slice(-3).join(' → ') : 'No data yet'}</p>
                </div>
                <LineChart data={data} label={`${s.label} score by ${period}`} />
                <ChartTable data={data} valueLabel="Score" caption={`${s.label} ${period}ly average score`} />
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="ach">
        <h2 id="ach" className="mb-3 flex items-center gap-2 text-lg font-bold"><Award className="size-5 text-amber-500" aria-hidden="true" />Achievements</h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {achievements.map((a) => (
            <li key={a.id} className={cn('rounded-2xl border p-4', a.unlocked ? 'border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900')}>
              <span className={cn('grid size-10 place-items-center rounded-xl', a.unlocked ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800')}>
                {a.unlocked ? <Icon name={a.icon} className="size-5" /> : <Lock className="size-5" aria-hidden="true" />}
              </span>
              <p className="mt-2 text-sm font-semibold">{a.title}</p>
              <p className="text-xs text-slate-500">{a.description}</p>
              {!a.unlocked && (
                <>
                  <ProgressBar value={a.progress * 100} size="sm" className="mt-2" label={`${a.title} progress`} />
                  <p className="mt-1 text-[11px] text-slate-500 tabular-nums">{a.current} / {a.target}</p>
                </>
              )}
              <p className="sr-only">{a.unlocked ? 'Unlocked' : 'Locked'}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
