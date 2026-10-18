import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzePace } from '../src/services/engine/paceAnalyzer.js';

const FIELDS = ['wpm', 'words', 'speakingSec', 'totalSec', 'pauseSec', 'longPauses', 'timeline', 'consistency', 'verdict', 'verdictLabel', 'headline', 'message', 'tips', 'score', 'range', 'context', 'contextLabel', 'transcript', 'method'];

function assertSane(r) {
  for (const f of FIELDS) assert.ok(f in r, `missing field ${f}`);
  for (const f of ['wpm', 'words', 'speakingSec', 'totalSec', 'pauseSec', 'longPauses', 'score']) {
    assert.ok(Number.isFinite(r[f]), `${f} is ${r[f]}`);
  }
  assert.ok(Array.isArray(r.tips) && r.tips.length > 0);
  assert.ok(Array.isArray(r.timeline));
  assert.equal(r.range.length, 2);
}

const INSUFFICIENT = [
  ['empty, zero duration', { transcript: '', samples: [], durationMs: 0 }],
  ['empty, missing duration', { transcript: '', samples: [] }],
  ['one word, zero duration', { transcript: 'hello', samples: [], durationMs: 0 }],
  ['two samples 20 ms apart', { transcript: 'hello there', samples: [{ t: 500, words: 1 }, { t: 520, words: 2 }], durationMs: 5000 }],
  ['words but no audio length', { transcript: 'one two three four', samples: [], durationMs: Number.NaN }],
];

for (const [label, input] of INSUFFICIENT) {
  test(`not enough speech: ${label}`, () => {
    const r = analyzePace(input, 'conversation');
    assertSane(r);
    assert.equal(r.verdict, 'insufficient');
    assert.equal(r.wpm, 0);
    assert.equal(r.score, 0);
    assert.doesNotMatch(r.headline, /perfect/i);
  });
}

test('steady speech at ~140 wpm is a perfect conversation pace', () => {
  const samples = Array.from({ length: 30 }, (_, i) => ({ t: 500 + i * 1000, words: Math.round((i + 1) * 140 / 60) }));
  const words = samples[samples.length - 1].words;
  const transcript = Array.from({ length: words }, () => 'word').join(' ');
  const r = analyzePace({ transcript, samples, durationMs: 31000 }, 'conversation');
  assertSane(r);
  assert.equal(r.verdict, 'perfect');
  assert.ok(r.wpm >= 120 && r.wpm <= 160, `wpm ${r.wpm}`);
  assert.ok(r.score > 80);
});

test('timer mode uses the known word count and the recording length', () => {
  const r = analyzePace({ transcript: '', samples: [], durationMs: 60000, knownWordCount: 90 }, 'presentation');
  assertSane(r);
  assert.equal(r.method, 'timer');
  assert.equal(r.wpm, 90);
  assert.equal(r.verdict, 'slow');
});
