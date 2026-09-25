import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AudioLines, Lightbulb, Play, Turtle, Volume2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import ProgressRing from '../components/common/ProgressRing.jsx';
import { DemoBadge } from '../components/common/Badge.jsx';
import MicButton from '../components/speaking/MicButton.jsx';
import { PRONUNCIATION_WORDS, SOUNDS } from '../data/pronunciation.js';
import { useApp } from '../context/AppContext.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { aiService } from '../services/aiService.js';
import { recognitionErrorMessage } from '../services/speechService.js';
import { dayKey, seededShuffle } from '../utils/date.js';
import { average } from '../utils/text.js';
import { cn } from '../utils/cn.js';

export default function Pronunciation() {
  const [params, setParams] = useSearchParams();
  const { recordSession, addMistakes } = useApp();
  const wordOfDay = useMemo(() => seededShuffle(PRONUNCIATION_WORDS, `pron-${dayKey()}`)[0], []);
  const soundParam = SOUNDS.some((s) => s.id === params.get('sound')) ? params.get('sound') : null;
  const [sound, setSound] = useState(soundParam || wordOfDay.sound);
  const words = PRONUNCIATION_WORDS.filter((w) => w.sound === sound);
  const [wordId, setWordId] = useState(soundParam ? words[0].id : wordOfDay.id);
  const word = PRONUNCIATION_WORDS.find((w) => w.id === wordId) || words[0];
  const soundInfo = SOUNDS.find((s) => s.id === word.sound);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recordVoice, setRecordVoice] = useState(true);
  const [selfCheck, setSelfCheck] = useState(null);
  const attempts = useRef([]);
  const startedAt = useRef(Date.now());

  const tts = useTextToSpeech();
  const recorder = useAudioRecorder();
  const recognition = useSpeechRecognition({
    maxAlternatives: 5,
    onResult: async ({ alternatives, transcript, confidence }) => {
      recorder.stop();
      setAnalyzing(true);
      const res = await aiService.analyzePronunciation({ target: word.word, alternatives: alternatives.length ? alternatives : [{ transcript, confidence }] });
      setAnalyzing(false);
      setResult(res);
      attempts.current.push({ word: word.word, sound: word.sound, score: res.score });
    },
  });

  useEffect(() => {
    if (!recognition.listening) recorder.stop();
  }, [recognition.listening]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (recognition.error === 'audio-capture' && recordVoice) setRecordVoice(false);
  }, [recognition.error, recordVoice]);

  // Save the practice automatically when leaving the page.
  useEffect(
    () => () => {
      const list = attempts.current;
      if (!list.length) return;
      const avg = Math.round(average(list.map((a) => a.score)));
      const weak = list.filter((a) => a.score < 60);
      recordSession({
        type: 'pronunciation',
        title: `${[...new Set(list.map((a) => SOUNDS.find((s) => s.id === a.sound)?.label))].join(', ')} Sounds`,
        durationSec: (Date.now() - startedAt.current) / 1000,
        score: avg,
        skills: { pronunciation: avg },
        details: { attempts: list, method: 'speech-recognition-estimate' },
      });
      addMistakes(
        weak.map((a) => {
          const w = PRONUNCIATION_WORDS.find((x) => x.word === a.word);
          return { source: 'pronunciation', category: 'pronunciation', sound: a.sound, said: `“${a.word}” was hard to recognise`, correct: `${a.word} ${w?.ipa || ''}`.trim(), why: `${w?.commonMistake || ''}. ${w?.tip || ''}`.trim(), practice: null, topic: null };
        }),
      );
    },
    [recordSession, addMistakes],
  );

  const chooseSound = (id) => {
    setSound(id);
    setWordId(PRONUNCIATION_WORDS.find((w) => w.sound === id).id);
    setResult(null);
    setParams(id ? { sound: id } : {}, { replace: true });
  };

  const toggleMic = async () => {
    if (recognition.listening) {
      recognition.stop();
      return;
    }
    tts.cancel();
    setResult(null);
    setSelfCheck(null);
    if (recordVoice && recorder.supported) await recorder.start();
    recognition.start();
  };

  return (
    <div>
      <PageHeader title="Pronunciation Practice" subtitle="Listen, repeat and compare" icon={AudioLines} />

      <div className="scrollbar-none -mx-4 mb-4 overflow-x-auto px-4">
        <ChoiceGroup label="Difficult sounds" hideLabel options={SOUNDS.map((s) => ({ id: s.id, label: s.label }))} value={sound} onChange={chooseSound} className="[&>div]:flex-nowrap [&_label]:shrink-0" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <Card className="text-center">
            {word.id === wordOfDay.id && <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase dark:text-brand-400">Word of the day</p>}
            <p className="mt-2 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">{word.word}</p>
            <p className="mt-2 font-mono text-lg text-slate-600 dark:text-slate-300">{word.ipa}</p>
            <p className="mt-1 text-sm text-slate-500">Slowly: <span className="font-semibold text-slate-700 dark:text-slate-200">{word.slow}</span></p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="secondary" icon={Volume2} onClick={() => tts.speak(word.word, { rate: 0.9 })} disabled={!tts.supported}>Listen</Button>
              <Button variant="outline" icon={Turtle} onClick={() => tts.speak(word.word, { rate: 0.5 })} disabled={!tts.supported}>Slow</Button>
            </div>
            <button type="button" onClick={() => tts.speak(word.example)} disabled={!tts.supported} className="mx-auto mt-4 flex max-w-md items-start gap-2 rounded-xl bg-slate-50 p-3 text-left text-sm hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
              <Volume2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span><span className="sr-only">Listen to example: </span>“{word.example}”</span>
            </button>

            <div className="mt-6 flex flex-col items-center gap-2">
              {recognition.supported ? (
                <>
                  <MicButton listening={recognition.listening} disabled={analyzing} onClick={toggleMic} label={recognition.listening ? 'Stop recording' : `Say the word ${word.word}`} />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400" aria-live="polite">
                    {recognition.listening ? 'Listening… say the word now' : analyzing ? 'Analysing…' : 'Tap and say the word'}
                  </p>
                  {recorder.supported && (
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      <input type="checkbox" checked={recordVoice} onChange={(e) => setRecordVoice(e.target.checked)} className="size-4 accent-brand-600" />
                      Record my voice for playback
                    </label>
                  )}
                </>
              ) : (
                <Alert tone="warning" className="text-left">
                  Speech recognition isn’t available in this browser, so automatic scoring is off. Listen to Emma, repeat the word out loud, then check yourself below.
                </Alert>
              )}
              {recognition.error && recognition.supported && <Alert tone="warning" className="mt-2 text-left">{recognitionErrorMessage(recognition.error)}</Alert>}
            </div>
          </Card>

          {result && (
            <Card className="animate-fade-in" aria-live="polite">
              <div className="flex items-center justify-between"><CardTitle className="mb-0">Your result</CardTitle>{result.demo && <DemoBadge label="Estimate" />}</div>
              <div className="mt-3 flex items-center gap-5">
                <ProgressRing value={result.score / 100} size={96} stroke={9} label={`Pronunciation score ${result.score}%`} colorClass={result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-rose-500'}>
                  <span className="text-2xl font-bold tabular-nums">{result.score}%</span>
                </ProgressRing>
                <div className="min-w-0 text-sm">
                  <p><span className="text-slate-500">Target:</span> <span className="font-semibold">{word.word}</span></p>
                  <p><span className="text-slate-500">We heard:</span> <span className="font-semibold">“{result.heard || '—'}”</span></p>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{result.feedback}</p>
                </div>
              </div>
              {recorder.audioUrl && (
                <div className="mt-4">
                  <p className="mb-1 text-xs font-semibold text-slate-500">Your recording</p>
                  <audio controls src={recorder.audioUrl} className="w-full" />
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500">This score is estimated from browser speech recognition and can’t judge individual sounds precisely. Use it as a guide, and compare your recording with Emma’s.</p>
              <Button variant="outline" block className="mt-3" icon={Play} onClick={() => tts.speak(word.word, { rate: 0.5 })} disabled={!tts.supported}>Hear it again slowly</Button>
            </Card>
          )}

          {!recognition.supported && (
            <Card>
              <p className="text-sm font-semibold">How did it sound?</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant={selfCheck === 'good' ? 'success' : 'outline'} onClick={() => { setSelfCheck('good'); attempts.current.push({ word: word.word, sound: word.sound, score: 80 }); }}>Sounded right</Button>
                <Button variant={selfCheck === 'practice' ? 'primary' : 'outline'} onClick={() => { setSelfCheck('practice'); attempts.current.push({ word: word.word, sound: word.sound, score: 50 }); }}>Needs practice</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle icon={Lightbulb}>How to say {soundInfo.label}</CardTitle>
            <p className="text-sm text-slate-700 dark:text-slate-300">{soundInfo.description}</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Tip:</span> {soundInfo.tip}</p>
            <p className="mt-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-500/10 dark:text-rose-100"><span className="font-semibold">Common mistake:</span> {soundInfo.commonIssue}</p>
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
              <p><span className="font-semibold">For “{word.word}”:</span> {word.tip}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400"><span className="font-semibold">Watch out:</span> {word.commonMistake}</p>
            </div>
          </Card>
          <Card>
            <CardTitle>Practise more {soundInfo.label} words</CardTitle>
            <ul className="grid grid-cols-2 gap-2">
              {words.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => { setWordId(w.id); setResult(null); setSelfCheck(null); }}
                    aria-pressed={w.id === word.id}
                    className={cn('w-full rounded-xl border px-3 py-2.5 text-left', w.id === word.id ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/15' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700')}
                  >
                    <span className="block font-semibold">{w.word}</span>
                    <span className="block font-mono text-xs text-slate-500">{w.ipa}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Your attempts are saved to your history automatically when you leave this page.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
