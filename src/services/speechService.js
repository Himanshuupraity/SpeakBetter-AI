/**
 * Thin wrappers over the browser Web Speech API (recognition + synthesis).
 * A cloud speech-to-text / text-to-speech service could replace these later
 * without changing the hooks' public API.
 */
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

export const speechService = {
  recognitionSupported: Boolean(SR),
  synthesisSupported: typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  secureContext: typeof window === 'undefined' || window.isSecureContext,

  createRecognition({ lang = 'en-US', interimResults = true, continuous = false, maxAlternatives = 1 } = {}) {
    if (!SR) return null;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = interimResults;
    rec.continuous = continuous;
    rec.maxAlternatives = maxAlternatives;
    return rec;
  },

  /** Voices load asynchronously in Chrome; resolve when available. */
  getVoices() {
    if (!this.synthesisSupported) return Promise.resolve([]);
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) return Promise.resolve(voices);
    return new Promise((resolve) => {
      const done = () => resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
      setTimeout(done, 1500);
    });
  },

  /** Picks a natural-sounding English voice for Emma. */
  pickDefaultVoice(voices) {
    const english = voices.filter((v) => /^en[-_]/i.test(v.lang));
    const preferred = ['Google US English', 'Samantha', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Serena', 'Moira', 'Tessa', 'Google UK English Female', 'Zira'];
    for (const name of preferred) {
      const v = english.find((voice) => voice.name.includes(name));
      if (v) return v;
    }
    return english.find((v) => /female|woman/i.test(v.name)) || english.find((v) => v.default) || english[0] || null;
  },

  /**
   * Best natural-sounding English voice of a gender, skipping novelty voices
   * and any voice in `exclude`. Falls back to any usable English voice.
   */
  pickVoiceByGender(voices, gender, exclude = []) {
    const usable = voices.filter((v) => /^en[-_]/i.test(v.lang) && !NOVELTY_VOICES.test(v.name) && !exclude.includes(v));
    const list = gender === 'male' ? MALE_VOICES : FEMALE_VOICES;
    for (const name of list) {
      const v = usable.find((voice) => voice.name.includes(name));
      if (v) return v;
    }
    const byHint = usable.find((v) => (gender === 'male' ? /\bmale\b/i : /female/i).test(v.name));
    return byHint || usable[0] || null;
  },
};

// Preference order for dialogue voices across macOS, iOS, Windows, Android and ChromeOS.
// Google voices come first: Chrome on macOS ignores a chosen built-in Mac voice
// (Samantha, Daniel…) and plays the system default instead, so two speakers would
// sound identical. Google voices switch reliably in Chrome; other browsers don't
// have them and fall through to their own built-in voices.
const FEMALE_VOICES = ['Google US English', 'Google UK English Female', 'Samantha', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Microsoft Neerja', 'Veena', 'Karen', 'Moira', 'Tessa', 'Google UK English Female', 'Serena', 'Victoria', 'Fiona', 'Microsoft Libby', 'Microsoft Sonia', 'Kathy', 'Shelley', 'Sandy', 'Flo'];
const MALE_VOICES = ['Google UK English Male', 'Daniel', 'Rishi', 'Microsoft Guy', 'Microsoft David', 'Microsoft Mark', 'Microsoft Prabhat', 'Microsoft Ryan', 'Alex', 'Aaron', 'Arthur', 'Oliver', 'Fred', 'Reed', 'Eddy', 'Rocko', 'Ralph'];
// macOS ships joke voices that are hard to understand — never use them for learning.
const NOVELTY_VOICES = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Junior|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Grandma|Grandpa)\b/i;

const FEMALE_NAMES = /^(anita|kavya|laura|neha|priya|emma|sara|sarah|aisha|pooja|riya|meera|anna|maria|lisa|mother|mom|wife|sister|woman|girl|ms|mrs)\b/i;
const MALE_NAMES = /^(farhan|rohan|sameer|rahul|amit|arjun|raj|vikram|john|david|james|tom|father|dad|husband|brother|man|boy|mr)\b/i;

/**
 * Decide who speaks with which voice in a dialogue, so the two people always
 * sound clearly different. Known names get a matching voice; role names
 * (Barista, Receptionist…) take the opposite gender of the other speaker.
 * @returns {Record<string, { voice: SpeechSynthesisVoice|null, gender: string, pitch: number }>}
 */
export function buildCast(lines, voices, narratorVoice) {
  const speakers = [...new Set(lines.map((l) => l.speaker))];
  const guess = (name) => (FEMALE_NAMES.test(name) ? 'female' : MALE_NAMES.test(name) ? 'male' : null);
  const genders = {};
  speakers.forEach((s) => (genders[s] = s === 'Narrator' ? 'narrator' : guess(s)));
  let next = 'female';
  speakers.forEach((s) => {
    if (genders[s]) return;
    const taken = speakers.map((o) => genders[o]).filter((g) => g === 'female' || g === 'male');
    genders[s] = taken.includes('female') && !taken.includes('male') ? 'male' : taken.includes('male') && !taken.includes('female') ? 'female' : next;
    next = genders[s] === 'female' ? 'male' : 'female';
  });

  const cast = {};
  const used = [];
  speakers.forEach((s) => {
    if (genders[s] === 'narrator') {
      cast[s] = { voice: narratorVoice, gender: 'narrator', pitch: 1 };
      return;
    }
    // `used` makes sure two speakers never get the same voice.
    const voice = speechService.pickVoiceByGender(voices, genders[s], used);
    if (voice) used.push(voice);
    // Pitch is a second cue in case the device has very few voices.
    cast[s] = { voice, gender: genders[s], pitch: genders[s] === 'male' ? 0.85 : 1.1 };
  });
  return cast;
}

/** Friendly messages for recognition error codes. */
export function recognitionErrorMessage(code) {
  switch (code) {
    case 'not-supported':
      return 'Speech recognition isn’t supported in this browser. Try Chrome, Edge or Safari — or continue by typing.';
    case 'insecure':
      return 'The microphone only works on a secure (https) page or localhost. You can continue by typing.';
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is unavailable. Allow microphone access in your browser settings, or continue by typing your response.';
    case 'no-speech':
      return 'I didn’t hear anything. Tap the microphone and try speaking again.';
    case 'audio-capture':
      return 'No microphone was found. Check your device, or continue by typing.';
    case 'network':
      return 'Speech recognition needs an internet connection. Check your network, or continue by typing.';
    default:
      return 'Something went wrong with the microphone. Please try again, or type your response.';
  }
}
