/** Builds today's personalised plan from the daily goal, main goal and weak areas. */
const ALLOCATION = {
  10: { speaking: 5, vocabulary: 5 },
  20: { vocabulary: 4, grammar: 4, speaking: 8, listening: 4 },
  25: { vocabulary: 5, grammar: 5, speaking: 10, listening: 5 },
  30: { vocabulary: 5, grammar: 5, speaking: 10, listening: 5, writing: 5 },
  45: { vocabulary: 5, grammar: 5, speaking: 15, listening: 5, writing: 5, pronunciation: 5, reading: 5 },
  60: { vocabulary: 8, grammar: 8, speaking: 20, listening: 6, writing: 6, pronunciation: 6, reading: 6 },
};

export const DAILY_GOALS = [10, 20, 25, 30, 45, 60];

const GOAL_BOOST = {
  pronunciation: ['pronunciation', 'speaking'],
  writing: ['writing', 'speaking'],
  interview: ['speaking', 'vocabulary'],
  workplace: ['speaking', 'writing'],
  travel: ['speaking', 'listening'],
  speaking: ['speaking', 'pronunciation'],
  general: ['speaking', 'reading'],
};

function closestAllocation(minutes) {
  const key = Object.keys(ALLOCATION).map(Number).reduce((a, b) => (Math.abs(b - minutes) < Math.abs(a - minutes) ? b : a));
  return { ...ALLOCATION[key] };
}

export function generatePlan(profile, stats) {
  const alloc = closestAllocation(profile.dailyMinutes || 25);
  const [primary] = GOAL_BOOST[profile.goal] || [];
  if (primary && !alloc[primary] && alloc.vocabulary > 3) {
    alloc[primary] = 5;
    alloc.vocabulary -= 2;
    if (alloc.grammar) alloc.grammar -= 3;
  }

  const weak = stats.weakAreas || [];
  const grammarWeak = weak.find((w) => w.topic && w.category !== 'vocabulary');
  const pronWeak = weak.find((w) => w.category === 'pronunciation');
  const speakingScore = stats.skillScores?.speaking;
  const interviewMode = profile.goal === 'interview' ? 'job-interview' : profile.goal === 'workplace' ? 'workplace' : profile.goal === 'travel' ? 'travel' : 'free';

  const templates = {
    speaking: {
      title: 'Speaking with Emma',
      reason: speakingScore != null && speakingScore < 75 ? 'You need more practice with fluency — aim for longer answers.' : 'Have a conversation to build confidence and fluency.',
      to: `/speak?mode=${interviewMode}`,
    },
    vocabulary: { title: 'Vocabulary', reason: 'Learn 5 new words and review words that are due.', to: '/vocabulary' },
    grammar: {
      title: 'Grammar',
      reason: grammarWeak ? `Practise ${grammarWeak.label.toLowerCase()} — it's one of your weak areas.` : 'Complete one short grammar quiz.',
      to: grammarWeak ? `/grammar/${grammarWeak.topic}` : '/grammar',
    },
    listening: { title: 'Listening', reason: 'Listen to a short conversation and answer questions.', to: '/listening' },
    writing: { title: 'Writing', reason: 'Write a short professional message and get feedback.', to: '/writing' },
    pronunciation: {
      title: 'Pronunciation',
      reason: pronWeak ? `Practise the ${pronWeak.sound?.toUpperCase() || ''} sound — it needs work.` : 'Practise difficult sounds like TH and V/W.',
      to: pronWeak?.sound ? `/pronunciation?sound=${pronWeak.sound}` : '/pronunciation',
    },
    reading: { title: 'Reading', reason: 'Read one short article at your level.', to: '/reading' },
  };

  const order = ['vocabulary', 'grammar', 'speaking', 'listening', 'writing', 'pronunciation', 'reading'];
  const tasks = order
    .filter((type) => alloc[type])
    .map((type) => ({ id: type, type, minutes: alloc[type], ...templates[type], done: stats.todayTypes?.has(type) || false }));
  return { tasks, totalMinutes: tasks.reduce((s, t) => s + t.minutes, 0) };
}
