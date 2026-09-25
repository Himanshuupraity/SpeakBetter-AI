import { useMemo, useState } from 'react';
import { BookA, Layers, Sparkles } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Tabs, { TabPanel } from '../components/common/Tabs.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import StatTile from '../components/common/StatTile.jsx';
import WordCard from '../components/learning/WordCard.jsx';
import Flashcards from '../components/learning/Flashcards.jsx';
import { VOCAB_CATEGORIES, WORDS } from '../data/vocabulary.js';
import { useApp } from '../context/AppContext.jsx';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { dayKey, seededShuffle } from '../utils/date.js';

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'review', label: 'Review' },
  { id: 'browse', label: 'All words' },
];

export default function Vocabulary() {
  const { state, updateWord, reviewWord, recordSession } = useApp();
  const tts = useTextToSpeech();
  const [tab, setTab] = useState('today');
  const [deck, setDeck] = useState(null); // { title, words, kind }
  const [category, setCategory] = useState('all');
  const [filter, setFilter] = useState('all');
  const vocab = state.vocab;

  const wordOfDay = useMemo(() => seededShuffle(WORDS, `wod-${dayKey()}`)[0], []);
  const daily10 = useMemo(() => {
    const unlearned = WORDS.filter((w) => !vocab[w.id]?.learned || vocab[w.id]?.learnedOn === dayKey());
    return seededShuffle(unlearned.length >= 10 ? unlearned : WORDS, `daily-${dayKey()}`).slice(0, 10);
    // Recompute only once per day so the list doesn't shrink as words are learned.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const due = WORDS.filter((w) => vocab[w.id]?.learned && new Date(vocab[w.id].due || 0) <= new Date());
  const learnedCount = Object.values(vocab).filter((v) => v.learned).length;

  const browse = WORDS.filter((w) => (category === 'all' || w.category === category) && (filter === 'all' || (filter === 'learned' && vocab[w.id]?.learned) || (filter === 'favorites' && vocab[w.id]?.favorite) || (filter === 'new' && !vocab[w.id]?.learned)));

  const toggleLearned = (w) => updateWord(w.id, { learned: !vocab[w.id]?.learned, learnedOn: dayKey() });
  const toggleFavorite = (w) => updateWord(w.id, { favorite: !vocab[w.id]?.favorite });
  const speak = (t) => tts.speak(t, { rate: 0.9 });

  const finishDeck = (grades, durationSec) => {
    const known = grades.filter((g) => g.grade !== 'again').length;
    const score = Math.round((known / grades.length) * 100);
    recordSession({
      type: 'vocabulary',
      title: deck.title,
      durationSec,
      score,
      skills: { vocabulary: score },
      details: { words: grades.map((g) => ({ word: g.word.word, grade: g.grade })), correct: known, total: grades.length },
      mistakes: grades
        .filter((g) => g.grade === 'again')
        .map((g) => ({ source: 'vocabulary', category: 'vocabulary', said: `Forgot the meaning of “${g.word.word}”`, correct: `${g.word.word} — ${g.word.meaning}`, why: `Example: “${g.word.example}”`, practice: { question: `Which word means: “${g.word.meaning}”`, answer: g.word.word }, topic: null })),
    });
  };

  if (deck) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Flashcards" subtitle={deck.title} actions={<Button variant="ghost" size="sm" onClick={() => setDeck(null)}>Close</Button>} />
        <Flashcards
          words={deck.words}
          title={deck.title}
          onSpeak={speak}
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
      <PageHeader title="Vocabulary" subtitle="Learn useful words and review them at the right time" icon={BookA} />
      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatTile label="Learned" value={learnedCount} />
        <StatTile label="Due for review" value={due.length} />
        <StatTile label="Favourites" value={Object.values(vocab).filter((v) => v.favorite).length} />
      </div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Vocabulary sections" />

      {tab === 'today' && (
        <TabPanel id="today">
          <div className="space-y-5">
            <section aria-labelledby="wod">
              <h2 id="wod" className="mb-2 flex items-center gap-2 font-semibold"><Sparkles className="size-5 text-amber-500" aria-hidden="true" />Word of the Day</h2>
              <WordCard word={wordOfDay} progress={vocab[wordOfDay.id]} onToggleLearned={toggleLearned} onToggleFavorite={toggleFavorite} onSpeak={speak} highlight />
            </section>
            <section aria-labelledby="daily10">
              <div className="mb-2 flex items-center justify-between">
                <h2 id="daily10" className="font-semibold">Today’s 10 words <span className="font-normal text-slate-500">· {daily10.filter((w) => vocab[w.id]?.learned).length}/10 learned</span></h2>
                <Button size="sm" icon={Layers} onClick={() => setDeck({ title: 'Daily 10 Words', words: daily10, kind: 'learn' })}>Study as flashcards</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {daily10.map((w) => <WordCard key={w.id} word={w} progress={vocab[w.id]} onToggleLearned={toggleLearned} onToggleFavorite={toggleFavorite} onSpeak={speak} />)}
              </div>
            </section>
          </div>
        </TabPanel>
      )}

      {tab === 'review' && (
        <TabPanel id="review">
          {due.length ? (
            <Card className="text-center">
              <p className="text-4xl font-extrabold text-brand-600">{due.length}</p>
              <p className="font-semibold">words are due for review</p>
              <p className="mt-1 text-sm text-slate-500">Spaced repetition shows each word just before you’re likely to forget it. Words you know well come back less often.</p>
              <Button size="lg" className="mt-4" icon={Layers} onClick={() => setDeck({ title: 'Spaced Review', words: seededShuffle(due, String(Date.now())).slice(0, 20), kind: 'review' })}>Start review</Button>
            </Card>
          ) : (
            <EmptyState icon={Layers} title="You’re all caught up!" action={<Button size="sm" onClick={() => setTab('today')}>Learn new words</Button>}>No words are due right now. Learn new words and they’ll appear here for review.</EmptyState>
          )}
        </TabPanel>
      )}

      {tab === 'browse' && (
        <TabPanel id="browse">
          <div className="scrollbar-none -mx-4 mb-3 overflow-x-auto px-4">
            <ChoiceGroup label="Category" hideLabel options={[{ id: 'all', label: 'All' }, ...VOCAB_CATEGORIES]} value={category} onChange={setCategory} className="[&>div]:flex-nowrap [&_label]:shrink-0" />
          </div>
          <ChoiceGroup label="Show" hideLabel className="mb-4" options={[{ id: 'all', label: 'All words' }, { id: 'new', label: 'New' }, { id: 'learned', label: 'Learned' }, { id: 'favorites', label: 'Favourites' }]} value={filter} onChange={setFilter} />
          {browse.length ? (
            <>
              <Button variant="secondary" size="sm" className="mb-3" icon={Layers} onClick={() => setDeck({ title: `${category === 'all' ? 'All' : VOCAB_CATEGORIES.find((c) => c.id === category).label} Flashcards`, words: seededShuffle(browse, String(Date.now())).slice(0, 15), kind: 'learn' })}>Flashcards from this list</Button>
              <div className="grid gap-3 md:grid-cols-2">
                {browse.map((w) => <WordCard key={w.id} word={w} progress={vocab[w.id]} onToggleLearned={toggleLearned} onToggleFavorite={toggleFavorite} onSpeak={speak} />)}
              </div>
            </>
          ) : (
            <EmptyState icon={BookA} title="No words here yet">Try a different filter.</EmptyState>
          )}
        </TabPanel>
      )}
    </div>
  );
}
