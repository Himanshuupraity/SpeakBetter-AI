/** Helpers for the Learn Hindi section: comparing spoken Hindi and building quizzes. */
import { similarity } from './text.js';
import { seededShuffle } from './date.js';

export const HINDI_LANG = 'hi-IN';

// Speech recognisers often write numbers as digits ("5 मिनट"), so map them back to words.
const DIGIT_WORDS = { 0: 'शून्य', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पाँच', 6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ', 10: 'दस' };
const DEVANAGARI_DIGITS = '०१२३४५६७८९';

/**
 * Normalise Hindi text for comparison: drop punctuation, the nukta (ज़ → ज),
 * treat chandrabindu like anusvara (हूँ ≈ हूं), and map digits to words.
 */
export function normalizeHindi(text) {
  return (text || '')
    .normalize('NFC')
    .replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)))
    .replace(/\b\d+\b/g, (n) => DIGIT_WORDS[n] ?? n)
    .normalize('NFD')
    .replace(/़/g, '') // nukta
    .replace(/ँ/g, 'ं') // chandrabindu → anusvara
    .replace(/[​-‍﻿]/g, '')
    .normalize('NFC')
    .replace(/[।॥.,!?;:'"“”‘’()\-–—]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function hindiTokens(text) {
  const t = normalizeHindi(text);
  return t ? t.split(' ') : [];
}

const MATCH_THRESHOLD = 0.75;

/**
 * Compare what the learner said with the target phrase.
 * @returns {{ score: number, words: Array<{ word: string, matched: boolean }>, matched: number, total: number }}
 */
export function compareHindi(target, spoken) {
  const targetWords = (target || '').replace(/[।॥!?,.\-–—]/g, ' ').split(/\s+/).filter(Boolean);
  const said = hindiTokens(spoken);
  const used = new Set();
  let total = 0;
  const words = targetWords.map((word) => {
    const norm = normalizeHindi(word);
    let best = 0;
    let bestIdx = -1;
    said.forEach((s, i) => {
      if (used.has(i)) return;
      const sim = similarity(norm, s);
      if (sim > best) {
        best = sim;
        bestIdx = i;
      }
    });
    const matched = best >= MATCH_THRESHOLD;
    if (matched) used.add(bestIdx);
    // Near-misses earn partial credit; clearly different words earn nothing.
    total += matched ? best : best >= 0.5 ? best * 0.5 : 0;
    return { word, matched };
  });
  const n = Math.max(1, targetWords.length);
  // Extra words the learner added cost a little, so a long ramble can't score 100.
  const extra = Math.max(0, said.length - used.size - Math.ceil(n / 3));
  const score = Math.round(Math.max(0, Math.min(100, (total / n) * 100 - extra * 5)));
  return { score: said.length ? score : 0, words, matched: words.filter((x) => x.matched).length, total: targetWords.length };
}

export function feedbackFor(score) {
  if (score >= 90) return { tone: 'success', title: 'Excellent! बहुत बढ़िया!', text: 'That sounded clear and correct.' };
  if (score >= 70) return { tone: 'success', title: 'Good job! शाबाश!', text: 'Almost perfect. Listen once more and repeat the highlighted words.' };
  if (score >= 40) return { tone: 'warning', title: 'Getting there', text: 'Some words weren’t recognised. Listen at slow speed, then try again.' };
  return { tone: 'danger', title: 'Let’s try again', text: 'Listen to the phrase first, then say it slowly and clearly.' };
}

/**
 * Multiple-choice questions from a word list: half Hindi → English, half English → Hindi.
 * Distractors come from the same pool, preferring the same category.
 */
export function buildWordQuiz(words, { count = 10, seed = String(Date.now()), pool = words } = {}) {
  const picked = seededShuffle(words, seed).slice(0, count);
  return picked.map((word, i) => {
    const sameCat = pool.filter((x) => x.id !== word.id && x.category === word.category);
    const others = pool.filter((x) => x.id !== word.id && x.category !== word.category);
    const toEnglish = i % 2 === 0;
    const label = (x) => (toEnglish ? x.en : `${x.hi} (${x.roman})`);
    const answerText = label(word);
    const distractors = [];
    for (const x of [...seededShuffle(sameCat, `${seed}-${i}-a`), ...seededShuffle(others, `${seed}-${i}-b`)]) {
      const l = label(x);
      if (l !== answerText && !distractors.includes(l)) distractors.push(l);
      if (distractors.length === 3) break;
    }
    const options = seededShuffle([answerText, ...distractors], `${seed}-${i}-o`);
    return {
      id: `hq-${word.id}-${i}`,
      wordId: word.id,
      type: 'vocab',
      prompt: toEnglish ? `What does “${word.hi}” (${word.roman}) mean?` : `How do you say “${word.en}” in Hindi?`,
      options,
      answer: options.indexOf(answerText),
      explanation: `${word.hi} (${word.roman}) = ${word.en}. Example: ${word.example.hi} — ${word.example.en}`,
    };
  });
}

/** Hindi word → the shape the shared Flashcards component expects. */
export function toFlashcard(word, categoryLabel) {
  return {
    id: word.id,
    word: word.hi,
    ipa: word.roman,
    partOfSpeech: categoryLabel,
    meaning: word.en,
    example: `${word.example.hi} — ${word.example.en}`,
    synonyms: [],
    speakText: word.hi,
  };
}
