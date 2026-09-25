import { CalendarCheck, Flame } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import ProgressRing from '../components/common/ProgressRing.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import EmmaAvatar from '../components/common/EmmaAvatar.jsx';
import RecommendedPractice from '../components/dashboard/RecommendedPractice.jsx';
import { useApp } from '../context/AppContext.jsx';
import { teacherService } from '../services/teacherService.js';
import { DAILY_GOALS, generatePlan } from '../utils/plan.js';
import { cn } from '../utils/cn.js';

export default function DailyPractice() {
  const { state, stats, updateProfile } = useApp();
  const plan = generatePlan(state.profile, stats);
  const done = plan.tasks.filter((t) => t.done).length;
  const insight = teacherService.getInsight(stats, state.profile);

  return (
    <div>
      <PageHeader title="Daily Practice" subtitle="Your personalised plan for today" icon={CalendarCheck} />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <Card className="flex flex-col items-center text-center">
            <ProgressRing value={stats.goalProgress} size={170} stroke={14} label={`${stats.todayMinutes} of ${stats.goalMinutes} minutes practised today`} colorClass={stats.goalProgress >= 1 ? 'text-emerald-500' : 'text-brand-600 dark:text-brand-400'}>
              <div>
                <p className="text-3xl font-extrabold tabular-nums">{stats.todayMinutes}<span className="text-lg text-slate-400">/{stats.goalMinutes}</span></p>
                <p className="text-xs text-slate-500">minutes today</p>
              </div>
            </ProgressRing>
            <p className="mt-3 font-semibold">{done} of {plan.tasks.length} activities done</p>
            <div className="mt-4 flex gap-1.5" aria-label="Last 7 days">
              {stats.last7Days.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-1">
                  <span className={cn('grid size-8 place-items-center rounded-full text-xs', d.value > 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800')} title={`${d.value} min`}>
                    {d.value > 0 ? <Flame className="size-4" aria-label={`${d.label}: practised ${d.value} minutes`} /> : <span className="sr-only">{d.label}: no practice</span>}
                  </span>
                  <span className="text-[10px] text-slate-500" aria-hidden="true">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">🔥 {stats.streak}-day streak · best {stats.bestStreak}</p>
          </Card>
          <Card>
            <ChoiceGroup label="Daily goal" options={DAILY_GOALS.map((m) => ({ id: m, label: `${m} min` }))} value={state.profile.dailyMinutes} onChange={(m) => updateProfile({ dailyMinutes: m })} />
            <p className="mt-2 text-xs text-slate-500">Changing your goal updates today’s plan instantly.</p>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardTitle>Today’s plan · {plan.totalMinutes} min</CardTitle>
            <RecommendedPractice tasks={plan.tasks} />
            <p className="mt-3 text-xs text-slate-500">Activities are ticked automatically when you complete them today.</p>
          </Card>
          <Card className="flex items-start gap-3">
            <EmmaAvatar size="sm" />
            <p className="text-[15px] text-slate-700 dark:text-slate-200">“{insight.message}”</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
