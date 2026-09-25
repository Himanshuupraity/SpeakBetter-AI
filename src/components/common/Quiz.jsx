/**
 * Reusable multiple-choice quiz (Grammar, Reading, Listening, Level Test).
 *
 * mode="practice": instant feedback after each answer, no pressure.
 * mode="quiz": answer everything, then see score + explanation for every wrong answer.
 */
import { useMemo, useState } from 'react';
import { ArrowRight, Check, CircleCheck, CircleX, RotateCcw, X } from 'lucide-react';
import Button from './Button.jsx';
import Card from './Card.jsx';
import ProgressBar from './ProgressBar.jsx';
import ProgressRing from './ProgressRing.jsx';
import { gradeQuiz } from '../../services/grammarService.js';
import { cn } from '../../utils/cn.js';
import StickyActions from './StickyActions.jsx';

const TYPE_LABEL = { mcq: 'Multiple choice', truefalse: 'True or false', vocab: 'Vocabulary', mainidea: 'Main idea', fill: 'Fill in the blank' };

export default function Quiz({ questions, mode = 'quiz', onComplete, onRetry, renderQuestionExtra, finishLabel = 'See results', resultExtra }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const q = questions[index];
  const selected = answers[q?.id];
  const isLast = index === questions.length - 1;
  const practiceCorrect = useMemo(() => Object.entries(answers).filter(([id, a]) => questions.find((x) => x.id === id)?.answer === a).length, [answers, questions]);

  const choose = (i) => {
    if (mode === 'practice' && revealed) return;
    setAnswers((a) => ({ ...a, [q.id]: i }));
    if (mode === 'practice') setRevealed(true);
  };

  const next = () => {
    if (isLast) {
      const graded = gradeQuiz(questions, answers);
      setResult(graded);
      onComplete?.(graded);
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  };

  const retry = () => {
    setIndex(0);
    setAnswers({});
    setRevealed(false);
    setResult(null);
    onRetry?.();
  };

  if (result) {
    const wrong = result.results.filter((r) => !r.correct);
    return (
      <div className="space-y-4">
        <Card className="flex flex-col items-center text-center">
          <ProgressRing value={result.score / 100} size={130} label={`Score ${result.score}%`} colorClass={result.score >= 70 ? 'text-emerald-500' : result.score >= 50 ? 'text-amber-500' : 'text-rose-500'}>
            <div>
              <p className="text-3xl font-bold tabular-nums">{result.score}%</p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
          </ProgressRing>
          <p className="mt-3 font-semibold">{result.correct} of {result.total} correct</p>
          {resultExtra}
        </Card>
        {wrong.length > 0 && (
          <Card>
            <h3 className="mb-3 font-semibold">Review your mistakes</h3>
            <ul className="space-y-3">
              {wrong.map((r) => (
                <li key={r.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                  <p className="font-medium">{r.prompt}</p>
                  <p className="mt-1.5 flex items-start gap-1.5 text-rose-700 dark:text-rose-300"><X className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> <span><span className="sr-only">Your answer: </span>{r.selectedText ?? 'Not answered'}</span></p>
                  <p className="mt-1 flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300"><Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> <span><span className="sr-only">Correct answer: </span>{r.correctText}</span></p>
                  <p className="mt-1.5 text-slate-600 dark:text-slate-300"><span className="font-semibold">Why: </span>{r.explanation}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Button variant="outline" block icon={RotateCcw} onClick={retry}>Try again</Button>
      </div>
    );
  }

  const correctIdx = q.answer;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Question {index + 1} of {questions.length}</span>
        {mode === 'practice' ? <span>{practiceCorrect} correct</span> : q.type && <span>{TYPE_LABEL[q.type]}</span>}
      </div>
      <ProgressBar value={index + (selected !== undefined ? 1 : 0)} max={questions.length} size="sm" label="Quiz progress" className="mb-4" />
      <Card>
        {renderQuestionExtra?.(q)}
        {q.passage && <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">{q.passage}</p>}
        <h3 className="text-lg font-semibold leading-snug" id={`q-${q.id}`}>{q.prompt}</h3>
        <div role="radiogroup" aria-labelledby={`q-${q.id}`} className="mt-4 grid gap-2">
          {q.options.map((opt, i) => {
            const isSel = selected === i;
            const showState = mode === 'practice' && revealed;
            const good = showState && i === correctIdx;
            const bad = showState && isSel && i !== correctIdx;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => choose(i)}
                className={cn(
                  'flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[15px] transition-colors',
                  good ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : bad ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10' : isSel ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/15' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                )}
              >
                <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold', isSel ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300')}>{String.fromCharCode(65 + i)}</span>
                <span className="flex-1">{opt}</span>
                {good && <CircleCheck className="size-5 text-emerald-600" aria-label="Correct answer" />}
                {bad && <CircleX className="size-5 text-rose-600" aria-label="Your answer — incorrect" />}
              </button>
            );
          })}
        </div>
        {mode === 'practice' && revealed && (
          <div className={cn('mt-4 animate-fade-in rounded-xl p-3 text-sm', selected === correctIdx ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100' : 'bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100')} role="status">
            <p className="font-semibold">{selected === correctIdx ? 'Correct! 🎉' : `Not quite — the answer is “${q.options[correctIdx]}”.`}</p>
            <p className="mt-1 opacity-90">{q.explanation}</p>
          </div>
        )}
      </Card>
      <StickyActions>
        <Button block size="lg" onClick={next} disabled={selected === undefined} iconRight={ArrowRight}>
          {isLast ? finishLabel : 'Next question'}
        </Button>
      </StickyActions>
    </div>
  );
}
