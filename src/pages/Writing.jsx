import { useRef, useState } from 'react';
import { PenLine, RotateCcw, Send } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';
import WritingFeedback from '../components/learning/WritingFeedback.jsx';
import { WRITING_TYPES } from '../data/writingTypes.js';
import { useApp } from '../context/AppContext.jsx';
import { aiService } from '../services/aiService.js';
import { cn } from '../utils/cn.js';
import StickyActions from '../components/common/StickyActions.jsx';

const MIN_WORDS = 5;

export default function Writing() {
  const { recordSession } = useApp();
  const [typeId, setTypeId] = useState('pro-email');
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const startedAt = useRef(null);
  const type = WRITING_TYPES.find((t) => t.id === typeId);
  const wordCount = (text.match(/\S+/g) || []).length;

  const submit = async (e) => {
    e.preventDefault();
    if (wordCount < MIN_WORDS) {
      setError(`Please write at least ${MIN_WORDS} words so Emma can give useful feedback.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await aiService.analyzeWriting({ text, type });
      setFeedback(result);
      recordSession({
        type: 'writing',
        title: type.label,
        durationSec: startedAt.current ? (Date.now() - startedAt.current) / 1000 : 120,
        score: result.overall,
        skills: { writing: result.overall, grammar: result.scores.grammar },
        details: { writingType: type.id, text, feedback: result },
        mistakes: result.mistakes,
      });
    } catch {
      setError('We couldn’t analyse your writing right now. Please check your connection and try again — your text is still here.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFeedback(null);
    setText('');
    startedAt.current = null;
  };

  return (
    <div>
      <PageHeader title="Writing Practice" subtitle="Write, get corrections, and see a professional version" icon={PenLine} />
      {!feedback && (
        <form onSubmit={submit} className="space-y-4">
          <div className="scrollbar-none -mx-4 overflow-x-auto px-4">
            <div role="radiogroup" aria-label="Writing type" className="flex gap-2">
              {WRITING_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={t.id === typeId}
                  onClick={() => setTypeId(t.id)}
                  className={cn('h-10 shrink-0 rounded-full border px-4 text-sm font-medium', t.id === typeId ? 'border-brand-600 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-200' : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Card>
            <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">{type.label} {type.professional && '· Professional tone'}</p>
            <p className="mt-1 font-medium">{type.prompt}</p>
            <label htmlFor="writing" className="sr-only">Your text</label>
            <textarea
              id="writing"
              value={text}
              onChange={(e) => {
                if (!startedAt.current) startedAt.current = Date.now();
                setText(e.target.value);
              }}
              rows={9}
              placeholder={type.placeholder}
              className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-[15px] leading-relaxed dark:border-slate-700 dark:bg-slate-950"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>{wordCount} words</span>
              <button type="button" onClick={() => setText('Today I have completed my testing and I found some bugs. I will discuss about them with developer tomorrow. pls revert back if u have any doubt.')} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Try a sample text
              </button>
            </div>
          </Card>
          {error && <Alert tone="warning">{error}</Alert>}
          <StickyActions>
            <Button type="submit" size="lg" block icon={Send} loading={loading}>Check my writing</Button>
          </StickyActions>
        </form>
      )}
      {loading && <Spinner label="Emma is reviewing your writing…" />}
      {feedback && (
        <>
          <WritingFeedback feedback={feedback} original={text} />
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button size="lg" variant="outline" icon={PenLine} onClick={() => setFeedback(null)}>Edit & resubmit</Button>
            <Button size="lg" icon={RotateCcw} onClick={reset}>Write something new</Button>
          </div>
        </>
      )}
    </div>
  );
}
