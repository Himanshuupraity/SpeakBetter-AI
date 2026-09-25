import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardCheck, Clock } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Quiz from '../components/common/Quiz.jsx';
import ScoreBar from '../components/common/ScoreBar.jsx';
import Logo from '../components/layout/Logo.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';
import CreditFooter from '../components/layout/CreditFooter.jsx';
import { LEVEL_TEST_QUESTIONS, LEVEL_TEST_SECTIONS } from '../data/levelTest.js';
import { useApp } from '../context/AppContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CEFR_LEVELS, cefrLabel } from '../utils/levels.js';

const WEIGHT = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

const RECOMMENDATIONS = {
  A1: ['Start with basic grammar: articles, pronouns and the present simple.', 'Learn 5 everyday words per day with flashcards.', 'Use Beginner speaking mode with short, simple answers.'],
  A2: ['Focus on the past simple and present continuous.', 'Learn daily-life and workplace vocabulary.', 'Practise 10 minutes of Elementary conversation daily.'],
  B1: ['Work on tenses, prepositions and articles — the most common mistakes at B1.', 'Practise workplace and interview conversations with Emma.', 'Write one short professional message every day.'],
  B2: ['Polish accuracy: conditionals, passive voice and reported speech.', 'Practise meetings, presentations and debates.', 'Focus on natural and professional alternatives in your reports.'],
  C1: ['Refine nuance: idioms, tone and precise vocabulary.', 'Use Advanced mode and Debate or Presentation topics.', 'Challenge yourself with C1 reading and listening.'],
};

function estimate(results) {
  let points = 0;
  let max = 0;
  LEVEL_TEST_QUESTIONS.forEach((q) => {
    max += WEIGHT[q.level];
    if (results.find((r) => r.id === q.id)?.correct) points += WEIGHT[q.level];
  });
  const pct = points / max;
  if (pct < 0.2) return 'A1';
  if (pct < 0.4) return 'A2';
  if (pct < 0.62) return 'B1';
  if (pct < 0.82) return 'B2';
  return 'C1';
}

export default function LevelTest() {
  useDocumentTitle('Level Test');
  const navigate = useNavigate();
  const { state, updateProfile, recordSession } = useApp();
  const [started, setStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const onboarded = state.profile.onboarded;

  const sectionScores = useMemo(() => {
    if (!outcome) return [];
    return LEVEL_TEST_SECTIONS.map((s) => {
      const qs = outcome.graded.results.filter((r) => LEVEL_TEST_QUESTIONS.find((q) => q.id === r.id)?.section === s.id);
      return { ...s, score: Math.round((qs.filter((r) => r.correct).length / qs.length) * 100) };
    });
  }, [outcome]);

  const complete = (graded) => {
    const level = estimate(graded.results);
    const levelTest = { level, score: graded.score, date: new Date().toISOString() };
    updateProfile({ level, levelTest });
    recordSession({ type: 'level-test', title: 'English Level Test', durationSec: (Date.now() - startedAt) / 1000, score: graded.score, details: { level, correct: graded.correct, total: graded.total } });
    setOutcome({ graded, level });
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <Link to={onboarded ? '/' : '/welcome'} className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-slate-600 dark:text-slate-300" aria-label="Exit level test">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <Logo compact />
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-xl px-4 py-6 pb-28">
        {!started && (
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15"><ClipboardCheck className="size-8" aria-hidden="true" /></span>
            <h1 className="mt-4 text-2xl font-bold">English Level Test</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Answer {LEVEL_TEST_QUESTIONS.length} questions to estimate your level (A1–C1). Questions get harder as you go.</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-500"><Clock className="size-4" aria-hidden="true" /> About 8 minutes</p>
            <ul className="mt-6 grid gap-2 text-left sm:grid-cols-2">
              {LEVEL_TEST_SECTIONS.map((s) => (
                <li key={s.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-slate-500">{s.description}</p>
                </li>
              ))}
            </ul>
            <Button size="lg" block className="mt-6" iconRight={ArrowRight} onClick={() => { setStarted(true); setStartedAt(Date.now()); }}>Start the test</Button>
            <p className="mt-3 text-xs text-slate-500">Don’t guess wildly — it’s fine to choose the answer you think is best.</p>
          </div>
        )}

        {started && !outcome && (
          <Quiz
            questions={LEVEL_TEST_QUESTIONS}
            mode="quiz"
            finishLabel="Finish test"
            renderQuestionExtra={(q) => (
              <p className="mb-2 text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">{LEVEL_TEST_SECTIONS.find((s) => s.id === q.section)?.title}</p>
            )}
            onComplete={complete}
          />
        )}

        {outcome && (
          <div className="space-y-4">
            <Card className="text-center">
              <p className="text-sm font-medium text-slate-500">Your estimated level</p>
              <p className="mt-1 text-5xl font-extrabold text-brand-600 dark:text-brand-400">{outcome.level}</p>
              <p className="mt-1 font-semibold">{cefrLabel(outcome.level)}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{CEFR_LEVELS.find((l) => l.id === outcome.level)?.description}</p>
              <p className="mt-2 text-sm text-slate-500">{outcome.graded.correct} of {outcome.graded.total} correct</p>
            </Card>
            <Card>
              <h2 className="mb-3 font-semibold">Section scores</h2>
              <div className="space-y-3">{sectionScores.map((s) => <ScoreBar key={s.id} label={s.title} value={s.score} />)}</div>
            </Card>
            <Card>
              <h2 className="mb-2 font-semibold">Your recommended learning plan</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {RECOMMENDATIONS[outcome.level].map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Card>
            <Button size="lg" block iconRight={ArrowRight} onClick={() => navigate(onboarded ? '/' : '/onboarding?from=test')}>
              {onboarded ? 'Back to dashboard' : 'Continue setup'}
            </Button>
          </div>
        )}
        <CreditFooter className="mt-6" />
      </main>
    </div>
  );
}
