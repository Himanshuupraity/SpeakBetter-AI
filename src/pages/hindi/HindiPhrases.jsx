import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Info, MessagesSquare, Mic } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Alert from '../../components/common/Alert.jsx';
import ChoiceGroup from '../../components/common/ChoiceGroup.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import MicButton from '../../components/speaking/MicButton.jsx';
import { HindiText, HindiVoiceNotice, ListenButtons } from '../../components/hindi/HindiShared.jsx';
import { HINDI_PHRASES, PHRASE_GROUPS } from '../../data/hindi.js';
import { useApp } from '../../context/AppContext.jsx';
import { useHindiVoice } from '../../hooks/useHindiVoice.js';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { recognitionErrorMessage } from '../../services/speechService.js';
import { compareHindi, feedbackFor, HINDI_LANG } from '../../utils/hindi.js';
import { scoreColor } from '../../utils/levels.js';
import { cn } from '../../utils/cn.js';

const ALERT_TONE = { success: 'success', warning: 'warning', danger: 'error' };

/** Speak one phrase after another and get a score for each. */
function PracticeSession({ phrases, title, voice, onExit }) {
  const { recordSession } = useApp();
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(null); // { transcript, result }
  const [best, setBest] = useState({}); // phraseId -> best score
  const startedAt = useRef(Date.now());
  const saved = useRef(false);
  const phrase = phrases[index];

  const rec = useSpeechRecognition({
    lang: HINDI_LANG,
    maxAlternatives: 3,
    onResult: ({ transcript, alternatives }) => {
      // Recognisers sometimes put the closest match second; score the best alternative.
      const candidates = [transcript, ...alternatives.map((a) => a.transcript)];
      const scored = candidates.map((t) => ({ transcript: t, result: compareHindi(phrase.hi, t) })).sort((a, b) => b.result.score - a.result.score)[0];
      setAttempt(scored);
      setBest((b) => ({ ...b, [phrase.id]: Math.max(b[phrase.id] ?? 0, scored.result.score) }));
    },
  });

  const toggleMic = () => {
    if (rec.listening) return rec.stop();
    voice.cancel();
    setAttempt(null);
    rec.start();
  };

  /** Save the session once (idempotent). Returns the average score, or null if nothing was practised. */
  const save = () => {
    const ids = Object.keys(best);
    if (!ids.length) return null;
    const scores = ids.map((id) => best[id]);
    const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    if (saved.current) return score;
    saved.current = true;
    recordSession({
      type: 'hindi',
      title: `Hindi speaking: ${title}`,
      durationSec: (Date.now() - startedAt.current) / 1000,
      score,
      skills: { hindi: score },
      details: { activity: 'speaking', correct: scores.filter((s) => s >= 70).length, total: scores.length },
      mistakes: ids
        .filter((id) => best[id] < 70)
        .map((id) => {
          const p = HINDI_PHRASES.find((x) => x.id === id);
          return { source: 'hindi', category: 'hindi', said: `Hard to say: “${p.hi}” (best score ${best[id]})`, correct: `${p.hi} (${p.roman}) = ${p.en}`, why: 'Listen at slow speed, then repeat it word by word.', practice: { question: `Say in Hindi: “${p.en}”`, answer: `${p.hi} (${p.roman})` }, topic: null };
        }),
    });
    return score;
  };

  const finish = () => {
    rec.abort();
    onExit(save());
  };

  // Save progress (without navigating) if the learner leaves the page mid-session.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => () => void saveRef.current(), []);

  const next = () => {
    rec.abort();
    setAttempt(null);
    if (index + 1 >= phrases.length) finish();
    else setIndex(index + 1);
  };

  const fb = attempt && feedbackFor(attempt.result.score);
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Speak Hindi" subtitle={title} actions={<Button variant="ghost" size="sm" onClick={finish}>Finish</Button>} />
      <div className="mb-2 flex justify-between text-xs font-medium text-slate-500"><span>Phrase {index + 1} of {phrases.length}</span><span>{Object.keys(best).length} practised</span></div>
      <ProgressBar value={index} max={phrases.length} size="sm" className="mb-4" label="Practice progress" />
      <Card className="text-center">
        <p className="text-sm text-slate-500">Say this in Hindi:</p>
        <p className="mt-1 text-lg font-semibold">{phrase.en}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <HindiText hi={phrase.hi} roman={phrase.roman} big />
          <ListenButtons text={phrase.hi} speak={voice.speak} label={phrase.roman} />
        </div>
        {phrase.note && <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-slate-50 p-2.5 text-left text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"><Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" /><span>{phrase.note}</span></p>}

        <div className="mt-6 flex flex-col items-center gap-2">
          <MicButton listening={rec.listening} onClick={toggleMic} disabled={!rec.supported} label={rec.listening ? 'Stop recording' : 'Tap and say the phrase in Hindi'} />
          <p className="min-h-6 text-sm text-slate-500" aria-live="polite" lang="hi">{rec.listening ? (rec.interim || 'Listening… बोलिए') : rec.supported ? 'Tap the mic and say the phrase' : ''}</p>
        </div>
        {rec.error && <Alert tone="warning" className="mt-2 text-left">{recognitionErrorMessage(rec.error)}</Alert>}
        {!rec.supported && <Alert tone="info" className="mt-2 text-left">Voice input isn’t supported in this browser. Listen to the phrase and repeat it aloud, then move on. Chrome, Edge and Safari support Hindi speech recognition.</Alert>}

        {attempt && (
          <div className="mt-4 animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">You said</p>
              <p className={cn('text-2xl font-extrabold tabular-nums', scoreColor(attempt.result.score))}>{attempt.result.score}<span className="text-sm font-medium text-slate-500">/100</span></p>
            </div>
            <p lang="hi" className="mt-1 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">{attempt.transcript}</p>
            <p className="mt-3 text-sm font-semibold text-slate-500">Word by word</p>
            <p lang="hi" className="mt-1 flex flex-wrap gap-1.5 text-lg">
              {attempt.result.words.map((w, i) => (
                <span key={`${w.word}-${i}`} className={cn('rounded-lg px-2 py-0.5', w.matched ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-rose-50 text-rose-800 underline decoration-wavy dark:bg-rose-500/15 dark:text-rose-200')}>
                  {w.word}<span className="sr-only">{w.matched ? ' (correct)' : ' (missed)'}</span>
                </span>
              ))}
            </p>
            <Alert tone={ALERT_TONE[fb.tone]} title={fb.title} className="mt-3">{fb.text}</Alert>
            <p className="mt-2 text-xs text-slate-500">The score shows how closely the speech recogniser’s text matched the phrase. It’s an estimate, not a full pronunciation check.</p>
          </div>
        )}
      </Card>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" icon={Mic} onClick={toggleMic} disabled={!rec.supported || rec.listening}>Try again</Button>
        <Button onClick={next} iconRight={ArrowRight}>{index + 1 >= phrases.length ? 'Finish' : 'Next phrase'}</Button>
      </div>
    </div>
  );
}

export default function HindiPhrases() {
  const voice = useHindiVoice();
  const [params, setParams] = useSearchParams();
  const [group, setGroup] = useState('greetings');
  const [doneScore, setDoneScore] = useState(null);
  const practiceId = params.get('practice');

  const list = HINDI_PHRASES.filter((p) => p.group === group);
  const groupLabel = PHRASE_GROUPS.find((g) => g.id === group)?.label;

  // ?practice=<phrase id> starts at that phrase within its group; ?practice=group practises the selected group.
  const session = useMemo(() => {
    if (!practiceId) return null;
    const single = HINDI_PHRASES.find((p) => p.id === practiceId);
    if (single) {
      const rest = HINDI_PHRASES.filter((p) => p.group === single.group && p.id !== single.id);
      return { title: PHRASE_GROUPS.find((g) => g.id === single.group)?.label, phrases: [single, ...rest] };
    }
    const g = PHRASE_GROUPS.find((x) => x.id === practiceId);
    return g ? { title: g.label, phrases: HINDI_PHRASES.filter((p) => p.group === g.id) } : null;
  }, [practiceId]);

  if (session) {
    return (
      <PracticeSession
        key={practiceId}
        phrases={session.phrases}
        title={session.title}
        voice={voice}
        onExit={(score) => {
          if (score != null) setDoneScore({ score, title: session.title });
          setParams({}, { replace: true });
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader title="Hindi Phrases" subtitle="बोलचाल · Listen, then say it yourself" back="/hindi" icon={MessagesSquare} />
      <HindiVoiceNotice voice={voice} className="mb-4" />
      {doneScore && (
        <Alert tone="success" className="mb-4" title={`Saved: ${doneScore.title}`} onDismiss={() => setDoneScore(null)}>
          Your average score was <span className="font-semibold">{doneScore.score}</span>. Phrases under 70 were added to My Mistakes so you can practise them again.
        </Alert>
      )}
      <div className="scrollbar-none -mx-4 mb-4 overflow-x-auto px-4">
        <ChoiceGroup label="Situation" hideLabel options={PHRASE_GROUPS} value={group} onChange={setGroup} className="[&>div]:flex-nowrap [&_label]:shrink-0" />
      </div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-semibold">{groupLabel} <span className="font-normal text-slate-500">· {list.length} phrases</span></h2>
        <Button size="sm" icon={Mic} onClick={() => setParams({ practice: group })}>Practise speaking</Button>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((p) => (
          <li key={p.id}>
            <Card className="h-full">
              <div className="flex items-start justify-between gap-2">
                <HindiText hi={p.hi} roman={p.roman} en={p.en} />
                <ListenButtons text={p.hi} speak={voice.speak} label={p.roman} />
              </div>
              {p.note && <p className="mt-2 text-xs text-slate-500">{p.note}</p>}
              <button type="button" onClick={() => setParams({ practice: p.id })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                <Mic className="size-4" aria-hidden="true" />Say it
              </button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
