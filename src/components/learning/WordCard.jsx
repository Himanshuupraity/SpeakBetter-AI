import { Check, Heart, Volume2 } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import { cn } from '../../utils/cn.js';

const LEVEL_TONE = { easy: 'success', medium: 'brand', hard: 'warning' };

export default function WordCard({ word: w, progress = {}, onToggleLearned, onToggleFavorite, onSpeak, highlight }) {
  return (
    <article className={cn('rounded-2xl border bg-white p-4 shadow-soft dark:bg-slate-900', highlight ? 'border-brand-200 dark:border-brand-500/30' : 'border-slate-200/80 dark:border-slate-800')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold">{w.word}</h3>
            <Badge tone={LEVEL_TONE[w.level]}>{w.level}</Badge>
          </div>
          <p className="text-sm text-slate-500"><span className="font-mono">{w.ipa}</span> · <span className="italic">{w.partOfSpeech}</span></p>
        </div>
        <div className="flex shrink-0 gap-1">
          {onSpeak && (
            <button type="button" onClick={() => onSpeak(w.word)} className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800" aria-label={`Pronounce ${w.word}`}>
              <Volume2 className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleFavorite(w)}
            aria-pressed={Boolean(progress.favorite)}
            className={cn('grid size-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800', progress.favorite ? 'text-rose-500' : 'text-slate-400')}
            aria-label={progress.favorite ? `Remove ${w.word} from favourites` : `Add ${w.word} to favourites`}
          >
            <Heart className={cn('size-5', progress.favorite && 'fill-current')} />
          </button>
        </div>
      </div>
      <p className="mt-2 text-[15px]"><span className="font-semibold">Meaning:</span> {w.meaning}</p>
      <button type="button" onClick={() => onSpeak?.(w.example)} className="mt-2 flex w-full items-start gap-2 rounded-xl bg-slate-50 p-2.5 text-left text-sm italic hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
        <Volume2 className="mt-0.5 size-4 shrink-0 text-brand-600 not-italic" aria-hidden="true" />“{w.example}”<span className="sr-only"> — listen</span>
      </button>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-xs font-semibold text-slate-500 uppercase">Synonyms</dt><dd>{w.synonyms.join(', ') || '—'}</dd></div>
        <div><dt className="text-xs font-semibold text-slate-500 uppercase">Antonyms</dt><dd>{w.antonyms.join(', ') || '—'}</dd></div>
      </dl>
      <button
        type="button"
        onClick={() => onToggleLearned(w)}
        aria-pressed={Boolean(progress.learned)}
        className={cn('mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors', progress.learned ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-brand-600 text-white hover:bg-brand-700')}
      >
        <Check className="size-4" aria-hidden="true" />{progress.learned ? 'Learned' : 'Mark as learned'}
      </button>
    </article>
  );
}
