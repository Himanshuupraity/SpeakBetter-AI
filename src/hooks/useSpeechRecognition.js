import { useCallback, useEffect, useRef, useState } from 'react';
import { speechService } from '../services/speechService.js';

/**
 * Speech-to-text for one utterance at a time (reliable on mobile browsers).
 *
 * onResult({ transcript, confidence, alternatives, spokenMs }) fires once when the
 * recogniser finishes with a non-empty final transcript.
 */
export function useSpeechRecognition({ lang = 'en-US', maxAlternatives = 1, onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const supported = speechService.recognitionSupported;

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    recRef.current?.abort();
    setListening(false);
    setInterim('');
  }, []);

  const start = useCallback(() => {
    setError(null);
    if (!supported) {
      setError('not-supported');
      return false;
    }
    if (!speechService.secureContext) {
      setError('insecure');
      return false;
    }
    recRef.current?.abort();
    const rec = speechService.createRecognition({ lang, maxAlternatives, interimResults: true });
    recRef.current = rec;
    let finalText = '';
    let confidence = 0;
    let alternatives = [];
    let startedAt = 0;
    let firstSpeechAt = 0;
    let lastSpeechAt = 0;

    rec.onstart = () => {
      startedAt = performance.now();
      setListening(true);
      setInterim('');
    };
    rec.onresult = (event) => {
      let interimText = '';
      if (!firstSpeechAt) firstSpeechAt = performance.now();
      lastSpeechAt = performance.now();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += `${result[0].transcript} `;
          confidence = result[0].confidence;
          alternatives = Array.from(result).map((alt) => ({ transcript: alt.transcript, confidence: alt.confidence }));
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim((finalText + interimText).trim());
    };
    rec.onerror = (event) => {
      if (event.error !== 'aborted') setError(event.error);
    };
    rec.onend = () => {
      setListening(false);
      const transcript = finalText.trim();
      setInterim('');
      if (transcript && onResultRef.current) {
        onResultRef.current({
          transcript,
          confidence,
          alternatives,
          spokenMs: Math.max(0, lastSpeechAt - (firstSpeechAt || startedAt)),
        });
      }
    };

    try {
      rec.start();
      return true;
    } catch {
      setError('start-failed');
      return false;
    }
  }, [lang, maxAlternatives, supported]);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, interim, error, start, stop, abort, clearError: () => setError(null) };
}
