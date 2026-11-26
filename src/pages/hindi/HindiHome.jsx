import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookA, ChevronRight, ClipboardCheck, GraduationCap, Languages, MessagesSquare, Sparkles, Type } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatTile from '../../components/common/StatTile.jsx';
import SessionListItem from '../../components/dashboard/SessionListItem.jsx';
import { HindiText, HindiVoiceNotice, ListenButtons } from '../../components/hindi/HindiShared.jsx';
import { HINDI_LESSONS, HINDI_PHRASES, HINDI_WORDS } from '../../data/hindi.js';
import { useApp } from '../../context/AppContext.jsx';
import { useHindiVoice } from '../../hooks/useHindiVoice.js';
import { skillScore } from '../../utils/stats.js';
import { dayKey, seededShuffle } from '../../utils/date.js';

const HINDI_SECTIONS = [
  { to: '/hindi/alphabet', label: 'Alphabet', hi: 'वर्णमाला', icon: Type, description: 'Vowels, consonants and matras, with sounds' },
  { to: '/hindi/words', label: 'Words', hi: 'शब्द', icon: BookA, description: `${HINDI_WORDS.length} everyday words with flashcards` },
  { to: '/hindi/phrases', label: 'Speak phrases', hi: 'बोलचाल', icon: MessagesSquare, description: `${HINDI_PHRASES.length} useful phrases. Listen, speak and get a score` },
  { to: '/hindi/grammar', label: 'Grammar', hi: 'व्याकरण', icon: GraduationCap, description: `${HINDI_LESSONS.length} short lessons with quizzes` },
  { to: '/hindi/quiz', label: 'Word quiz', hi: 'प्रश्नोत्तरी', icon: ClipboardCheck, description: 'Test the words you’ve learned' },
];

export default function HindiHome() {
  const { state } = useApp();
  const voice = useHindiVoice();
  const sessions = state.sessions.filter((s) => s.type === 'hindi');
  const learned = HINDI_WORDS.filter((w) => state.vocab[w.id]?.learned).length;
  const score = skillScore(sessions, 'hindi');
  const wordOfDay = useMemo(() => seededShuffle(HINDI_WORDS, `hi-wod-${dayKey()}`)[0], []);
  const phraseOfDay = useMemo(() => seededShuffle(HINDI_PHRASES, `hi-pod-${dayKey()}`)[0], []);

  return (
    <div>
      <PageHeader title="Learn Hindi" subtitle="हिंदी सीखें · Read, listen and speak Hindi step by step" icon={Languages} />
      <HindiVoiceNotice voice={voice} className="mb-4" />

      <div className="mb-5 grid grid-cols-3 gap-2">
        <StatTile label="Words learned" value={`${learned}/${HINDI_WORDS.length}`} />
        <StatTile label="Hindi score" value={score ?? '—'} />
        <StatTile label="Sessions" value={sessions.length} />
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <Card>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500"><Sparkles className="size-4 text-amber-500" aria-hidden="true" />Word of the day</p>
          <div className="flex items-start justify-between gap-2">
            <HindiText hi={wordOfDay.hi} roman={wordOfDay.roman} en={wordOfDay.en} big />
            <ListenButtons text={wordOfDay.hi} speak={voice.speak} label={wordOfDay.roman} />
          </div>
          <p lang="hi" className="mt-3 text-sm">{wordOfDay.example.hi}</p>
          <p className="text-xs text-slate-500">{wordOfDay.example.en}</p>
        </Card>
        <Card>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500"><MessagesSquare className="size-4 text-brand-500" aria-hidden="true" />Phrase of the day</p>
          <div className="flex items-start justify-between gap-2">
            <HindiText hi={phraseOfDay.hi} roman={phraseOfDay.roman} en={phraseOfDay.en} />
            <ListenButtons text={phraseOfDay.hi} speak={voice.speak} label={phraseOfDay.roman} />
          </div>
          <Link to={`/hindi/phrases?practice=${phraseOfDay.id}`} className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">Practise saying it →</Link>
        </Card>
      </div>

      <h2 className="mb-2 px-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Start learning</h2>
      <ul className="mb-6 grid gap-2 sm:grid-cols-2">
        {HINDI_SECTIONS.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-soft hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><item.icon className="size-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{item.label} <span lang="hi" className="font-normal text-slate-500">· {item.hi}</span></span>
                <span className="block text-sm text-slate-500">{item.description}</span>
              </span>
              <ChevronRight className="size-5 text-slate-400" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      {sessions.length > 0 && (
        <Card>
          <h2 className="mb-1 font-semibold">Recent Hindi practice</h2>
          <ul>
            {sessions.slice(0, 5).map((s) => <li key={s.id}><SessionListItem session={s} /></li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}
