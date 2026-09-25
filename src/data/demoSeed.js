/**
 * Realistic SAMPLE progress so you can explore every screen immediately.
 * Everything created here is flagged `demo: true` and can be removed in
 * Settings → "Clear sample data".
 */
import { WORDS, VOCAB_CATEGORIES } from './vocabulary.js';
import { daysAgo, seededRandom, uid } from '../utils/date.js';
import { xpForSession } from '../utils/stats.js';
import { SCORE_COMPONENTS } from '../services/engine/scoring.js';

export const DEMO_MISTAKES = [
  { category: 'verb-tense', said: 'Yesterday I go to the market with my family.', correct: 'Yesterday I went to the market with my family.', why: 'You are talking about something that already happened, so use the past tense “went”.', practice: { question: 'Last Sunday we ___ (go) to the beach.', answer: 'went' }, topic: 'tenses', source: 'speaking', count: 4 },
  { category: 'prepositions', categories: ['prepositions', 'verb-tense'], said: 'I am working here from two years.', correct: 'I have been working here for two years.', why: 'Use “for” with a length of time, and the present perfect continuous for an action that started in the past and continues now.', practice: { question: 'I have lived in Pune ___ five years.', answer: 'for' }, topic: 'prepositions', source: 'speaking', count: 3 },
  { category: 'articles', said: 'I have meeting with client at 3 pm.', correct: 'I have a meeting with a client at 3 p.m.', why: 'Singular countable nouns like “meeting” and “client” need an article (a / an / the).', practice: { question: 'I joined ___ call with the client.', answer: 'a' }, topic: 'articles', source: 'writing', count: 3 },
  { category: 'subject-verb', said: 'My manager go to office every day.', correct: 'My manager goes to the office every day.', why: 'For he / she / it (one person) in the present simple, add -s or -es: “goes”.', practice: { question: 'She ___ (work) from home on Fridays.', answer: 'works' }, topic: 'subject-verb-agreement', source: 'speaking', count: 2 },
  { category: 'verb-tense', said: 'Last week we complete the release testing.', correct: 'Last week we completed the release testing.', why: '“Last week” tells us the action is finished, so use the past simple: “completed”.', practice: { question: 'Yesterday I ___ (fix) two bugs.', answer: 'fixed' }, topic: 'tenses', source: 'writing', count: 3 },
  { category: 'prepositions', said: 'We discussed about the bug in the stand-up.', correct: 'We discussed the bug in the stand-up.', why: '“Discuss” already means “talk about”, so don’t add “about”.', practice: { question: "Let's ___ the test plan. (discuss / discuss about)", answer: 'discuss' }, topic: 'prepositions', source: 'speaking', count: 2 },
  { category: 'pronunciation', sound: 'th', said: '“three” sounded like “tree”', correct: 'three /θriː/', why: 'The TH sound was recognised as T. Put the tip of your tongue lightly between your teeth and blow air.', practice: null, topic: null, source: 'pronunciation', count: 3 },
  { category: 'vocabulary', said: 'Please revert back by today.', correct: 'Please reply by today.', why: 'In international English, “revert” means “go back to an earlier state”. Say “reply” or “get back to me”.', practice: { question: "I'll ___ to you by Friday. (get back / revert back)", answer: 'get back' }, topic: null, source: 'writing', count: 2 },
  { category: 'verb-form', said: "I didn't went to the gym yesterday.", correct: "I didn't go to the gym yesterday.", why: 'After “didn’t”, always use the base form of the verb: “go”.', practice: { question: "She didn't ___ (call) me back.", answer: 'call' }, topic: 'verbs', source: 'speaking', count: 1 },
  { category: 'pronunciation', sound: 'v', said: '“very” sounded like “wery”', correct: 'very /ˈvɛri/', why: 'For V, touch your top teeth to your bottom lip and let your voice vibrate. W uses rounded lips with no teeth.', practice: null, topic: null, source: 'pronunciation', count: 2 },
  { category: 'plural-singular', said: 'He gave me many informations about the project.', correct: 'He gave me a lot of information about the project.', why: '“Information” is uncountable — no plural -s, and use “a lot of” instead of “many”.', practice: { question: 'Thanks for the ___ (feedback / feedbacks).', answer: 'feedback' }, topic: 'subject-verb-agreement', source: 'grammar', count: 1 },
  { category: 'word-order', said: 'Where you are going for the weekend?', correct: 'Where are you going for the weekend?', why: 'In questions, the helping verb comes before the subject: “Where are you…”.', practice: { question: 'Put in order: “doing / what / you / are?”', answer: 'What are you doing?' }, topic: 'question-formation', source: 'speaking', count: 1 },
  { category: 'articles', said: 'She is engineer in my team.', correct: 'She is an engineer in my team.', why: 'Use “a” or “an” before a job. “Engineer” starts with a vowel sound, so use “an”.', practice: { question: 'He is ___ QA engineer.', answer: 'a' }, topic: 'articles', source: 'speaking', count: 1, mastered: true },
  { category: 'verb-tense', said: 'I have seen him yesterday.', correct: 'I saw him yesterday.', why: 'With a finished time like “yesterday”, use the past simple, not the present perfect.', practice: { question: 'I ___ (finish) the report last night.', answer: 'finished' }, topic: 'tenses', source: 'grammar', count: 1, mastered: true },
];

const SAMPLE_TRANSCRIPT = [
  { role: 'ai', text: 'Hi! How was your day today?' },
  { role: 'user', text: 'Today I go office and I completed many work.' },
  { role: 'ai', text: 'That sounds like a productive day! What kind of work did you complete?' },
  { role: 'user', text: 'I tested the login module and I found three bugs in the payment page.' },
  { role: 'ai', text: 'Interesting! How did you report the issue?' },
  { role: 'user', text: 'I created tickets in Jira and we discussed about them in the meeting.' },
  { role: 'ai', text: 'Great teamwork. What are you looking forward to this week?' },
  { role: 'user', text: 'I am working here from 2 years and I want to improve my English for my next interview.' },
];

const SAMPLE_BETTER = [
  { original: 'I want to improve my English', basic: 'I want to improve my English.', natural: 'I want to become more fluent in English.', professional: "I'm working on improving my English communication skills." },
  { original: 'I completed many work', basic: 'I completed a lot of work.', natural: 'I had a lot on my plate today.', professional: 'I had a heavy workload today.' },
];

const MODES = ['free', 'workplace', 'qa-interview', 'daily-life', 'meeting', 'small-talk'];

function speakingReport(score, rand, mode) {
  const jitter = () => Math.round((rand() - 0.5) * 16);
  const percentages = {
    grammar: Math.min(98, Math.max(35, score - 3 + jitter())),
    vocabulary: Math.min(98, Math.max(35, score + 4 + jitter())),
    pronunciation: Math.min(98, Math.max(35, score - 8 + jitter())),
    fluency: Math.min(98, Math.max(35, score + jitter())),
    sentence: Math.min(98, Math.max(35, score - 2 + jitter())),
    naturalness: Math.min(98, Math.max(35, score + 1 + jitter())),
  };
  const breakdown = Object.fromEntries(SCORE_COMPONENTS.map((c) => [c.id, Math.round((percentages[c.id] / 100) * c.max)]));
  const overall = Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0));
  const mistakes = [DEMO_MISTAKES[0], DEMO_MISTAKES[1], DEMO_MISTAKES[5]].map((m) => ({ ...m, reasons: [] }));
  return {
    overall,
    breakdown,
    percentages: Object.fromEntries(SCORE_COMPONENTS.map((c) => [c.id, Math.round((breakdown[c.id] / c.max) * 100)])),
    confidence: Math.min(95, score + 3),
    notes: { pronunciation: 'Estimated from speech-recognition confidence (sample data).', fluency: 'Estimated from speaking rate and answer length (sample data).' },
    stats: { totalWords: 58, uniqueWords: 44, avgWordsPerTurn: 14.5, advancedWords: ['completed', 'discussed', 'interview'], fillers: 1, turns: 4 },
    reliable: true,
    mistakes,
    categoryCounts: { 'verb-tense': 1, prepositions: 2, articles: 1 },
    betterWays: SAMPLE_BETTER,
    strengths: ['You gave detailed, well-developed answers.', 'Good vocabulary — you used words like “completed”, “discussed”.'],
    improvements: ['Verb tense: use the past tense for finished actions.', 'Prepositions: “for two years”, and “discuss” without “about”.'],
    summary: 'Good conversation! You kept it going well. Your main area to improve is verb tense — let’s practise it next.',
    transcript: SAMPLE_TRANSCRIPT,
    mode,
    demo: true,
  };
}

/** Builds a complete sample state slice (sessions, mistakes, vocab, xp). */
export function buildDemoData(now = new Date()) {
  const rand = seededRandom('speakbetter-demo');
  const sessions = [];

  // Practice days over ~9 weeks, denser recently, with an unbroken 6-day streak ending today.
  const days = [];
  for (let d = 62; d >= 6; d--) if (rand() < 0.55) days.push(d);
  days.push(5, 4, 3, 2, 1, 0);

  const types = ['speaking', 'grammar', 'vocabulary', 'speaking', 'writing', 'listening', 'pronunciation', 'reading'];
  const TITLES = {
    grammar: ['Tenses Quiz', 'Articles Quiz', 'Prepositions Quiz', 'Modals Quiz', 'Conditionals Quiz'],
    vocabulary: ['Workplace Words Review', 'Technology Flashcards', 'Daily 10 Words', 'Interview Words'],
    writing: ['Professional Email', 'Bug Report', 'Leave Request', 'Daily Journal', 'Meeting Message'],
    listening: ['Daily Stand-up', 'At the Coffee Shop', 'Video Call Tips'],
    reading: ['What a Software Tester Does', 'Remote Work', 'Small Habits'],
    pronunciation: ['TH Sounds', 'V and W Sounds', 'Word Stress'],
  };
  // Target curves (first → latest) for each skill.
  const curves = { speaking: [64, 78], grammar: [60, 75], vocabulary: [70, 82], pronunciation: [55, 70], writing: [62, 76], reading: [68, 80], listening: [60, 74] };

  days.forEach((dayOffset, i) => {
    const perDay = dayOffset === 0 ? 1 : rand() < 0.4 ? 2 : 1;
    for (let k = 0; k < perDay; k++) {
      const type = dayOffset === 0 ? 'vocabulary' : types[Math.floor(rand() * types.length)];
      const t = i / Math.max(1, days.length - 1);
      const [from, to] = curves[type];
      const score = Math.round(from + (to - from) * t + (rand() - 0.5) * 8);
      const date = daysAgo(dayOffset, now);
      date.setHours(dayOffset === 0 ? Math.max(0, Math.min(now.getHours(), 8)) : 8 + Math.floor(rand() * 12), Math.floor(rand() * 60), 0, 0);
      if (dayOffset === 0 && date > now) date.setTime(now.getTime() - 60 * 60 * 1000);
      const durationSec = dayOffset === 0 ? 8 * 60 : Math.round((type === 'speaking' ? 10 + rand() * 10 : 5 + rand() * 10) * 60);
      let session;
      if (type === 'speaking') {
        const mode = MODES[Math.floor(rand() * MODES.length)];
        const report = speakingReport(score, rand, mode);
        session = {
          type,
          title: 'Speaking Practice',
          score: report.overall,
          skills: { speaking: report.overall, grammar: report.percentages.grammar, vocabulary: report.percentages.vocabulary, pronunciation: report.percentages.pronunciation },
          details: { mode, difficulty: 'intermediate', personality: 'friendly', report },
        };
      } else {
        const titles = TITLES[type];
        session = {
          type,
          title: titles[Math.floor(rand() * titles.length)],
          score,
          skills: { [type]: score },
          details: { summary: 'Sample session', level: type === 'listening' ? 3 : undefined },
        };
      }
      sessions.push({ id: uid('s'), date: date.toISOString(), durationSec, xp: xpForSession(session.score, durationSec), demo: true, ...session });
    }
  });

  const mistakes = DEMO_MISTAKES.map((m, i) => ({
    id: uid('m'),
    categories: [m.category],
    reasons: [],
    mastered: false,
    ...m,
    createdAt: daysAgo(20 - i).toISOString(),
    lastSeen: daysAgo(Math.max(0, 10 - i)).toISOString(),
    demo: true,
  }));

  const vocab = {};
  VOCAB_CATEGORIES.forEach((cat) => {
    WORDS.filter((w) => w.category === cat.id)
      .slice(0, 4)
      .forEach((w, i) => {
        const due = daysAgo(i % 2 === 0 ? 0 : -3, now);
        vocab[w.id] = { learned: true, favorite: i === 0, box: 1 + (i % 3), due: due.toISOString(), reviews: 2 + i, lastReviewed: daysAgo(3).toISOString(), demo: true };
      });
  });

  // Sample XP is scaled down so a new learner starts around "Communicator", not near the top.
  const xp = Math.round(sessions.reduce((sum, s) => sum + s.xp, 0) * 0.35);
  return { sessions: sessions.sort((a, b) => new Date(b.date) - new Date(a.date)), mistakes, vocab, xp };
}
