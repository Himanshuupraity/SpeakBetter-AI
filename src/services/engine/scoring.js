/**
 * Transparent speaking score (100 points):
 *   Grammar 20 · Vocabulary 20 · Pronunciation 20 · Fluency 20 · Sentence formation 10 · Naturalness 10
 *
 * IMPORTANT — honesty about what the browser can measure:
 * - Grammar / vocabulary / sentence / naturalness come from analysing the transcript text.
 * - Pronunciation is ESTIMATED from the speech recogniser's confidence value. That is a
 *   rough signal, not a phoneme-level assessment. If you typed your answers, it is not
 *   measured at all and the total is scaled from the other 80 points.
 * - Fluency is ESTIMATED from speaking rate and answer length.
 * A real speech-assessment API can supply `pronunciation` and `fluency` directly
 * (see remoteAiProvider.js) and this module will use those values instead.
 */
import { clamp, average } from '../../utils/text.js';
import { vocabularySignals } from './textAnalyzer.js';

export const SCORE_COMPONENTS = [
  { id: 'grammar', label: 'Grammar', max: 20, source: 'Transcript analysis' },
  { id: 'vocabulary', label: 'Vocabulary', max: 20, source: 'Transcript analysis' },
  { id: 'pronunciation', label: 'Pronunciation', max: 20, source: 'Estimated from speech-recognition confidence' },
  { id: 'fluency', label: 'Fluency', max: 20, source: 'Estimated from speaking rate & answer length' },
  { id: 'sentence', label: 'Sentence formation', max: 10, source: 'Transcript analysis' },
  { id: 'naturalness', label: 'Naturalness', max: 10, source: 'Transcript analysis' },
];

const GRAMMAR_CATS = new Set(['verb-tense', 'verb-form', 'subject-verb', 'articles', 'prepositions', 'plural-singular', 'adjectives']);

/**
 * @param {object} input
 * @param {Array<{text:string, confidence?:number, spokenMs?:number, viaVoice:boolean}>} input.turns user turns
 * @param {Array} input.issues all issues found in the user's turns
 * @param {{pronunciation?:number, fluency?:number}} [input.external] scores from a real speech API (0-20)
 */
export function scoreSpeaking({ turns, issues, external = {} }) {
  const text = turns.map((t) => t.text).join(' ');
  const sig = vocabularySignals(text);
  const turnCount = Math.max(1, turns.length);
  const avgWords = sig.totalWords / turnCount;
  const grammarErrors = issues.filter((i) => GRAMMAR_CATS.has(i.category)).length;
  const orderErrors = issues.filter((i) => ['word-order', 'sentence'].includes(i.category)).length;
  const vocabErrors = issues.filter((i) => i.category === 'vocabulary').length;

  const errPer10Words = grammarErrors / Math.max(1, sig.totalWords / 10);
  const grammar = clamp(Math.round(20 - errPer10Words * 5), 5, 20);

  const vocabulary = clamp(
    Math.round(9 + Math.min(6, sig.advancedWords.length * 1.2) + Math.min(5, sig.uniqueWords / 14) - vocabErrors * 1.5),
    5,
    20,
  );

  const voiceTurns = turns.filter((t) => t.viaVoice);
  let pronunciation = external.pronunciation ?? null;
  let pronunciationNote = 'Measured by the connected speech API.';
  if (pronunciation == null && voiceTurns.length) {
    const conf = average(voiceTurns.map((t) => (typeof t.confidence === 'number' && t.confidence > 0 ? t.confidence : 0.8)));
    pronunciation = clamp(Math.round(5 + conf * conf * 15), 5, 20);
    pronunciationNote = 'Estimated from how confidently your browser recognised your speech. This is a rough signal, not a detailed pronunciation assessment.';
  } else if (pronunciation == null) {
    pronunciationNote = 'Not measured — you typed your answers. Speak with the microphone to include pronunciation.';
  }

  let fluency = external.fluency ?? null;
  let fluencyNote = 'Measured by the connected speech API.';
  if (fluency == null) {
    const lengthScore = Math.min(9, avgWords * 0.75);
    const spoken = voiceTurns.filter((t) => t.spokenMs > 800);
    if (spoken.length) {
      const wpm = average(spoken.map((t) => (t.text.split(/\s+/).length / t.spokenMs) * 60000));
      const rateScore = wpm >= 90 && wpm <= 170 ? 7 : wpm >= 60 ? 5 : 3;
      fluency = clamp(Math.round(4 + lengthScore + rateScore - Math.min(3, sig.fillers)), 4, 20);
      fluencyNote = `Estimated: about ${Math.round(wpm)} words per minute and ${avgWords.toFixed(1)} words per answer.`;
    } else {
      fluency = clamp(Math.round(6 + lengthScore * 1.4 - Math.min(3, sig.fillers)), 4, 20);
      fluencyNote = `Estimated from answer length (${avgWords.toFixed(1)} words per answer) — typed answers have no timing.`;
    }
  }

  const shortTurns = turns.filter((t) => t.text.split(/\s+/).length < 4).length / turnCount;
  const sentence = clamp(Math.round(10 - orderErrors * 2 - shortTurns * 4 - (avgWords < 6 ? 1 : 0)), 3, 10);
  const naturalness = clamp(Math.round(5 + Math.min(2, sig.contractions) + Math.min(3, sig.connectors) - vocabErrors * 1.5), 3, 10);

  const breakdown = { grammar, vocabulary, pronunciation, fluency, sentence, naturalness };
  const earned = Object.values(breakdown).filter((v) => v != null).reduce((a, b) => a + b, 0);
  const possible = SCORE_COMPONENTS.filter((c) => breakdown[c.id] != null).reduce((a, c) => a + c.max, 0);
  const overall = Math.round((earned / possible) * 100);

  // Confidence is an indicator only (not part of the 100 points).
  const confidence = clamp(Math.round(50 + Math.min(30, avgWords * 2.5) + Math.min(15, turns.length * 2) - sig.fillers * 3), 30, 98);

  return {
    overall,
    breakdown,
    percentages: Object.fromEntries(SCORE_COMPONENTS.map((c) => [c.id, breakdown[c.id] == null ? null : Math.round((breakdown[c.id] / c.max) * 100)])),
    confidence,
    notes: { pronunciation: pronunciationNote, fluency: fluencyNote },
    stats: {
      totalWords: sig.totalWords,
      uniqueWords: sig.uniqueWords,
      avgWordsPerTurn: Math.round(avgWords * 10) / 10,
      advancedWords: sig.advancedWords.slice(0, 12),
      fillers: sig.fillers,
      turns: turns.length,
    },
    reliable: sig.totalWords >= 20,
  };
}
