import { useCallback, useEffect, useRef, useState } from 'react';
import { speechService } from '../services/speechService.js';
import { countWords } from '../services/engine/paceAnalyzer.js';

/**
 * Records a longer piece of speech (up to `maxSeconds`) and keeps listening
 * through natural pauses. Browsers end recognition after a short silence, so
 * we restart it automatically until the learner taps stop — this works the
 * same on desktop and mobile (continuous mode is unreliable on Android).
 *
 * Produces `result = { transcript, samples: [{ t, words }], durationMs }`,
 * where samples are timestamped running word counts used to measure pace.
 */
export function useLongSpeechRecognition({ lang = 'en-US', maxSeconds = 120 } = {}) {
  const [status, setStatus] = useState('idle'); // idle | listening | processing
  const [liveText, setLiveText] = useState('');
  const [liveWords, setLiveWords] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const session = useRef(null);
  const supported = speechService.recognitionSupported;

  const finalize = useCallback(() => {
    const s = session.current;
    if (!s || s.finalized) return;
    s.finalized = true;
    clearTimeout(s.maxTimer);
    clearTimeout(s.stopTimer);
    const tail = s.segmentFinal || s.segmentInterim;
    const transcript = [...s.finals, tail].join(' ').replace(/\s+/g, ' ').trim();
    const stoppedAt = s.stoppedAt || performance.now();
    setResult({ transcript, samples: s.samples, durationMs: stoppedAt - s.startedAt });
    setStatus('idle');
  }, []);

  const begin = useCallback(() => {
    const s = session.current;
    const rec = speechService.createRecognition({ lang, interimResults: true, continuous: false });
    s.rec = rec;
    s.segmentFinal = '';
    s.segmentInterim = '';
    rec.onresult = (event) => {
      let fin = '';
      let inter = '';
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) fin += `${r[0].transcript} `;
        else inter += `${r[0].transcript} `;
      }
      s.segmentFinal = fin.trim();
      s.segmentInterim = inter.trim();
      const text = [...s.finals, fin, inter].join(' ').replace(/\s+/g, ' ').trim();
      // Interim guesses can shrink; keep the count monotonic for timing.
      s.maxWords = Math.max(s.maxWords, countWords(text));
      s.samples.push({ t: Math.round(performance.now() - s.startedAt), words: s.maxWords });
      setLiveText(text);
      setLiveWords(s.maxWords);
    };
    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      s.fatal = event.error;
      setError(event.error);
    };
    rec.onend = () => {
      const tail = s.segmentFinal || s.segmentInterim;
      if (tail) s.finals.push(tail);
      s.segmentFinal = '';
      s.segmentInterim = '';
      if (s.active && !s.fatal && s.restarts < 300) {
        s.restarts += 1;
        try {
          begin();
          return;
        } catch {
          /* fall through to finish */
        }
      }
      finalize();
    };
    rec.start();
  }, [lang, finalize]);

  const stop = useCallback(() => {
    const s = session.current;
    if (!s || !s.active) return;
    s.active = false;
    s.stoppedAt = performance.now();
    setStatus('processing');
    try {
      s.rec?.stop();
    } catch {
      /* ignore */
    }
    // Safety net in case the browser never fires `end`.
    s.stopTimer = setTimeout(finalize, 2500);
  }, [finalize]);

  const start = useCallback(() => {
    setError(null);
    setResult(null);
    setLiveText('');
    setLiveWords(0);
    if (!supported) {
      setError('not-supported');
      return false;
    }
    if (!speechService.secureContext) {
      setError('insecure');
      return false;
    }
    session.current?.rec?.abort();
    session.current = { active: true, finals: [], samples: [], maxWords: 0, restarts: 0, startedAt: performance.now() };
    session.current.maxTimer = setTimeout(() => stop(), maxSeconds * 1000);
    setStatus('listening');
    try {
      begin();
      return true;
    } catch {
      session.current.active = false;
      setStatus('idle');
      setError('start-failed');
      return false;
    }
  }, [supported, begin, stop, maxSeconds]);

  const reset = useCallback(() => {
    setResult(null);
    setLiveText('');
    setLiveWords(0);
    setError(null);
  }, []);

  useEffect(
    () => () => {
      const s = session.current;
      if (s) {
        s.active = false;
        s.finalized = true;
        clearTimeout(s.maxTimer);
        clearTimeout(s.stopTimer);
        s.rec?.abort();
      }
    },
    [],
  );

  return { supported, status, listening: status === 'listening', liveText, liveWords, error, result, start, stop, reset };
}
