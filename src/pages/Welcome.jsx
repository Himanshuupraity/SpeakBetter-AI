import { Navigate } from 'react-router-dom';
import { ArrowRight, AudioLines, BookA, ChartLine, ClipboardCheck, GraduationCap, Mic, PenLine, Target } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Logo from '../components/layout/Logo.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import CreditFooter from '../components/layout/CreditFooter.jsx';
import EmmaAvatar from '../components/common/EmmaAvatar.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const FEATURES = [
  { icon: Mic, title: 'Talk with Emma', text: 'Real conversations about work, travel, interviews and daily life.' },
  { icon: Target, title: 'Learn from every mistake', text: 'See what you said, the correct version, and why — then practise it.' },
  { icon: AudioLines, title: 'Pronunciation', text: 'Practise difficult sounds like TH, V/W and word stress.' },
  { icon: GraduationCap, title: 'Grammar & vocabulary', text: 'Short lessons, quizzes and flashcards with spaced review.' },
  { icon: PenLine, title: 'Writing feedback', text: 'Emails, messages and bug reports — corrected and made professional.' },
  { icon: ChartLine, title: 'Track your progress', text: 'Scores, streaks and weekly trends keep you motivated.' },
];

export default function Welcome() {
  const { state } = useApp();
  useDocumentTitle('Welcome');
  if (state.profile.onboarded) return <Navigate to="/" replace />;

  return (
    <div className="min-h-dvh bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-5 pt-6 pb-12 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle showLabel />
        </div>
        <section className="mt-10 grid items-center gap-10 lg:mt-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              Practice English. Speak Confidently. Improve Every Day.
            </p>
            <h1 className="mt-4 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl">
              Improve Your English, One Conversation at a Time.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
              Practice speaking, grammar, vocabulary, writing and pronunciation with your personal AI English coach.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/onboarding" size="lg" iconRight={ArrowRight}>Start Practicing</Button>
              <Button to="/level-test" size="lg" variant="outline" icon={ClipboardCheck}>Take Level Test</Button>
            </div>
            <p className="mt-3 text-sm text-slate-500">Free · No sign-up · Your progress stays on this device</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900" aria-label="Example conversation with Emma">
            <div className="flex items-center gap-3">
              <EmmaAvatar size="md" state="speaking" />
              <div>
                <p className="font-semibold">Emma</p>
                <p className="text-xs text-slate-500">Your English Coach</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-[15px]">
              <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-3 shadow-sm dark:bg-slate-800">Hi! How was your day today?</p>
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 p-3 text-white">Today I go office and I completed many work.</p>
              <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-3 shadow-sm dark:bg-slate-800">That sounds like a productive day! What kind of work did you complete?</p>
            </div>
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200">After the conversation</p>
              <p className="mt-1 text-slate-600 line-through dark:text-slate-400">Today I go office.</p>
              <p className="font-medium text-emerald-700 dark:text-emerald-300">Today I went to the office.</p>
            </div>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="features">
          <h2 id="features" className="text-xl font-bold">Everything you need to practise daily</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <f.icon className="size-6 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                <p className="mt-3 font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-10 flex justify-center">
          <Button to="/onboarding" size="lg" icon={BookA}>Create my learning plan</Button>
        </div>
        <CreditFooter className="mt-8 border-t border-slate-200 dark:border-slate-800" />
      </div>
    </div>
  );
}
