import { useState } from 'react';
import { Type } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs, { TabPanel } from '../../components/common/Tabs.jsx';
import { HindiVoiceNotice, ListenButtons } from '../../components/hindi/HindiShared.jsx';
import { CONSONANT_GROUPS, VOWELS } from '../../data/hindi.js';
import { useHindiVoice } from '../../hooks/useHindiVoice.js';
import { cn } from '../../utils/cn.js';

const TABS = [
  { id: 'vowels', label: 'Vowels · स्वर' },
  { id: 'consonants', label: 'Consonants · व्यंजन' },
  { id: 'matras', label: 'Matras' },
];

const MATRA_BASES = ['क', 'म', 'स'];

function LetterTile({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-pressed={selected}
      className={cn(
        'flex aspect-square flex-col items-center justify-center rounded-2xl border bg-white shadow-soft transition-colors dark:bg-slate-900',
        selected ? 'border-brand-600 ring-2 ring-brand-600/30 dark:border-brand-400' : 'border-slate-200/80 hover:border-brand-300 dark:border-slate-800',
      )}
    >
      <span lang="hi" className="text-3xl leading-none font-semibold sm:text-4xl">{item.letter}</span>
      <span className="mt-1 text-xs text-slate-500">{item.roman}</span>
    </button>
  );
}

function LetterDetail({ item, speak }) {
  if (!item) return null;
  return (
    <Card className="mb-4 animate-fade-in" aria-live="polite">
      <div className="flex items-start gap-4">
        <span lang="hi" className="grid size-20 shrink-0 place-items-center rounded-2xl bg-brand-50 text-5xl font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{item.letter}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-bold">“{item.roman}”</p>
              {item.sound && <p className="text-sm text-slate-600 dark:text-slate-400">Sounds like {item.sound}</p>}
              {item.matra !== undefined && <p className="text-sm text-slate-600 dark:text-slate-400">Matra: {item.matra ? <span lang="hi" className="text-lg font-semibold">◌{item.matra}</span> : 'none (built into every consonant)'}</p>}
            </div>
            <ListenButtons text={item.letter} speak={speak} label={item.roman} />
          </div>
          {item.example ? (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <p><span lang="hi" className="text-lg font-semibold">{item.example.hi}</span> <span className="text-sm text-brand-700 italic dark:text-brand-300">{item.example.roman}</span> <span className="text-sm text-slate-500">· {item.example.en}</span></p>
              <ListenButtons text={item.example.hi} speak={speak} label={item.example.roman} size="sm" />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">This letter is rarely used on its own. You’ll mostly see it inside words such as <span lang="hi">गंगा</span> or <span lang="hi">पंजाब</span>, written today with a dot (ं).</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function HindiAlphabet() {
  const voice = useHindiVoice();
  const [tab, setTab] = useState('vowels');
  const [selected, setSelected] = useState(VOWELS[0]);
  const [base, setBase] = useState('क');

  const select = (item) => {
    setSelected(item);
    voice.speak(item.letter);
  };

  return (
    <div>
      <PageHeader title="Hindi Alphabet" subtitle="वर्णमाला · Tap a letter to hear it" back="/hindi" icon={Type} />
      <HindiVoiceNotice voice={voice} className="mb-4" />
      <Tabs tabs={TABS} value={tab} onChange={(t) => { setTab(t); setSelected(t === 'consonants' ? CONSONANT_GROUPS[0].letters[0] : VOWELS[0]); }} label="Alphabet sections" />

      {tab === 'vowels' && (
        <TabPanel id="vowels">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Hindi has 13 vowels in the traditional alphabet. Each vowel has a full form (used at the start of a word) and a matra (a sign added to a consonant).</p>
          <LetterDetail item={selected} speak={voice.speak} />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {VOWELS.map((v) => <LetterTile key={v.id} item={v} selected={selected?.id === v.id} onSelect={select} />)}
          </div>
        </TabPanel>
      )}

      {tab === 'consonants' && (
        <TabPanel id="consonants">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Every consonant includes a short “a” sound: क is “ka”, not just “k”. Consonants are grouped by where your mouth makes the sound.</p>
          <LetterDetail item={selected} speak={voice.speak} />
          <div className="space-y-4">
            {CONSONANT_GROUPS.map((g) => (
              <section key={g.id} aria-labelledby={`cg-${g.id}`}>
                <h2 id={`cg-${g.id}`} lang="hi" className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{g.label}</h2>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {g.letters.map((c) => <LetterTile key={c.id} item={c} selected={selected?.id === c.id} onSelect={select} />)}
                </div>
              </section>
            ))}
          </div>
        </TabPanel>
      )}

      {tab === 'matras' && (
        <TabPanel id="matras">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Add a vowel sign (matra) to a consonant to change its sound. This is how all Hindi words are built. Tap a box to hear it.</p>
          <div className="mb-3 flex gap-2" role="radiogroup" aria-label="Choose a consonant">
            {MATRA_BASES.map((b) => (
              <button key={b} type="button" role="radio" aria-checked={base === b} onClick={() => setBase(b)} lang="hi" className={cn('h-11 min-w-14 rounded-xl border px-3 text-xl font-semibold', base === b ? 'border-brand-600 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-500/15 dark:text-brand-200' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900')}>{b}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {VOWELS.map((v) => {
              const syllable = base + v.matra;
              const consonantRoman = { क: 'k', म: 'm', स: 's' }[base];
              return (
                <button key={v.id} type="button" onClick={() => voice.speak(syllable)} className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-3 shadow-soft hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900" aria-label={`${syllable}, ${consonantRoman}${v.roman}. Listen`}>
                  <span lang="hi" className="text-3xl font-semibold">{syllable}</span>
                  <span className="mt-1 text-xs text-slate-500">{consonantRoman}{v.roman}</span>
                  <span lang="hi" className="mt-0.5 text-[11px] text-slate-400">{base} + {v.matra ? `◌${v.matra}` : v.letter}</span>
                </button>
              );
            })}
          </div>
        </TabPanel>
      )}
    </div>
  );
}
