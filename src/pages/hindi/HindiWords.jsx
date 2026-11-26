import { useState } from 'react';
import { BookA, Check, Heart, Layers } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import ChoiceGroup from '../../components/common/ChoiceGroup.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Flashcards from '../../components/learning/Flashcards.jsx';
import { HindiText, HindiVoiceNotice, ListenButtons } from '../../components/hindi/HindiShared.jsx';
import { HINDI_WORD_CATEGORIES, HINDI_WORDS } from '../../data/hindi.js';
import { useApp } from '../../context/AppContext.jsx';
import { useHindiVoice } from '../../hooks/useHindiVoice.js';
import { dayKey, seededShuffle } from '../../utils/date.js';
import { toFlashcard } from '../../utils/hindi.js';
import { cn } from '../../utils/cn.js';

const categoryLabel = (id) => HINDI_WORD_CATEGORIES.find((c) => c.id === id)?.label || id;

function HindiWordCard({ word, progress = {}, speak, onToggleLearned, onToggleFavorite }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <HindiText hi={word.hi} roman={word.roman} en={word.en} />
        <div className="flex shrink-0 items-start">
          <ListenButtons text={word.hi} speak={speak} label={word.roman} />
          <button
            type="button"
            onClick={() => onToggleFavorite(word)}
            aria-pressed={Boolean(progress.favorite)}
            className={cn('grid size-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800', progress.favorite ? 'text-rose-500' : 'text-slate-400')}
            aria-label={progress.favorite ? `Remove ${word.roman} from favourites` : `Add ${word.roman} to favourites`}
          >
            <Heart className={cn('size-5', progress.favorite && 'fill-current')} aria-hidden="true" />
          </button>
        </div>
      </div>
      <button type="button" onClick={() => speak(word.example.hi)} className="mt-2 w-full rounded-xl bg-slate-50 p-2.5 text-left text-sm hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
        <span lang="hi" className="block">{word.example.hi}</span>
        <span className="block text-xs text-brand-700 italic dark:text-brand-300">{word.example.roman}</span>
        <span className="block text-xs text-slate-500">{word.example.en}</span>
        <span className="sr-only"> — listen</span>
      </button>
      <button
        type="button"
        onClick={() => onToggleLearned(word)}
        aria-pressed={Boolean(progress.learned)}
        className={cn('mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors', progress.learned ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-brand-600 text-white hover:bg-brand-700')}
      >
        <Check className="size-4" aria-hidden="true" />{progress.learned ? 'Learned' : 'Mark as learned'}
      </button>
    </article>
  );
}

export default function HindiWords() {
  const { state, updateWord, reviewWord, recordSession } = useApp();
  const voice = useHindiVoice();
  const [category, setCategory] = useState('all');
  const [filter, setFilter] = useState('all');
  const [deck, setDeck] = useState(null);
  const vocab = state.vocab;

  const list = HINDI_WORDS.filter((w) => (category === 'all' || w.category === category) && (filter === 'all' || (filter === 'new' && !vocab[w.id]?.learned) || (filter === 'learned' && vocab[w.id]?.learned) || (filter === 'favorites' && vocab[w.id]?.favorite)));
  const due = HINDI_WORDS.filter((w) => vocab[w.id]?.learned && new Date(vocab[w.id].due || 0) <= new Date());
  const learned = HINDI_WORDS.filter((w) => vocab[w.id]?.learned).length;

  const toggleLearned = (w) => updateWord(w.id, { learned: !vocab[w.id]?.learned, learnedOn: dayKey() });
  const toggleFavorite = (w) => updateWord(w.id, { favorite: !vocab[w.id]?.favorite });

  const startDeck = (title, words, kind) => setDeck({ title, kind, words: words.map((w) => ({ ...toFlashcard(w, categoryLabel(w.category)), source: w })) });

  const finishDeck = (grades, durationSec) => {
    const known = grades.filter((g) => g.grade !== 'again').length;
    const score = Math.round((known / grades.length) * 100);
    recordSession({
      type: 'hindi',
      title: `Hindi flashcards: ${deck.title}`,
      durationSec,
      score,
      skills: { hindi: score },
      details: { activity: 'flashcards', correct: known, total: grades.length },
      mistakes: grades
        .filter((g) => g.grade === 'again')
        .map(({ word: { source: w } }) => ({ source: 'hindi', category: 'hindi', said: `Forgot the Hindi word “${w.hi}” (${w.roman})`, correct: `${w.hi} (${w.roman}) = ${w.en}`, why: `Example: ${w.example.hi} — ${w.example.en}`, practice: { question: `How do you say “${w.en}” in Hindi?`, answer: `${w.hi} (${w.roman})` }, topic: null })),
    });
  };

  if (deck) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Hindi Flashcards" subtitle={deck.title} actions={<Button variant="ghost" size="sm" onClick={() => setDeck(null)}>Close</Button>} />
        <Flashcards
          words={deck.words}
          title={deck.title}
          onSpeak={(t) => voice.speak(t)}
          onGrade={(w, g) => {
            if (deck.kind === 'review') reviewWord(w.id, g);
            else if (g !== 'again') updateWord(w.id, { learned: true, learnedOn: dayKey() });
          }}
          onFinish={finishDeck}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Hindi Words" subtitle={`शब्द · ${learned} of ${HINDI_WORDS.length} learned`} back="/hindi" icon={BookA} />
      <HindiVoiceNotice voice={voice} className="mb-4" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" icon={Layers} onClick={() => startDeck(category === 'all' ? 'Mixed words' : categoryLabel(category), seededShuffle(list.length ? list : HINDI_WORDS, String(Date.now())).slice(0, 12), 'learn')}>Study as flashcards</Button>
        {due.length > 0 && <Button size="sm" variant="secondary" icon={Layers} onClick={() => startDeck('Review', seededShuffle(due, String(Date.now())).slice(0, 20), 'review')}>Review {due.length} due</Button>}
      </div>
      <div className="scrollbar-none -mx-4 mb-3 overflow-x-auto px-4">
        <ChoiceGroup label="Category" hideLabel options={[{ id: 'all', label: 'All' }, ...HINDI_WORD_CATEGORIES]} value={category} onChange={setCategory} className="[&>div]:flex-nowrap [&_label]:shrink-0" />
      </div>
      <ChoiceGroup label="Show" hideLabel className="mb-4" options={[{ id: 'all', label: 'All words' }, { id: 'new', label: 'New' }, { id: 'learned', label: 'Learned' }, { id: 'favorites', label: 'Favourites' }]} value={filter} onChange={setFilter} />
      {list.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((w) => <HindiWordCard key={w.id} word={w} progress={vocab[w.id]} speak={voice.speak} onToggleLearned={toggleLearned} onToggleFavorite={toggleFavorite} />)}
        </div>
      ) : (
        <EmptyState icon={BookA} title="No words here yet">Try a different filter.</EmptyState>
      )}
    </div>
  );
}
