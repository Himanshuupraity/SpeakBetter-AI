import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moodOf, nextReply } from '../src/services/engine/conversationEngine.js';
import { CONVERSATION_MODES } from '../src/data/conversationModes.js';

const MOODS = [
  // Sick, and negation-aware sick
  ['I have fever', 'sick'],
  ['I have a bad cold.', 'sick'],
  ['I was in the hospital last week.', 'sick'],
  ["I'm not sick anymore, I feel great today.", 'positive'],
  ['I had a cold drink after lunch.', 'neutral'],
  ['I watched a film about a hospital.', 'neutral'],
  // Emphatic positives with negative words
  ["I can't wait for the weekend, it will be amazing.", 'positive'],
  ["I couldn't be happier today!", 'positive'],
  ['No, it was a great day.', 'positive'],
  // Negated complaints
  ['I had no problems today, everything went smoothly.', 'positive'],
  ["I didn't have any problems.", 'positive'],
  ['Nothing bad happened at work.', 'positive'],
  ['Not very bad, actually.', 'positive'],
  ["It isn't bad.", 'positive'],
  // Real negatives
  ['It was not good.', 'negative'],
  ["It wasn't good.", 'negative'],
  ["I didn't enjoy it.", 'negative'],
  ['It was a hard day.', 'negative'],
  ['I am very tired.', 'negative'],
  ['No, I feel much worse.', 'negative'],
  // Work, none, neutral
  ['I worked hard and finished everything.', 'work'],
  ["I didn't do anything.", 'none'],
  ["No, I didn't learn anything.", 'none'],
  ['I went to the market.', 'neutral'],
];

for (const [text, mood] of MOODS) {
  test(`moodOf(${JSON.stringify(text)}) = ${mood}`, () => {
    assert.equal(moodOf(text), mood);
  });
}

const mode = CONVERSATION_MODES[0].id;
const SICK_FOLLOW_UP = "Oh no, I'm sorry you're not feeling well. Are you feeling any better now?";

test('feeling worse after a sick follow-up gets sympathy, not "That\'s good"', () => {
  const history = [
    { role: 'ai', text: 'Hi! How was your day?' },
    { role: 'user', text: 'I was sick yesterday with a bad fever.' },
    { role: 'ai', text: SICK_FOLLOW_UP },
    { role: 'user', text: 'No, I feel much worse today honestly.' },
  ];
  for (let i = 0; i < 20; i++) {
    const { text } = nextReply({ mode, history });
    assert.doesNotMatch(text, /good|glad/i, text);
  }
});

test('feeling better after a sick follow-up gets a positive acknowledgement', () => {
  const history = [
    { role: 'ai', text: 'Hi! How was your day?' },
    { role: 'user', text: 'I was sick yesterday with a bad fever.' },
    { role: 'ai', text: SICK_FOLLOW_UP },
    { role: 'user', text: 'Yes, I feel much better now, thanks.' },
  ];
  const { text } = nextReply({ mode, history });
  assert.match(text, /good|glad/i);
});

test('a very short sick answer still gets sympathy instead of "tell me more"', () => {
  for (let i = 0; i < 10; i++) {
    const { text } = nextReply({ mode, history: [{ role: 'ai', text: 'Hi!' }, { role: 'user', text: 'I have fever' }] });
    assert.match(text, /sorry|hope|take care|uncomfortable/i, text);
  }
});
