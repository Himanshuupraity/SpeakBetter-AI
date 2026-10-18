import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSentence } from '../src/services/engine/textAnalyzer.js';

const ruleIds = (s, opts) => analyzeSentence(s, opts).issues.map((i) => i.ruleId);

// Correct English that must NOT be flagged.
const CORRECT = [
  'Myself and my team worked on the release.',
  'I need to get office supplies.',
  'I came to home page and clicked login.',
  'I have worked hard since last week.',
  'I have been busy for the last two weeks.',
  'Last year I moved to Pune and now I work at Infosys.',
  'I want to move to Canada in 2030.',
  'I am going to Goa for two days.',
  "I'm leaving early since it is late.",
  "Why doesn't he go home?",
  "Didn't she call you?",
  'Has he come back yet?',
  'Does she work here?',
  'We hired many software engineers.',
  'She researches climate change.',
  'He stuffs his bag with snacks.',
  'He explained her decision to the team.',
  'Can you explain them to me?',
  'Can you explain it to me?',
  'I want to lead the project.',
  'Please talk to HR about it.',
  'What you are saying is right.',
  'She is one of the project managers.',
  'There is some news about the release.',
  'There was a lot of stress at work.',
  'The weather is great in spring.',
  'I work on night shifts.',
  'He got mad on the call.',
  'The meeting moved from one day to another.',
  'I have call centre experience.',
  'I attended an interview yesterday.',
  'I have a meeting at 4 p.m.',
  'Yesterday I went to the office.',
  'I go to the office every day.',
  'He goes to work by bus.',
  'I have been working here for two years.',
  'I agree with you.',
  'I have a question.',
  'We are having a phone call now.',
  'Beyond a doubt, it works.',
  'She is good at testing.',
  'I usually exercise in the morning.',
  "I can't sleep at night.",
  'My manager was upset with me.',
  'Many people are working from home now.',
  'There are many bugs.',
  'I am a QA engineer.',
  'Where are you going?',
  'I discussed the plan with the developer.',
  'He is married to a doctor.',
];

for (const s of CORRECT) {
  test(`no issues: ${s}`, () => {
    assert.deepEqual(ruleIds(s), []);
  });
}

// Real learner mistakes that must still be caught: [sentence, ruleId, expected correction (optional)].
const MISTAKES = [
  ['Myself Priya and I work in QA.', 'myself-intro', "I'm Priya and I work in QA."],
  ['I go to office at 9 a.m.', 'go-office', 'I go to the office at 9 a.m.'],
  ['I reached office late.', 'reach-office', 'I reached the office late.'],
  ['She is still at office.', 'at-office'],
  ['After work, I went to home.', 'to-home', 'After work, I went home.'],
  ['I have finished the report yesterday.', 'perfect-with-past-time', 'I finished the report yesterday.'],
  ['I have seen it two days ago.', 'perfect-with-past-time', 'I saw it two days ago.'],
  ['Yesterday I meet my manager.', 'past-tense', 'Yesterday I met my manager.'],
  ['Last week we complete the testing.', 'past-tense', 'Last week we completed the testing.'],
  ['In 2019 I join the company.', 'past-tense', 'In 2019 I joined the company.'],
  ["I didn't went there.", 'did-past', "I didn't go there."],
  ['I have went there.', 'have-past', 'I have gone there.'],
  ['I have lived here from five years.', 'from-duration', 'I have lived here for five years.'],
  ['I am working here since 2021.', 'perfect-continuous', 'I have been working here since 2021.'],
  ['I am working here for two years.', 'perfect-continuous', 'I have been working here for two years.'],
  ['He go to office every day.', 'third-person-s'],
  ['She work in QA.', 'third-person-s', 'She works in QA.'],
  ['I have many work today.', 'many-uncountable', 'I have a lot of work today.'],
  ['Thanks for your feedbacks.', 'uncountable-plural', 'Thanks for your feedback.'],
  ['I did some researches on it.', 'uncountable-plural', 'I did some research on it.'],
  ["Let's discuss about the plan.", 'discuss-about', "Let's discuss the plan."],
  ['Can you explain me how this works?', 'explain-me', 'Can you explain to me how this works?'],
  ['Please explain her the process.', 'explain-me'],
  ["I'll revert back by Friday.", 'revert-back'],
  ['She returned back from Mumbai.', 'return-back'],
  ['How do you cope up with stress?', 'cope-up'],
  ['Can we prepone the meeting?', 'prepone'],
  ['Please do the needful.', 'do-the-needful'],
  ["I'll be out of station next week.", 'out-of-station'],
  ['I have a doubt about the task.', 'doubt-question', 'I have a question about the task.'],
  ['I am agree with you.', 'am-agree', 'I agree with you.'],
  ['I am having a question.', 'stative-having', 'I have a question.'],
  ['I can able to join the call.', 'can-able'],
  ['This version is more better.', 'double-comparative'],
  ['He is engineer.', 'article-profession', 'He is an engineer.'],
  ['I have meeting at 4 p.m.', 'missing-article-event', 'I have a meeting at 4 p.m.'],
  ['I attended interview yesterday.', 'missing-article-event', 'I attended an interview yesterday.'],
  ['I will discuss it with developer tomorrow.', 'missing-article-role', 'I will discuss it with the developer tomorrow.'],
  ['I talked to team lead.', 'missing-article-role'],
  ['What you are doing?', 'question-word-order', 'What are you doing?'],
  ['She is one of my best friend.', 'one-of-plural', 'She is one of my best friends.'],
  ['One of my friend is a doctor.', 'one-of-plural', 'One of my friends is a doctor.'],
  ['Many people is working from home.', 'people-is'],
  ['There is many bugs.', 'there-is-plural', 'There are many bugs.'],
  ['He is married with a doctor.', 'married-with'],
  ['She is good in testing.', 'good-in', 'She is good at testing.'],
  ['I exercise at morning.', 'at-morning', 'I exercise in the morning.'],
  ["I can't sleep in night.", 'in-night', "I can't sleep at night."],
  ['My manager was angry on me.', 'angry-on', 'My manager was angry with me.'],
];

for (const [s, id, corrected] of MISTAKES) {
  test(`catches ${id}: ${s}`, () => {
    const r = analyzeSentence(s);
    assert.ok(r.issues.some((i) => i.ruleId === id), `expected ${id}, got [${r.issues.map((i) => i.ruleId)}]`);
    if (corrected) assert.equal(r.corrected, corrected);
  });
}

test('writing mode: text-speak is fixed, abbreviations are left alone', () => {
  assert.equal(analyzeSentence('Can u send it?', { mode: 'writing' }).corrected, 'Can you send it?');
  assert.equal(analyzeSentence('We opened a U.S. office.', { mode: 'writing' }).corrected, 'We opened a U.S. office.');
  assert.equal(analyzeSentence('Our R&D team grew.', { mode: 'writing' }).corrected, 'Our R&D team grew.');
  assert.equal(analyzeSentence('I recieved the email.', { mode: 'writing' }).corrected, 'I received the email.');
});
