import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Briefcase, ClipboardCheck, Globe, Handshake, MessagesSquare, PenLine, Plane, Volume2 } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Logo from '../components/layout/Logo.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CEFR_LEVELS } from '../utils/levels.js';
import { DAILY_GOALS, generatePlan } from '../utils/plan.js';

export const GOALS = [
  { id: 'speaking', label: 'Speaking fluently', icon: MessagesSquare },
  { id: 'interview', label: 'Job interviews', icon: Briefcase },
  { id: 'workplace', label: 'Workplace communication', icon: Handshake },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'general', label: 'General English', icon: Globe },
  { id: 'writing', label: 'Writing', icon: PenLine },
  { id: 'pronunciation', label: 'Pronunciation', icon: Volume2 },
];

const STEPS = ['name', 'level', 'goal', 'time', 'plan'];

export default function Onboarding() {
  useDocumentTitle('Get started');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, completeOnboarding } = useApp();
  const fromTest = params.get('from') === 'test';
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.profile.name || '');
  const [level, setLevel] = useState(state.profile.level || 'B1');
  const [goal, setGoal] = useState(state.profile.goal || 'speaking');
  const [minutes, setMinutes] = useState(state.profile.dailyMinutes || 25);
  const [loadDemo, setLoadDemo] = useState(true);
  const [nameError, setNameError] = useState('');

  if (state.profile.onboarded) return <Navigate to="/" replace />;

  const plan = generatePlan({ dailyMinutes: minutes, goal, level }, { weakAreas: [], skillScores: {}, todayTypes: new Set() });
  const current = STEPS[step];

  const next = () => {
    if (current === 'name' && !name.trim()) {
      setNameError('Please enter your name so Emma knows what to call you.');
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      completeOnboarding({ name: name.trim(), level, goal, dailyMinutes: minutes }, { loadDemo });
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="mx-auto flex max-w-xl items-center justify-between px-4 pt-4">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Previous step">
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <Link to="/welcome" className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Back to welcome">
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <Logo compact />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{step + 1}/{STEPS.length}</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 pt-4 pb-32">
        <ProgressBar value={step + 1} max={STEPS.length} size="sm" label="Setup progress" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          className="mt-6"
        >
          <div key={current} className="animate-fade-in">
          {current === 'name' && (
            <div>
              <h1 className="text-2xl font-bold">Hi! I’m Emma, your English coach 👋</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">What should I call you?</p>
              <label htmlFor="name" className="sr-only">Your name</label>
              <input
                id="name"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                placeholder="Your first name"
                autoComplete="given-name"
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? 'name-error' : undefined}
                className="mt-5 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-lg dark:border-slate-700 dark:bg-slate-900"
              />
              {nameError && <p id="name-error" className="mt-2 text-sm text-rose-600">{nameError}</p>}
            </div>
          )}

          {current === 'level' && (
            <div>
              <h1 className="text-2xl font-bold">What is your current English level?</h1>
              {fromTest && state.profile.levelTest && (
                <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                  Your level test result: <strong>{state.profile.levelTest.level}</strong>. We’ve selected it for you.
                </p>
              )}
              <ChoiceGroup
                className="mt-5"
                label="English level"
                hideLabel
                variant="cards"
                options={CEFR_LEVELS.map((l) => ({ id: l.id, label: `${l.id} · ${l.label}`, description: l.description }))}
                value={level}
                onChange={setLevel}
              />
              {!state.profile.levelTest && (
                <Button to="/level-test" variant="ghost" icon={ClipboardCheck} className="mt-3">Not sure? Take the level test</Button>
              )}
            </div>
          )}

          {current === 'goal' && (
            <div>
              <h1 className="text-2xl font-bold">What is your main goal?</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Emma will focus your daily plan on this.</p>
              <ChoiceGroup className="mt-5" label="Main goal" hideLabel variant="cards" columns="sm:grid-cols-2" options={GOALS} value={goal} onChange={setGoal} />
            </div>
          )}

          {current === 'time' && (
            <div>
              <h1 className="text-2xl font-bold">How much time can you practise daily?</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Small daily practice beats long occasional sessions.</p>
              <ChoiceGroup
                className="mt-5"
                label="Daily goal"
                hideLabel
                variant="cards"
                columns="grid-cols-2 sm:grid-cols-3"
                options={DAILY_GOALS.map((m) => ({ id: m, label: `${m} min`, description: m <= 10 ? 'Light' : m <= 25 ? 'Regular' : m <= 30 ? 'Serious' : 'Intensive' }))}
                value={minutes}
                onChange={setMinutes}
              />
            </div>
          )}

          {current === 'plan' && (
            <div>
              <h1 className="text-2xl font-bold">Your personalised daily plan</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{name}, here’s what we’ll do every day:</p>
              <Card className="mt-5">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {plan.tasks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-sm text-slate-500">{t.reason}</p>
                      </div>
                      <span className="ml-3 shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{t.minutes} min</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-semibold dark:border-slate-800">Total: {plan.totalMinutes} minutes</p>
              </Card>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <input type="checkbox" checked={loadDemo} onChange={(e) => setLoadDemo(e.target.checked)} className="mt-0.5 size-5 accent-brand-600" />
                <span className="text-sm">
                  <span className="font-semibold">Load sample progress (demo)</span>
                  <span className="block text-slate-500">Fills the dashboard, charts, history and mistakes with realistic sample data so you can explore everything. You can clear it anytime in Settings.</span>
                </span>
              </label>
            </div>
          )}

          </div>
          <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="pb-safe mx-auto max-w-xl">
              <Button type="submit" size="lg" block iconRight={ArrowRight}>{current === 'plan' ? 'Start my first day' : 'Continue'}</Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
