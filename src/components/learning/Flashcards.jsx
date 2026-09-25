/**
 * Flashcard deck with spaced-repetition grading.
 * Grades: Again (forgot) · Good · Easy — the store schedules the next review.
 */
import { useRef, useState } from 'react';
import { RotateCcw, Volume2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import { cn } from '../../utils/cn.js';

export default function Flashcards({ words, onGrade, onFinish, onSpeak, title }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [grades, setGrades] = useState([]);
  const startedAt = useRef(Date.now());
  const done = index >= words.length;
  const w = words[index];

  const grade = (g) => {
    onGrade(w, g);
    const next = [...grades, { word: w, grade: g }];
    setGrades(next);
    setFlipped(false);
    if (index + 1 >= words.length) onFinish?.(next, (Date.now() - startedAt.current) / 1000);
    setIndex(index + 1);
  };

  if (done) {
    const known = grades.filter((g) => g.grade !== 'again').length;
    return (
      <Card className="text-center">
        <p className="text-4xl" aria-hidden="true">🎉</p>
        <p className="mt-2 text-lg font-bold">Deck complete!</p>
        <p className="text-slate-600 dark:text-slate-400">You knew {known} of {grades.length} words.</p>
        {grades.some((g) => g.grade === 'again') && (
          <p className="mt-2 text-sm text-slate-500">Words you forgot will come back for review soon: {grades.filter((g) => g.grade === 'again').map((g) => g.word.word).join(', ')}.</p>
        )}
        <Button variant="outline" className="mt-4" icon={RotateCcw} onClick={() => { setIndex(0); setGrades([]); startedAt.current = Date.now(); }}>Review again</Button>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500"><span>{title}</span><span>{index + 1} / {words.length}</span></div>
      <ProgressBar value={index} max={words.length} size="sm" className="mb-4" label="Deck progress" />
      <div className="perspective">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? `Showing meaning of ${w.word}. Tap to see the word.` : `${w.word}. Tap to reveal the meaning.`}
          className={cn('preserve-3d relative block h-72 w-full rounded-3xl transition-transform duration-500', flipped && 'rotate-y-180')}
        >
          <span className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{w.partOfSpeech}</span>
            <span className="mt-2 text-4xl font-extrabold">{w.word}</span>
            <span className="mt-1 font-mono text-slate-500">{w.ipa}</span>
            <span className="mt-6 text-sm text-slate-400">Tap to reveal meaning</span>
          </span>
          <span className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-brand-200 bg-brand-50 p-6 text-center shadow-soft dark:border-brand-500/30 dark:bg-slate-900">
            <span className="text-lg font-semibold">{w.meaning}</span>
            <span className="mt-3 text-sm text-slate-600 italic dark:text-slate-300">“{w.example}”</span>
            {w.synonyms.length > 0 && <span className="mt-3 text-xs text-slate-500">Synonyms: {w.synonyms.join(', ')}</span>}
          </span>
        </button>
      </div>
      <div className="mt-3 flex justify-center">
        <Button variant="ghost" size="sm" icon={Volume2} onClick={() => onSpeak?.(w.word)}>Pronounce</Button>
      </div>
      <div className={cn('mt-3 grid grid-cols-3 gap-2 transition-opacity', !flipped && 'pointer-events-none opacity-40')} aria-hidden={!flipped}>
        <Button variant="outline" className="border-rose-200 text-rose-700 dark:border-rose-500/40 dark:text-rose-300" onClick={() => grade('again')} tabIndex={flipped ? 0 : -1}>Again</Button>
        <Button variant="secondary" onClick={() => grade('good')} tabIndex={flipped ? 0 : -1}>Good</Button>
        <Button variant="success" onClick={() => grade('easy')} tabIndex={flipped ? 0 : -1}>Easy</Button>
      </div>
      {!flipped && <p className="mt-2 text-center text-xs text-slate-500">Try to remember the meaning, then tap the card.</p>}
    </div>
  );
}
