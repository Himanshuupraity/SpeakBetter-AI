import { useCallback, useEffect, useRef, useState } from 'react';
import { speechService } from '../services/speechService.js';
import { countWords } from '../services/engine/paceAnalyzer.js';

/**
 * Records a longer piece of speech (up to `maxSeconds`) and keeps listening
 * through natural pauses. Browsers end recognition after a short silence, so
 * we restart it automatically until the learner taps stop — this works the
 * same on desktop and mobile (continuous mode is unreliable on Android).
 *
 * Produces `result = { transcript, samples: [{ t, words }], durationMs, confidence, spokenMs }`,
 * where samples are timestamped running word counts used to measure pace.
 *
 * Optional auto-stop on silence: with `silenceMs`, recording stops by itself once
 * the learner has been quiet that long after speaking (`initialSilenceMs` is the
 * allowance before the first word, to leave time to think).
 */
export function useLongSpeechRecognition({ lang = 'en-US', maxSeconds = 120, silenceMs = null, initialSilenceMs = null, onResult } = {}) {
  const [status, setStatus] = useState('idle'); // idle | listening | processing
  const [liveText, setLiveText] = useState('');
  const [liveWords, setLiveWords] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [quietMs, setQuietMs] = useState(0); // silence since the last new word (for a countdown UI)
  const session = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const supported = speechService.recognitionSupported;

  const finalize = useCallback((target) => {
    const s = target || session.current;
    if (!s || s.finalized) return;
    s.finalized = true;
    clearTimeout(s.maxTimer);
    clearTimeout(s.stopTimer);
    clearInterval(s.silenceTimer);
    setStatus('idle');
    setQuietMs(0);
    if (s.discard) return;
    const tail = s.segmentFinal || s.segmentInterim;
    const transcript = [...s.finals, tail].join(' ').replace(/\s+/g, ' ').trim();
    const stoppedAt = s.stoppedAt || performance.now();
    const spoken = s.samples.filter((x) => x.words > 0);
    const next = {
      transcript,
      samples: s.samples,
      durationMs: stoppedAt - s.startedAt,
      confidence: s.confidences.length ? s.confidences.reduce((a, b) => a + b, 0) / s.confidences.length : 0,
      spokenMs: spoken.length >= 2 ? spoken[spoken.length - 1].t - spoken[0].t + 400 : 0,
    };
    setResult(next);
    onResultRef.current?.(next);
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
        if (r.isFinal) {
          fin += `${r[0].transcript} `;
          if (r[0].confidence > 0) s.segmentConfidence = r[0].confidence;
        } else inter += `${r[0].transcript} `;
      }
      s.segmentFinal = fin.trim();
      s.segmentInterim = inter.trim();
      const text = [...s.finals, fin, inter].join(' ').replace(/\s+/g, ' ').trim();
      // Interim guesses can shrink; keep the count monotonic for timing.
      s.maxWords = Math.max(s.maxWords, countWords(text));
      s.samples.push({ t: Math.round(performance.now() - s.startedAt), words: s.maxWords });
      setLiveText(text);
      setLiveWords(s.maxWords);
      // Only count it as "still speaking" when the words actually change —
      // browsers re-send the same final text shortly after you stop talking.
      const norm = text.toLowerCase().replace(/[^a-z0-9' ]/g, '').replace(/\s+/g, ' ').trim();
      if (norm && norm !== s.lastNorm) {
        s.lastNorm = norm;
        s.lastSpeechAt = performance.now();
        s.spoke = true;
      }
    };
    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      s.fatal = event.error;
      setError(event.error);
    };
    rec.onend = () => {
      const tail = s.segmentFinal || s.segmentInterim;
      if (tail) s.finals.push(tail);
      if (s.segmentConfidence) s.confidences.push(s.segmentConfidence);
      s.segmentConfidence = 0;
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
      finalize(s);
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
    s.stopTimer = setTimeout(() => finalize(s), 2500);
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
    const prev = session.current;
    if (prev) {
      prev.active = false;
      prev.finalized = true;
      clearTimeout(prev.maxTimer);
      clearTimeout(prev.stopTimer);
      clearInterval(prev.silenceTimer);
      prev.rec?.abort();
    }
    const now = performance.now();
    session.current = { active: true, finals: [], samples: [], confidences: [], maxWords: 0, restarts: 0, startedAt: now, lastSpeechAt: now, spoke: false };
    session.current.maxTimer = setTimeout(() => stop(), maxSeconds * 1000);
    if (silenceMs) {
      const s = session.current;
      s.silenceTimer = setInterval(() => {
        if (!s.active) return;
        const quiet = performance.now() - s.lastSpeechAt;
        setQuietMs(s.spoke ? quiet : 0);
        if (quiet >= (s.spoke ? silenceMs : initialSilenceMs ?? silenceMs)) stop();
      }, 200);
    }
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
  }, [supported, begin, stop, maxSeconds, silenceMs, initialSilenceMs]);

  /** Stop listening and throw away what was heard (no result). */
  const abort = useCallback(() => {
    const s = session.current;
    if (!s || s.finalized) return;
    s.active = false;
    s.discard = true;
    try {
      s.rec?.abort();
    } catch {
      /* ignore */
    }
    finalize(s);
    setLiveText('');
  }, [finalize]);

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
        clearInterval(s.silenceTimer);
        s.rec?.abort();
      }
    },
    [],
  );

  return { supported, status, listening: status === 'listening', liveText, liveWords, quietMs, error, result, start, stop, abort, reset, clearError: () => setError(null) };
}
