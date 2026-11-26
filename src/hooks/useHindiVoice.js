import { useCallback, useMemo } from 'react';
import { useTextToSpeech } from './useTextToSpeech.js';
import { speechService } from '../services/speechService.js';
import { HINDI_LANG } from '../utils/hindi.js';

/** Text-to-speech in Hindi. `hasVoice` is false when the device has no Hindi voice installed. */
export function useHindiVoice() {
  const tts = useTextToSpeech();
  const { speak: baseSpeak, voices } = tts;
  const voice = useMemo(() => speechService.pickVoiceForLang(voices, HINDI_LANG), [voices]);
  const speak = useCallback((text, { slow = false, onEnd } = {}) => baseSpeak(text, { lang: HINDI_LANG, rate: slow ? 0.6 : 0.85, onEnd }), [baseSpeak]);
  return { ...tts, speak, voice, hasVoice: Boolean(voice), voicesLoaded: voices.length > 0 };
}
