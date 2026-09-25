/**
 * Speaking-speed analysis.
 *
 * Input comes from browser speech recognition: the transcript plus timestamped
 * samples of the running word count. From that we measure words per minute
 * (WPM), pauses and how steady the pace was. A speech API with word-level
 * timestamps can supply the same `samples` shape for more precise results.
 */
import { clamp, average } from '../../utils/text.js';

export const PACE_CONTEXTS = [
  { id: 'conversation', label: 'Conversation', range: [120, 160], note: 'Natural, relaxed everyday speech.' },
  { id: 'interview', label: 'Interview', range: [120, 150], note: 'Calm and clear, so the interviewer can follow every point.' },
  { id: 'presentation', label: 'Presentation', range: [100, 140], note: 'Slower, with pauses so the audience can absorb each idea.' },
];

export const PACE_SCALE = { min: 60, max: 220 };

export function getPaceContext(id) {
  return PACE_CONTEXTS.find((c) => c.id === id) || PACE_CONTEXTS[0];
}

export function countWords(text) {
  return (text || '').trim().split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
}

const VERDICTS = {
  'too-slow': { label: 'Too slow', headline: 'You’re speaking too slowly' },
  slow: { label: 'A little slow', headline: 'A little slow — speed up slightly' },
  perfect: { label: 'Perfect pace', headline: 'Perfect pace! 🎯' },
  fast: { label: 'A little fast', headline: 'A little fast — slow down slightly' },
  'too-fast': { label: 'Too fast', headline: 'You’re speaking too fast' },
};

const TIPS = {
  slow: [
    'Think in phrases, not single words — say 3 to 5 words in one breath.',
    'Link words together, e.g. “a lot of” → “a-lot-of”, “next to” → “nex-to”.',
    'Shadowing: listen to Emma read a sentence, then repeat it at the same speed.',
    'Prepare key phrases before you speak so you don’t search for words mid-sentence.',
  ],
  fast: [
    'Pause briefly at every comma and full stop.',
    'Slow down on important words, numbers and names — stress them clearly.',
    'Take a small breath before each new idea.',
    'Use the pace guide in “Read aloud” to feel the right rhythm.',
  ],
  perfect: [
    'Great — use this same pace in meetings and interviews.',
    'Add a short pause before your key point to make it stand out.',
    'Challenge yourself: speak freely for 60 seconds and keep this pace.',
  ],
};

function verdictFor(wpm, [lo, hi]) {
  if (wpm < lo - 20) return 'too-slow';
  if (wpm < lo) return 'slow';
  if (wpm > hi + 20) return 'too-fast';
  if (wpm > hi) return 'fast';
  return 'perfect';
}

/** Word count at time t (latest sample at or before t). */
function wordsAt(samples, t) {
  let w = 0;
  for (const s of samples) {
    if (s.t <= t) w = s.words;
    else break;
  }
  return w;
}

/**
 * @param {object} input
 * @param {string} [input.transcript] recognised text
 * @param {Array<{t:number, words:number}>} [input.samples] ms since start → cumulative words
 * @param {number} input.durationMs wall-clock recording length
 * @param {number} [input.knownWordCount] used when speech recognition isn't available (timer mode)
 * @param {string} contextId conversation | interview | presentation
 */
export function analyzePace({ transcript = '', samples = [], durationMs, knownWordCount }, contextId) {
  const context = getPaceContext(contextId);
  const [lo, hi] = context.range;
  const recognised = countWords(transcript);
  const timerMode = !recognised && Boolean(knownWordCount);
  const words = timerMode ? knownWordCount : recognised;

  const spoken = samples.filter((s) => s.words > 0);
  let speakingMs = durationMs;
  let firstT = 0;
  let lastT = durationMs;
  if (!timerMode && spoken.length >= 2) {
    // Recognition reports the first word ~0.3–0.6 s after it was spoken, so allow for that.
    firstT = Math.max(0, spoken[0].t - 400);
    lastT = spoken[spoken.length - 1].t + 200;
    speakingMs = Math.max(1000, lastT - firstT);
  }
  const wpm = Math.round(words / (speakingMs / 60000));

  // Pauses: gaps between recognition updates while speaking.
  let pauseMs = 0;
  let longPauses = 0;
  for (let i = 1; i < spoken.length; i++) {
    const gap = spoken[i].t - spoken[i - 1].t;
    if (gap > 1500) pauseMs += gap - 300;
    if (gap > 2500) longPauses += 1;
  }

  // Pace over time in 10-second windows.
  const timeline = [];
  if (!timerMode && spoken.length >= 2) {
    const WINDOW = 10000;
    for (let start = firstT; start < lastT; start += WINDOW) {
      const end = Math.min(start + WINDOW, lastT);
      const span = end - start;
      if (span < 4000 && timeline.length) break; // ignore a tiny last window
      const delta = wordsAt(samples, end) - wordsAt(samples, start);
      const sec = Math.round((start - firstT) / 1000);
      timeline.push({ label: `${sec}s`, value: Math.round(delta / (span / 60000)) });
    }
  }
  const values = timeline.map((b) => b.value);
  let consistency = null;
  if (values.length >= 2) {
    const mean = average(values);
    const sd = Math.sqrt(average(values.map((v) => (v - mean) ** 2)));
    consistency = clamp(Math.round(100 - (sd / Math.max(1, mean)) * 150), 0, 100);
  }

  const verdict = verdictFor(wpm, context.range);
  const distance = wpm < lo ? lo - wpm : wpm > hi ? wpm - hi : 0;
  const paceScore = clamp(Math.round(100 - distance * 1.5), 0, 100);
  const minutes = speakingMs / 60000;
  const pauseScore = clamp(Math.round(100 - Math.max(0, longPauses / Math.max(0.25, minutes) - 2) * 15), 0, 100);
  const parts = [[paceScore, 0.6], [consistency, 0.25], [timerMode ? null : pauseScore, 0.15]].filter(([v]) => v != null);
  const score = Math.round(parts.reduce((s, [v, w]) => s + v * w, 0) / parts.reduce((s, [, w]) => s + w, 0));

  const message =
    verdict === 'perfect'
      ? `You spoke at ${wpm} words per minute — right inside the ideal ${lo}–${hi} range for ${context.label.toLowerCase()}. Easy to follow and natural.`
      : verdict.includes('slow')
        ? `You spoke at ${wpm} words per minute. For ${context.label.toLowerCase()}, aim for ${lo}–${hi}. A slow pace can make listeners lose attention.`
        : `You spoke at ${wpm} words per minute. For ${context.label.toLowerCase()}, aim for ${lo}–${hi}. Speaking too fast makes it harder to understand you.`;

  const tips = [...TIPS[verdict === 'perfect' ? 'perfect' : verdict.includes('slow') ? 'slow' : 'fast']];
  if (longPauses >= 3) tips.unshift(`You had ${longPauses} long pauses (over 2.5 seconds). Fill thinking time with phrases like “Let me think…” or “That’s a good question.”`);
  if (consistency != null && consistency < 60 && values.length >= 2) {
    tips.unshift(`Your speed changed a lot (from about ${Math.min(...values)} to ${Math.max(...values)} wpm). Try to keep an even rhythm from start to finish.`);
  }

  return {
    wpm,
    words,
    speakingSec: Math.round(speakingMs / 1000),
    totalSec: Math.round(durationMs / 1000),
    pauseSec: Math.round(pauseMs / 1000),
    longPauses,
    timeline,
    consistency,
    verdict,
    verdictLabel: VERDICTS[verdict].label,
    headline: VERDICTS[verdict].headline,
    message,
    tips: tips.slice(0, 4),
    score,
    range: context.range,
    context: context.id,
    contextLabel: context.label,
    transcript,
    method: timerMode ? 'timer' : 'speech-recognition',
  };
}
