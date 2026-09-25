import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Gauge, RotateCcw, Shuffle, Square, Timer, Volume2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import Tabs, { TabPanel } from '../components/common/Tabs.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import Button from '../components/common/Button.jsx';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { LineChart, ChartTable } from '../components/common/Charts.jsx';
import MicButton from '../components/speaking/MicButton.jsx';
import PaceGauge from '../components/speaking/PaceGauge.jsx';
import SpeedResult from '../components/speaking/SpeedResult.jsx';
import { SPEED_PASSAGES, SPEED_PROMPTS } from '../data/speedPractice.js';
import { useApp } from '../context/AppContext.jsx';
import { useLongSpeechRecognition } from '../hooks/useLongSpeechRecognition.js';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { useTimer } from '../hooks/useTimer.js';
import { analyzePace, countWords, getPaceContext, PACE_CONTEXTS, PACE_SCALE } from '../services/engine/paceAnalyzer.js';
import { recognitionErrorMessage } from '../services/speechService.js';
import { formatClock } from '../utils/date.js';
import { cn } from '../utils/cn.js';

const MODES = [
  { id: 'read', label: 'Read aloud' },
  { id: 'free', label: 'Speak freely' },
];
const MIN_WORDS = 15;
const MAX_SECONDS = 120;

export default function SpeakingSpeed() {
  const { state, recordSession } = useApp();
  const [mode, setMode] = useState('read');
  const [passageIdx, setPassageIdx] = useState(0);
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * SPEED_PROMPTS.length));
  const [contextId, setContextId] = useState(SPEED_PASSAGES[0].context);
  const [paceGuide, setPaceGuide] = useState(true);
  const [recordVoice, setRecordVoice] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [notice, setNotice] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [guideMs, setGuideMs] = useState(0);
  const timerStart = useRef(0);

  const passage = SPEED_PASSAGES[passageIdx];
  const passageWords = useMemo(() => passage.text.split(/\s+/), [passage]);
  const context = getPaceContext(contextId);
  const targetWpm = Math.round((context.range[0] + context.range[1]) / 2);

  const speech = useLongSpeechRecognition({ maxSeconds: MAX_SECONDS });
  const tts = useTextToSpeech();
  const recorder = useAudioRecorder();
  const recording = speech.listening || timerRunning;
  const [elapsed] = useTimer(recording);
  const useTimerMode = !speech.supported && mode === 'read';

  // Smooth clock for the pace guide highlight.
  useEffect(() => {
    if (!recording) return undefined;
    const started = performance.now();
    setGuideMs(0);
    const id = setInterval(() => setGuideMs(performance.now() - started), 120);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(() => {
    if (speech.error === 'audio-capture' && recordVoice) setRecordVoice(false);
  }, [speech.error, recordVoice]);

  const finish = (raw) => {
    const result = analyzePace({ ...raw, knownWordCount: mode === 'read' ? countWords(passage.text) : undefined }, contextId);
    if (result.words < MIN_WORDS) {
      setNotice(`We only heard ${result.words} words. Speak for at least 10–15 seconds (about ${MIN_WORDS}+ words) so we can measure your speed.`);
      return;
    }
    setAnalysis(result);
    const [lo, hi] = result.range;
    recordSession({
      type: 'speed',
      title: mode === 'read' ? `Read aloud: ${passage.title}` : 'Free speaking',
      durationSec: raw.durationMs / 1000,
      score: result.score,
      skills: { pace: result.score },
      details: { mode, context: contextId, result },
      mistakes:
        result.verdict === 'perfect'
          ? []
          : [{
              source: 'speed',
              category: 'pace',
              said: result.verdict.includes('slow') ? 'Speaking too slowly' : 'Speaking too fast',
              correct: `Aim for ${lo}–${hi} words per minute (you spoke at ${result.wpm})`,
              why: result.tips[0],
              practice: null,
              topic: null,
            }],
    });
  };

  // When recognition finishes, analyse the speech.
  useEffect(() => {
    if (speech.result) finish(speech.result);
  }, [speech.result]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = async () => {
    setAnalysis(null);
    setNotice(null);
    tts.cancel();
    if (useTimerMode) {
      timerStart.current = performance.now();
      setTimerRunning(true);
      return;
    }
    if (recordVoice && recorder.supported) await recorder.start();
    speech.start();
  };

  const stopRecording = () => {
    recorder.stop();
    if (timerRunning) {
      setTimerRunning(false);
      finish({ transcript: '', samples: [], durationMs: performance.now() - timerStart.current });
      return;
    }
    speech.stop();
  };

  const changeMode = (m) => {
    if (recording) return;
    setMode(m);
    setAnalysis(null);
    setNotice(null);
  };

  const choosePassage = (idx) => {
    const i = (idx + SPEED_PASSAGES.length) % SPEED_PASSAGES.length;
    setPassageIdx(i);
    setContextId(SPEED_PASSAGES[i].context);
    setAnalysis(null);
  };

  const liveWpm = speech.listening && elapsed >= 4 ? Math.round((speech.liveWords / elapsed) * 60) : null;
  const guideIndex = paceGuide && recording ? Math.floor((guideMs / 60000) * targetWpm) : -1;

  const history = state.sessions
    .filter((s) => s.type === 'speed' && s.details?.result)
    .slice(0, 10)
    .reverse()
    .map((s, i) => ({ label: `#${i + 1}`, key: s.id, value: s.details.result.wpm }));

  return (
    <div>
      <PageHeader title="Speaking Speed" subtitle="Find out if you speak too slowly, too fast — or just right" icon={Gauge} />

      <Tabs tabs={MODES} value={mode} onChange={changeMode} label="Practice type" />

      <TabPanel id={mode}>
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <ChoiceGroup
              label="What are you practising for?"
              options={PACE_CONTEXTS.map((c) => ({ id: c.id, label: c.label }))}
              value={contextId}
              onChange={(id) => { if (!recording) { setContextId(id); setAnalysis(null); } }}
            />
            <p className="-mt-2 text-sm text-slate-600 dark:text-slate-400">
              Ideal pace: <strong>{context.range[0]}–{context.range[1]} words per minute</strong>. {context.note}
            </p>

            {mode === 'read' ? (
              <Card>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <button type="button" onClick={() => choosePassage(passageIdx - 1)} disabled={recording} className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800" aria-label="Previous passage">
                    <ChevronLeft className="size-5" />
                  </button>
                  <div className="text-center">
                    <p className="font-semibold">{passage.title}</p>
                    <p className="text-xs text-slate-500">{passage.level} · {passageWords.length} words · {passageIdx + 1}/{SPEED_PASSAGES.length}</p>
                  </div>
                  <button type="button" onClick={() => choosePassage(passageIdx + 1)} disabled={recording} className="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800" aria-label="Next passage">
                    <ChevronRight className="size-5" />
                  </button>
                </div>
                <p className="text-[17px] leading-relaxed" aria-live="off">
                  {passageWords.map((w, i) => (
                    <span
                      key={i}
                      className={cn(
                        'rounded px-0.5 transition-colors',
                        guideIndex >= 0 && i < guideIndex && 'text-slate-400 dark:text-slate-500',
                        i === guideIndex && 'bg-brand-600 text-white',
                      )}
                    >
                      {w}{' '}
                    </span>
                  ))}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={tts.speaking ? Square : Volume2}
                    disabled={!tts.supported || recording}
                    onClick={() => (tts.speaking ? tts.cancel() : tts.speak(passage.text, { rate: Math.min(1.2, Math.max(0.5, targetWpm / 200)) }))}
                  >
                    {tts.speaking ? 'Stop' : `Hear the ideal pace (~${targetWpm} wpm)`}
                  </Button>
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <input type="checkbox" checked={paceGuide} onChange={(e) => setPaceGuide(e.target.checked)} className="size-4 accent-brand-600" />
                    Pace guide (highlights words at the ideal speed)
                  </label>
                </div>
              </Card>
            ) : (
              <Card>
                <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">Talk about this for 30–60 seconds</p>
                <p className="mt-2 text-xl font-semibold">{SPEED_PROMPTS[promptIdx]}</p>
                <Button size="sm" variant="ghost" icon={Shuffle} className="mt-3" disabled={recording} onClick={() => setPromptIdx((i) => (i + 1 + Math.floor(Math.random() * (SPEED_PROMPTS.length - 1))) % SPEED_PROMPTS.length)}>
                  Different topic
                </Button>
                {!speech.supported && <Alert tone="warning" className="mt-3">Free speaking needs speech recognition, which this browser doesn’t support. Use “Read aloud” — it works with a timer.</Alert>}
              </Card>
            )}
          </div>

          {/* Recorder */}
          <Card className="flex flex-col items-center text-center lg:sticky lg:top-4 lg:self-start">
            <PaceGauge wpm={liveWpm ?? analysis?.wpm ?? null} range={context.range} live={liveWpm != null} />
            <p className="font-mono text-2xl font-semibold tabular-nums" aria-label={`Recording time ${formatClock(elapsed)}`}>{formatClock(elapsed)}</p>
            {speech.listening && <p className="text-sm text-slate-500" aria-live="polite">{speech.liveWords} words so far</p>}
            <div className="mt-4">
              {useTimerMode ? (
                <Button size="lg" icon={timerRunning ? Square : Timer} variant={timerRunning ? 'danger' : 'primary'} onClick={timerRunning ? stopRecording : startRecording}>
                  {timerRunning ? 'Stop — I finished reading' : 'Start timer & read'}
                </Button>
              ) : (
                <MicButton
                  listening={speech.listening}
                  disabled={speech.status === 'processing' || (mode === 'free' && !speech.supported)}
                  onClick={speech.listening ? stopRecording : startRecording}
                  label={speech.listening ? 'Stop and check my speed' : 'Start speaking'}
                />
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              {speech.status === 'processing' ? 'Measuring…' : recording ? 'Tap ■ when you finish' : mode === 'read' ? 'Tap and read the passage aloud' : 'Tap and start talking'}
            </p>
            {!useTimerMode && recorder.supported && !recording && (
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={recordVoice} onChange={(e) => setRecordVoice(e.target.checked)} className="size-4 accent-brand-600" />
                Record my voice for playback
              </label>
            )}
            {speech.listening && speech.liveText && <p className="mt-3 line-clamp-3 text-left text-sm text-slate-500 italic">“{speech.liveText}”</p>}
            {useTimerMode && <p className="mt-3 text-xs text-slate-500">Speech recognition isn’t available here, so we time your reading and use the passage’s word count.</p>}
            {speech.error && <Alert tone="warning" className="mt-3 text-left">{recognitionErrorMessage(speech.error)}</Alert>}
            {notice && <Alert tone="info" className="mt-3 text-left" onDismiss={() => setNotice(null)}>{notice}</Alert>}
            <p className="mt-3 text-xs text-slate-500">Maximum {MAX_SECONDS / 60} minutes per attempt.</p>
          </Card>
        </div>

        {speech.status === 'processing' && <Spinner label="Measuring your speed…" />}

        {analysis && (
          <section className="mt-6 animate-fade-in" aria-labelledby="result-h">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="result-h" className="text-lg font-bold">Your result</h2>
              <Button size="sm" variant="outline" icon={RotateCcw} onClick={() => { setAnalysis(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Try again</Button>
            </div>
            <SpeedResult result={analysis} audioUrl={recorder.audioUrl} />
          </section>
        )}

        {history.length >= 2 && (
          <Card className="mt-6">
            <CardTitle>Your speed history</CardTitle>
            <div className="mx-auto max-w-xl"><LineChart data={history} min={PACE_SCALE.min} max={PACE_SCALE.max} unit=" wpm" band={context.range} label="Words per minute in your recent attempts" /></div>
            <p className="mt-1 text-xs text-slate-500">Last {history.length} attempts. Green band = ideal pace for {context.label.toLowerCase()}.</p>
            <ChartTable data={history} valueLabel="Words per minute" caption="Recent speaking speed" />
          </Card>
        )}
      </TabPanel>
    </div>
  );
}
