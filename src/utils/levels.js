export const CEFR_LEVELS = [
  { id: 'A1', label: 'Beginner', description: 'I know basic words and simple phrases.' },
  { id: 'A2', label: 'Elementary', description: 'I can talk about simple everyday things.' },
  { id: 'B1', label: 'Intermediate', description: 'I can handle most daily and work conversations.' },
  { id: 'B2', label: 'Upper Intermediate', description: 'I speak fairly fluently but make some mistakes.' },
  { id: 'C1', label: 'Advanced', description: 'I express myself fluently and precisely.' },
];

export function cefrLabel(id) {
  const lvl = CEFR_LEVELS.find((l) => l.id === id);
  return lvl ? `${lvl.id} - ${lvl.label}` : id;
}

/** Maps CEFR to the conversation difficulty names used by Emma. */
export const CEFR_TO_DIFFICULTY = { A1: 'beginner', A2: 'elementary', B1: 'intermediate', B2: 'upper-intermediate', C1: 'advanced' };

export const XP_LEVELS = [
  { name: 'Beginner', minXp: 0 },
  { name: 'Explorer', minXp: 300 },
  { name: 'Communicator', minXp: 1000 },
  { name: 'Confident Speaker', minXp: 2500 },
  { name: 'Fluent Speaker', minXp: 5000 },
];

export function xpLevel(xp) {
  let index = 0;
  XP_LEVELS.forEach((lvl, i) => {
    if (xp >= lvl.minXp) index = i;
  });
  const current = XP_LEVELS[index];
  const next = XP_LEVELS[index + 1];
  const progress = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;
  return { index, current, next, progress: Math.min(1, Math.max(0, progress)) };
}

export function scoreTone(score) {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'low';
}

export function scoreColor(score) {
  const tone = scoreTone(score);
  return {
    excellent: 'text-emerald-600 dark:text-emerald-400',
    good: 'text-brand-600 dark:text-brand-400',
    fair: 'text-amber-600 dark:text-amber-400',
    low: 'text-rose-600 dark:text-rose-400',
  }[tone];
}
