export const ACHIEVEMENTS = [
  { id: 'first-session', title: 'First Step', description: 'Complete your first practice session', icon: 'Rocket', target: 1, value: (s) => s.totalSessions },
  { id: 'streak-7', title: '7 Day Streak', description: 'Practise 7 days in a row', icon: 'Flame', target: 7, value: (s) => s.bestStreak },
  { id: 'speaking-10', title: '10 Speaking Sessions', description: 'Complete 10 conversations with Emma', icon: 'Mic', target: 10, value: (s) => s.countByType.speaking || 0 },
  { id: 'words-100', title: '100 Words Learned', description: 'Mark 100 vocabulary words as learned', icon: 'BookOpen', target: 100, value: (s) => s.wordsLearned },
  { id: 'writing-10', title: '10 Writing Practices', description: 'Get feedback on 10 pieces of writing', icon: 'PenLine', target: 10, value: (s) => s.countByType.writing || 0 },
  { id: 'score-90', title: 'First 90+ Score', description: 'Score 90 or more in any session', icon: 'Trophy', target: 90, value: (s) => s.bestScore },
  { id: 'mistakes-25', title: 'Mistake Crusher', description: 'Master 25 of your mistakes', icon: 'Target', target: 25, value: (s) => s.mistakesCorrected },
  { id: 'streak-30', title: '30 Day Streak', description: 'Practise 30 days in a row', icon: 'Crown', target: 30, value: (s) => s.bestStreak },
];

export function achievementProgress(stats) {
  return ACHIEVEMENTS.map((a) => {
    const value = a.value(stats);
    return { ...a, current: Math.min(value, a.target), unlocked: value >= a.target, progress: Math.min(1, value / a.target) };
  });
}
