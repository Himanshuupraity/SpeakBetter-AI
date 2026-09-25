import { useCallback, useEffect, useRef, useState } from 'react';
import { buildCast, speechService } from '../services/speechService.js';
import { useApp } from '../context/AppContext.jsx';
import { splitSentences } from '../utils/text.js';

/**
 * Text-to-speech with Emma's voice. Long text is spoken sentence by sentence
 * (Chrome cuts off long utterances). Respects the voice + rate from Settings.
 */
export function useTextToSpeech() {
  const { state } = useApp();
  const { voiceURI, speechRate } = state.settings;
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const tokenRef = useRef(0);
  const supported = speechService.synthesisSupported;

  useEffect(() => {
    let alive = true;
    speechService.getVoices().then((v) => alive && setVoices(v));
    // Chrome adds its online voices a moment later — keep the list current.
    const refresh = () => alive && setVoices(window.speechSynthesis.getVoices());
    if (supported) window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => {
      alive = false;
      if (supported) window.speechSynthesis.removeEventListener('voiceschanged', refresh);
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const cancel = useCallback(() => {
    tokenRef.current += 1;
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text, { rate, onEnd } = {}) => {
      if (!supported || !text) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const token = ++tokenRef.current;
      const voice = voices.find((v) => v.voiceURI === voiceURI) || speechService.pickDefaultVoice(voices);
      const parts = splitSentences(text);
      setSpeaking(true);
      parts.forEach((part, i) => {
        const u = new SpeechSynthesisUtterance(part);
        if (voice) u.voice = voice;
        u.lang = voice?.lang || 'en-US';
        u.rate = rate ?? speechRate ?? 1;
        u.pitch = 1;
        if (i === parts.length - 1) {
          u.onend = () => {
            if (token === tokenRef.current) {
              setSpeaking(false);
              onEnd?.();
            }
          };
        }
        u.onerror = () => {
          if (token === tokenRef.current) {
            setSpeaking(false);
            if (i === parts.length - 1) onEnd?.();
          }
        };
        window.speechSynthesis.speak(u);
      });
    },
    [supported, voices, voiceURI, speechRate],
  );

  /** Which voice each speaker in a dialogue will use (for display and playback). */
  const castFor = useCallback(
    (lines) => buildCast(lines, voices, voices.find((v) => v.voiceURI === voiceURI) || speechService.pickDefaultVoice(voices)),
    [voices, voiceURI],
  );

  /**
   * Play a dialogue: lines = [{ text, speaker }]. Every speaker gets their own
   * voice. Lines are spoken one at a time (queuing them all makes some browsers
   * ignore the voice change), with a short pause when the speaker changes.
   */
  const speakLines = useCallback(
    (lines, { rate, onEnd, onLine } = {}) => {
      if (!supported || !lines.length) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const token = ++tokenRef.current;
      const cast = castFor(lines);
      setSpeaking(true);

      const finishAll = () => {
        if (token !== tokenRef.current) return;
        setSpeaking(false);
        onLine?.(null);
        onEnd?.();
      };

      const playLine = (i, { useLocalVoice = false } = {}) => {
        if (token !== tokenRef.current) return;
        if (i >= lines.length) return finishAll();
        const line = lines[i];
        const role = cast[line.speaker] || {};
        const voice = useLocalVoice ? null : role.voice;
        const u = new SpeechSynthesisUtterance(line.text);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        } else {
          u.lang = 'en-US';
        }
        const speed = rate ?? speechRate ?? 1;
        u.rate = speed;
        u.pitch = role.pitch ?? 1;

        let done = false;
        // Watchdog: some browsers occasionally never fire `end`; don't let the dialogue stall.
        const words = line.text.split(/\s+/).length;
        const watchdog = setTimeout(() => next(), ((words * 550) / speed) + 4000);
        function next() {
          if (done) return;
          done = true;
          clearTimeout(watchdog);
          const pause = lines[i + 1] && lines[i + 1].speaker !== line.speaker ? 450 : 150;
          setTimeout(() => playLine(i + 1), pause);
        }
        u.onstart = () => token === tokenRef.current && onLine?.(i, line.speaker);
        u.onend = next;
        u.onerror = (e) => {
          if (e.error === 'interrupted' || e.error === 'canceled') {
            done = true;
            clearTimeout(watchdog);
            return;
          }
          // Online (Google) voices fail without internet — retry this line with a built-in voice.
          if (voice && !voice.localService && !useLocalVoice) {
            done = true;
            clearTimeout(watchdog);
            playLine(i, { useLocalVoice: true });
            return;
          }
          next();
        };
        window.speechSynthesis.speak(u);
      };
      playLine(0);
    },
    [supported, castFor, speechRate],
  );

  return { supported, speaking, speak, speakLines, castFor, cancel, voices };
}
