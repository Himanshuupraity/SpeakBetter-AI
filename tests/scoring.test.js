import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreSpeaking } from '../src/services/engine/scoring.js';

test('no turns scores 0, not a free grammar score', () => {
  const r = scoreSpeaking({ turns: [], issues: [] });
  assert.equal(r.overall, 0);
  assert.equal(r.breakdown.grammar, 0);
  assert.equal(r.reliable, false);
});

test('only empty turns score 0', () => {
  const r = scoreSpeaking({ turns: [{ text: '', viaVoice: true, confidence: 0.9, spokenMs: 2000 }, { text: '   ', viaVoice: false }], issues: [] });
  assert.equal(r.overall, 0);
  assert.equal(r.stats.totalWords, 0);
  for (const v of Object.values(r.breakdown)) assert.ok(v == null || v === 0);
});

test('an empty turn counts as 0 words (a short turn), not 1', () => {
  const full = { text: 'I went to the office and finished all my testing work early today.', viaVoice: false };
  const withEmpty = scoreSpeaking({ turns: [full, { text: '', viaVoice: false }], issues: [] });
  const alone = scoreSpeaking({ turns: [full], issues: [] });
  assert.ok(withEmpty.breakdown.sentence < alone.breakdown.sentence);
});

test('external pronunciation / fluency are clamped to the component max', () => {
  const turns = [{ text: 'Yesterday I completed the regression testing and reported three bugs to the developer.', viaVoice: true, confidence: 0.9, spokenMs: 6000 }];
  const r = scoreSpeaking({ turns, issues: [], external: { pronunciation: 35, fluency: -4 } });
  assert.equal(r.breakdown.pronunciation, 20);
  assert.equal(r.breakdown.fluency, 0);
  assert.ok(r.overall >= 0 && r.overall <= 100);
});

test('a normal typed answer gets a sensible score and skips pronunciation', () => {
  const turns = [
    { text: 'I work as a QA engineer and I test web applications every day.', viaVoice: false },
    { text: 'Yesterday I found two bugs in the login page, so I reported them to the developer.', viaVoice: false },
  ];
  const r = scoreSpeaking({ turns, issues: [] });
  assert.equal(r.breakdown.pronunciation, null);
  assert.ok(r.overall > 50 && r.overall <= 100, `overall ${r.overall}`);
});
