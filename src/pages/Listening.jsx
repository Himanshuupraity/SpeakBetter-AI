import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Headphones, Play, Square, Star } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Alert from '../components/common/Alert.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Quiz from '../components/common/Quiz.jsx';
import { LISTENING } from '../data/listening.js';
import { useApp } from '../context/AppContext.jsx';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { teacherService } from '../services/teacherService.js';
import { scoreColor } from '../utils/levels.js';
import { cn } from '../utils/cn.js';
import { SoundBars } from '../components/speaking/MicButton.jsx';

const SPEAKER_STYLES = [
  { dot: 'bg-rose-500', active: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200' },
  { dot: 'bg-sky-600', active: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200' },
];

const SPEEDS = [
  { id: 0.75, label: '0.75×' },
  { id: 1, label: '1×' },
  { id: 1.15, label: '1.15×' },
];

function ItemList() {
  const { state } = useApp();
  const recommended = teacherService.recommendListeningLevel(state.sessions, state.profile);
  const best = {};
  state.sessions.filter((s) => s.type === 'listening' && s.details?.itemId).forEach((s) => {
    best[s.details.itemId] = Math.max(best[s.details.itemId] || 0, s.score);
  });
  return (
    <div>
      <PageHeader title="Listening Practice" subtitle="Listen to Emma, then answer questions" icon={Headphones} />
      <Alert tone="info" className="mb-4">Recommended difficulty for you: <strong>Level {recommended}</strong>. It goes up when you score 80%+ and down below 50%.</Alert>
      {[1, 2, 3, 4, 5].map((lvl) => (
        <section key={lvl} className="mb-5" aria-labelledby={`lvl-${lvl}`}>
          <h2 id={`lvl-${lvl}`} className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
            Level {lvl} · {LISTENING.find((l) => l.level === lvl)?.cefr}
            {lvl === recommended && <Badge tone="brand" icon={Star}>Recommended</Badge>}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {LISTENING.filter((l) => l.level === lvl).map((item) => (
              <li key={item.id}>
                <Link to={`/listening/${item.id}`} className={cn('flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-soft hover:border-brand-300 dark:bg-slate-900', lvl === recommended ? 'border-brand-200 dark:border-brand-500/30' : 'border-slate-200/80 dark:border-slate-800')}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"><Headphones className="size-5" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.kind === 'conversation' ? 'Conversation' : 'Short talk'} · {item.questions.length} questions
                      {best[item.id] != null && <> · Best: <span className={cn('font-semibold', scoreColor(best[item.id]))}>{best[item.id]}%</span></>}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-slate-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Player({ item }) {
  const { recordSession, state } = useApp();
  const tts = useTextToSpeech();
  const [speed, setSpeed] = useState(1);
  const [plays, setPlays] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const cast = tts.castFor(item.lines);
  const [result, setResult] = useState(null);
  const startedAt = useRef(Date.now());

  const play = () => {
    if (tts.speaking) {
      tts.cancel();
      setActiveSpeaker(null);
      return;
    }
    setPlays((p) => p + 1);
    tts.speakLines(item.lines, { rate: speed, onLine: (_i, speaker) => setActiveSpeaker(speaker ?? null) });
  };

  const complete = (graded) => {
    tts.cancel();
    setResult(graded);
    recordSession({
      type: 'listening',
      title: item.title,
      durationSec: (Date.now() - startedAt.current) / 1000,
      score: graded.score,
      skills: { listening: graded.score },
      details: { itemId: item.id, level: item.level, plays, correct: graded.correct, total: graded.total, results: graded.results },
    });
  };

  const nextLevel = result ? teacherService.recommendListeningLevel([{ type: 'listening', date: new Date().toISOString(), score: result.score, details: { level: item.level } }], state.profile) : null;
  const nextItem = nextLevel ? LISTENING.find((l) => l.level === nextLevel && l.id !== item.id) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={item.title} subtitle={`Level ${item.level} · ${item.cefr} · ${item.kind === 'conversation' ? 'Conversation' : 'Short talk'}`} back="/listening" />
      <Card className="text-center">
        {!tts.supported ? (
          <Alert tone="warning" className="text-left">Audio playback isn’t supported in this browser. You can read the transcript below instead.</Alert>
        ) : (
          <>
            <button
              type="button"
              onClick={play}
              className="mx-auto grid size-20 place-items-center rounded-full bg-sky-600 text-white shadow-lg transition-transform hover:bg-sky-700 active:scale-95"
              aria-label={tts.speaking ? 'Stop audio' : 'Play audio'}
            >
              {tts.speaking ? <Square className="size-7 fill-current" aria-hidden="true" /> : <Play className="ml-1 size-8 fill-current" aria-hidden="true" />}
            </button>
            <p className="mt-2 text-sm text-slate-500" aria-live="polite">
              {tts.speaking ? (activeSpeaker ? `${activeSpeaker} is speaking…` : 'Playing…') : plays ? `Played ${plays}×` : 'Tap to listen'}
            </p>
            {item.kind === 'conversation' && (
              <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Speakers">
                {Object.entries(cast).map(([name, role], i) => {
                  const active = tts.speaking && activeSpeaker === name;
                  return (
                    <li
                      key={name}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all',
                        active ? SPEAKER_STYLES[i % 2].active : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300',
                      )}
                    >
                      <span className={cn('grid size-6 place-items-center rounded-full text-xs font-bold text-white', SPEAKER_STYLES[i % 2].dot)} aria-hidden="true">{name[0]}</span>
                      <span className="font-semibold">{name}</span>
                      <span className="text-xs text-slate-500">{role.gender === 'male' ? 'Male voice' : 'Female voice'}</span>
                      {active && <SoundBars className="text-current" />}
                    </li>
                  );
                })}
              </ul>
            )}
            <ChoiceGroup label="Playback speed" hideLabel className="mt-3 flex justify-center" options={SPEEDS} value={speed} onChange={setSpeed} />
          </>
        )}
      </Card>

      {(result || !tts.supported) && (
        <Card className="mt-4">
          <CardTitle>Transcript</CardTitle>
          <ul className="space-y-1.5 text-sm">
            {item.lines.map((l, i) => {
              const idx = Object.keys(cast).indexOf(l.speaker);
              return (
                <li key={i}>
                  <span className={cn('font-semibold', item.kind === 'conversation' && (idx % 2 === 0 ? 'text-rose-700 dark:text-rose-300' : 'text-sky-700 dark:text-sky-300'))}>{l.speaker}:</span> {l.text}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="mt-5">
        {!result && <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Listen as many times as you need, then answer. The transcript appears after you finish.</p>}
        <Quiz
          questions={item.questions}
          mode="quiz"
          onComplete={complete}
          onRetry={() => { setResult(null); startedAt.current = Date.now(); }}
          resultExtra={
            result && (
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {nextLevel > item.level ? 'Great listening! Next time, try a harder level.' : nextLevel < item.level ? 'This level was tough — try an easier one next.' : 'Nice work — practise another one at this level.'}
              </div>
            )
          }
        />
      </div>

      {result && (
        <Card className="mt-4">
          <CardTitle>New vocabulary</CardTitle>
          <dl className="space-y-2 text-sm">
            {item.vocabulary.map((v) => <div key={v.word} className="flex gap-2"><dt className="font-semibold">{v.word}:</dt><dd className="text-slate-600 dark:text-slate-400">{v.meaning}</dd></div>)}
          </dl>
          {nextItem && <Button to={`/listening/${nextItem.id}`} block className="mt-4" iconRight={ChevronRight}>Next: {nextItem.title} (Level {nextItem.level})</Button>}
        </Card>
      )}
    </div>
  );
}

export default function Listening() {
  const { itemId } = useParams();
  if (!itemId) return <ItemList />;
  const item = LISTENING.find((l) => l.id === itemId);
  if (!item) return <EmptyState title="Exercise not found" action={<Button to="/listening">All exercises</Button>} />;
  return <Player key={item.id} item={item} />;
}
