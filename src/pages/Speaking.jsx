import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Keyboard, Mic, PhoneOff, Send, Volume2, VolumeX } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import Alert from '../components/common/Alert.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmmaAvatar from '../components/common/EmmaAvatar.jsx';
import ChatBubble from '../components/speaking/ChatBubble.jsx';
import MicButton, { SoundBars } from '../components/speaking/MicButton.jsx';
import SessionSetup from '../components/speaking/SessionSetup.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useLongSpeechRecognition } from '../hooks/useLongSpeechRecognition.js';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { useTimer } from '../hooks/useTimer.js';
import { aiService } from '../services/aiService.js';
import { recognitionErrorMessage, speechService } from '../services/speechService.js';
import { teacherService } from '../services/teacherService.js';
import { getMode, CONVERSATION_MODES } from '../data/conversationModes.js';
import { formatClock } from '../utils/date.js';

const SILENCE_MS = 4000; // auto-send after this much silence
const INITIAL_SILENCE_MS = 8000; // thinking time before the first word

const STATUS_TEXT = {
  thinking: 'Emma is thinking…',
  speaking: 'Emma is speaking…',
  listening: 'Listening… pause for 4s or tap ■ to send',
  idle: 'Your turn — tap the mic to speak',
};

export default function Speaking() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, stats, updateSettings, recordSession } = useApp();
  const { settings } = state;
  const recommended = teacherService.recommendDifficulty(state.sessions, state.profile);
  const initialMode = CONVERSATION_MODES.some((m) => m.id === params.get('mode')) ? params.get('mode') : 'free';

  const [phase, setPhase] = useState('setup'); // setup | active | analyzing
  const [config, setConfig] = useState({ mode: initialMode, difficulty: settings.difficulty || recommended, personality: settings.personality });
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [inputMode, setInputMode] = useState(speechService.recognitionSupported ? 'voice' : 'text');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [seconds] = useTimer(phase === 'active');
  const listRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const tts = useTextToSpeech();
  const autoSpeak = settings.autoSpeak && tts.supported;

  const handleUserTurn = useRef(null);
  // Keeps listening through short pauses; sends automatically after 4 s of silence
  // (or when the learner taps stop). Before the first word there's more time to think.
  const recognition = useLongSpeechRecognition({
    silenceMs: SILENCE_MS,
    initialSilenceMs: INITIAL_SILENCE_MS,
    maxSeconds: 180,
    onResult: ({ transcript, confidence, spokenMs }) => {
      if (!transcript) {
        setNotice({ tone: 'info', text: recognitionErrorMessage('no-speech') });
        return;
      }
      handleUserTurn.current?.(transcript, { viaVoice: true, confidence, spokenMs });
    },
  });
  const interim = recognition.listening ? recognition.liveText : '';
  const sendingIn = recognition.listening && recognition.quietMs >= 1500 ? Math.max(1, Math.ceil((SILENCE_MS - recognition.quietMs) / 1000)) : null;

  // Recognition errors → friendly message; fall back to typing when the mic can't work.
  useEffect(() => {
    if (!recognition.error) return;
    const fatal = ['not-allowed', 'service-not-allowed', 'not-supported', 'insecure', 'audio-capture'].includes(recognition.error);
    setNotice({ tone: fatal ? 'warning' : 'info', text: recognitionErrorMessage(recognition.error) });
    if (fatal) setInputMode('text');
    setStatus('idle');
  }, [recognition.error]);

  useEffect(() => {
    if (recognition.listening) setStatus('listening');
    else setStatus((s) => (s === 'listening' ? 'idle' : s));
  }, [recognition.listening]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, interim]);

  useEffect(() => () => tts.cancel(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const emmaSays = useCallback(
    (text) => {
      setMessages((m) => [...m, { role: 'ai', text }]);
      if (autoSpeak) {
        setStatus('speaking');
        tts.speak(text, {
          onEnd: () => {
            setStatus('idle');
            if (settings.autoListen && inputMode === 'voice') recognition.start();
          },
        });
      } else {
        setStatus('idle');
      }
    },
    [autoSpeak, tts, settings.autoListen, inputMode, recognition],
  );

  const askEmma = useCallback(
    async (history) => {
      setStatus('thinking');
      try {
        const reply = await aiService.generateConversation({
          mode: config.mode,
          difficulty: config.difficulty,
          personality: config.personality,
          history,
          focusTip: config.mode === 'free' && history.length === 0 ? teacherService.getSessionFocusTip(stats) : undefined,
        });
        if (reply.fallback) setNotice({ tone: 'info', text: 'Emma’s AI service is unavailable right now, so you’re chatting with demo responses.' });
        emmaSays(reply.text);
      } catch {
        setStatus('idle');
        setNotice({ tone: 'error', text: 'Emma couldn’t respond just now. Please try sending your message again.' });
      }
    },
    [config, stats, emmaSays],
  );

  handleUserTurn.current = (text, meta) => {
    const clean = text.trim();
    if (!clean) {
      setNotice({ tone: 'info', text: 'Please say or type something before sending.' });
      return;
    }
    setNotice(null);
    const next = [...messagesRef.current, { role: 'user', text: clean, ...meta }];
    setMessages(next);
    askEmma(next);
  };

  const start = () => {
    updateSettings({ personality: config.personality });
    setMessages([]);
    setNotice(null);
    setPhase('active');
    askEmma([]);
  };

  const toggleMic = () => {
    if (recognition.listening) {
      recognition.stop();
      return;
    }
    tts.cancel();
    setNotice(null);
    recognition.start();
  };

  const sendTyped = (e) => {
    e.preventDefault();
    const text = draft;
    setDraft('');
    handleUserTurn.current(text, { viaVoice: false });
  };

  const endSession = async () => {
    setConfirmEnd(false);
    recognition.abort();
    tts.cancel();
    const turns = messages.filter((m) => m.role === 'user');
    if (!turns.length) {
      setPhase('setup');
      return;
    }
    setPhase('analyzing');
    try {
      const report = await aiService.analyzeSpeaking({ turns, mode: config.mode, difficulty: config.difficulty });
      const session = recordSession({
        type: 'speaking',
        title: getMode(config.mode).title,
        durationSec: seconds,
        score: report.overall,
        skills: { speaking: report.overall, grammar: report.percentages.grammar, vocabulary: report.percentages.vocabulary, pronunciation: report.percentages.pronunciation ?? undefined },
        details: { ...config, report: { ...report, transcript: messages, mode: config.mode } },
        mistakes: report.mistakes,
      });
      navigate(`/history/${session.id}`, { state: { fresh: true } });
    } catch {
      setPhase('active');
      setNotice({ tone: 'error', text: 'We couldn’t analyse this session. Check your connection and tap “End session” again.' });
    }
  };

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const mode = getMode(config.mode);

  if (phase === 'analyzing') {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <EmmaAvatar size="lg" state="thinking" className="mx-auto" />
          <Spinner label="Emma is analysing your conversation…" />
          <p className="-mt-6 text-sm text-slate-500">Checking grammar, vocabulary, fluency and more.</p>
        </div>
      </div>
    );
  }

  if (phase === 'setup') {
    const micNotice = !speechService.recognitionSupported ? (
      <Alert tone="warning" title="Voice input isn’t available in this browser">
        You can still practise by typing your answers. For voice, use Chrome, Edge or Safari.
      </Alert>
    ) : !speechService.secureContext ? (
      <Alert tone="warning" title="Microphone needs a secure connection">
        Open the app on https or localhost to use your microphone. You can still type.
      </Alert>
    ) : null;
    return (
      <div>
        <PageHeader title="AI Speaking Practice" subtitle="Have a real conversation with Emma" icon={Mic} />
        <SessionSetup config={config} setConfig={setConfig} recommendedDifficulty={recommended} onStart={start} micNotice={micNotice} />
      </div>
    );
  }

  const emmaState = status === 'speaking' ? 'speaking' : status === 'listening' ? 'listening' : status === 'thinking' ? 'thinking' : 'idle';

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col lg:min-h-[calc(100dvh-5rem)]">
      {/* Session header */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center gap-3">
          <EmmaAvatar size="md" state={emmaState} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Emma <span className="text-sm font-normal text-slate-500">· {mode.title}</span></p>
            <p className="flex items-center gap-1.5 truncate text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
              {status === 'speaking' && <SoundBars className="text-brand-600" />}
              {status === 'listening' && <span className="size-2 rounded-full bg-rose-500" aria-hidden="true" />}
              {STATUS_TEXT[status]}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-semibold tabular-nums" aria-label={`Session time ${formatClock(seconds)}`}>{formatClock(seconds)}</p>
            <button
              type="button"
              onClick={() => {
                if (tts.speaking) tts.cancel();
                updateSettings({ autoSpeak: !settings.autoSpeak });
              }}
              className="mt-0.5 inline-flex items-center gap-1 rounded-lg p-1 text-xs text-slate-500 hover:text-slate-700"
              aria-label={settings.autoSpeak ? 'Mute Emma’s voice' : 'Turn on Emma’s voice'}
              aria-pressed={!settings.autoSpeak}
            >
              {settings.autoSpeak ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
              {settings.autoSpeak ? 'Voice on' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <ol ref={listRef} className="flex-1 space-y-4 py-5" aria-label="Conversation transcript" aria-live="polite">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} onReplay={tts.supported ? (t) => tts.speak(t) : undefined} />
        ))}
        {interim && <ChatBubble message={{ role: 'user', text: interim }} interim />}
        {status === 'thinking' && (
          <li className="flex items-center gap-2 text-sm text-slate-500"><span className="flex gap-1" aria-hidden="true">{[0, 1, 2].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 0.15}s` }} />)}</span><span className="sr-only">Emma is typing</span></li>
        )}
      </ol>

      {/* Controls */}
      <div className="sticky bottom-16 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-4 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:-mx-8 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
        {notice && <Alert tone={notice.tone} className="mb-3" onDismiss={() => setNotice(null)}>{notice.text}</Alert>}
        {inputMode === 'voice' ? (
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="md" icon={Keyboard} onClick={() => { recognition.abort(); setInputMode('text'); }} aria-label="Type instead">
              <span className="hidden sm:inline">Type</span>
            </Button>
            <div className="flex flex-col items-center gap-1">
              <MicButton listening={recognition.listening} disabled={status === 'thinking'} onClick={toggleMic} />
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                {recognition.listening ? (
                  sendingIn ? <>Sending in {sendingIn}s… keep talking to continue</> : <><span className="size-2 animate-pulse rounded-full bg-rose-500" aria-hidden="true" />Recording — tap ■ to send</>
                ) : recognition.status === 'processing' ? 'Sending…' : 'Tap to speak'}
              </span>
            </div>
            <Button variant="outline" size="md" icon={PhoneOff} onClick={() => setConfirmEnd(true)} className="text-rose-600 dark:text-rose-400">
              <span className="hidden sm:inline">End session</span><span className="sm:hidden">End</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={sendTyped} className="flex items-center gap-2">
            {speechService.recognitionSupported && (
              <Button variant="ghost" className="px-3" onClick={() => setInputMode('voice')} aria-label="Switch to voice input"><Mic className="size-5" /></Button>
            )}
            <label htmlFor="reply" className="sr-only">Type your reply</label>
            <input
              id="reply"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your reply…"
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-[15px] dark:border-slate-700 dark:bg-slate-900"
            />
            <Button type="submit" className="h-12 px-3" disabled={!draft.trim() || status === 'thinking'} aria-label="Send"><Send className="size-5" /></Button>
            <Button variant="outline" className="h-12 px-3 text-rose-600" onClick={() => setConfirmEnd(true)} aria-label="End session"><PhoneOff className="size-5" /></Button>
          </form>
        )}
        <p className="mt-2 text-center text-xs text-slate-500">{userTurns ? `${userTurns} ${userTurns === 1 ? 'reply' : 'replies'} · Emma will review your mistakes at the end` : 'Speak naturally — mistakes are reviewed after the session'}</p>
      </div>

      <ConfirmDialog
        open={confirmEnd}
        title={userTurns ? 'End this session?' : 'End without feedback?'}
        confirmLabel={userTurns ? 'End & see report' : 'End session'}
        tone={userTurns ? 'primary' : 'danger'}
        onConfirm={endSession}
        onCancel={() => setConfirmEnd(false)}
      >
        {userTurns ? `Emma will analyse your ${userTurns} ${userTurns === 1 ? 'reply' : 'replies'} and show your score and every mistake.` : 'You haven’t replied yet, so there’s nothing to analyse.'}
      </ConfirmDialog>
    </div>
  );
}
