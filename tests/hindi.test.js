import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWordQuiz, compareHindi, normalizeHindi } from '../src/utils/hindi.js';
import { CONSONANT_GROUPS, HINDI_LESSONS, HINDI_PHRASES, HINDI_WORDS, PHRASE_GROUPS, HINDI_WORD_CATEGORIES, VOWELS } from '../src/data/hindi.js';

test('normalizeHindi ignores punctuation, nukta and chandrabindu vs anusvara', () => {
  assert.equal(normalizeHindi('मैं ठीक हूँ।'), normalizeHindi('मैं ठीक हूं'));
  assert.equal(normalizeHindi('ज़्यादा'), normalizeHindi('ज्यादा'));
  assert.equal(normalizeHindi('आप कैसे हैं?'), 'आप कैसे हैं');
});

test('normalizeHindi turns digits into Hindi number words', () => {
  assert.equal(normalizeHindi('5 मिनट रुकिए'), normalizeHindi('पाँच मिनट रुकिए'));
  assert.equal(normalizeHindi('५ मिनट'), normalizeHindi('पांच मिनट'));
});

test('a perfect attempt scores 100 and matches every word', () => {
  const r = compareHindi('आप कैसे हैं?', 'आप कैसे हैं');
  assert.equal(r.score, 100);
  assert.ok(r.words.every((w) => w.matched));
});

test('a common recogniser spelling difference still scores high', () => {
  const r = compareHindi('मैं ठीक हूँ, धन्यवाद।', 'मैं ठीक हूं धन्यवाद');
  assert.equal(r.score, 100);
});

test('a missing word lowers the score and is marked as missed', () => {
  const r = compareHindi('मुझे पानी चाहिए।', 'मुझे चाहिए');
  assert.ok(r.score < 80 && r.score > 30, `score ${r.score}`);
  assert.equal(r.words.find((w) => w.word === 'पानी').matched, false);
});

test('silence or unrelated speech scores 0', () => {
  assert.equal(compareHindi('नमस्ते', '').score, 0);
  assert.equal(compareHindi('स्टेशन कहाँ है?', 'hello world').score, 0);
});

test('rambling extra words cannot reach 100', () => {
  const r = compareHindi('नमस्ते', 'नमस्ते आप कैसे हैं मैं ठीक हूँ धन्यवाद');
  assert.ok(r.score < 100);
});

test('word quiz has one correct, unique options per question', () => {
  const qs = buildWordQuiz(HINDI_WORDS, { count: 10, seed: 'fixed' });
  assert.equal(qs.length, 10);
  for (const q of qs) {
    assert.equal(new Set(q.options).size, q.options.length, q.prompt);
    assert.ok(q.answer >= 0 && q.answer < q.options.length);
    assert.equal(q.options.length, 4);
  }
});

test('content is well formed: unique ids, valid quiz answers, known categories', () => {
  const ids = [...VOWELS, ...CONSONANT_GROUPS.flatMap((g) => g.letters), ...HINDI_WORDS, ...HINDI_PHRASES].map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  const cats = new Set(HINDI_WORD_CATEGORIES.map((c) => c.id));
  HINDI_WORDS.forEach((w) => assert.ok(cats.has(w.category), w.id));
  const groups = new Set(PHRASE_GROUPS.map((g) => g.id));
  HINDI_PHRASES.forEach((p) => assert.ok(groups.has(p.group), p.id));
  const qids = HINDI_LESSONS.flatMap((l) => l.quiz.map((q) => q.id));
  assert.equal(new Set(qids).size, qids.length);
  HINDI_LESSONS.forEach((l) => l.quiz.forEach((q) => {
    assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
    assert.equal(new Set(q.options).size, q.options.length, q.id);
  }));
});

test('every phrase scores 100 against itself', () => {
  HINDI_PHRASES.forEach((p) => assert.equal(compareHindi(p.hi, p.hi).score, 100, p.id));
});
