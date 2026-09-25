/** Pure selectors that derive dashboard/progress numbers from stored state. */
import { dayKey, daysAgo, diffInDays } from './date.js';
import { average } from './text.js';
import { MISTAKE_CATEGORIES } from '../services/engine/grammarRules.js';

export const SKILLS = [
  { id: 'speaking', label: 'Speaking' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'pronunciation', label: 'Pronunciation' },
  { id: 'writing', label: 'Writing' },
  { id: 'reading', label: 'Reading' },
  { id: 'listening', label: 'Listening' },
  { id: 'pace', label: 'Speaking pace' },
];
export const CORE_SKILLS = ['speaking', 'grammar', 'vocabulary', 'pronunciation'];

export const SESSION_TYPES = {
  speaking: { label: 'Speaking Practice', route: '/speak' },
  grammar: { label: 'Grammar', route: '/grammar' },
  vocabulary: { label: 'Vocabulary', route: '/vocabulary' },
  writing: { label: 'Writing', route: '/writing' },
  reading: { label: 'Reading', route: '/reading' },
  listening: { label: 'Listening', route: '/listening' },
  pronunciation: { label: 'Pronunciation', route: '/pronunciation' },
  speed: { label: 'Speaking Speed', route: '/speed' },
  'level-test': { label: 'Level Test', route: '/level-test' },
};

export function minutesOn(sessions, key) {
  return sessions.filter((s) => dayKey(s.date) === key).reduce((sum, s) => sum + s.durationSec / 60, 0);
}

export function computeStreak(sessions, today = new Date()) {
  const days = new Set(sessions.map((s) => dayKey(s.date)));
  let streak = 0;
  let offset = days.has(dayKey(today)) ? 0 : 1;
  while (days.has(dayKey(daysAgo(offset, today)))) {
    streak += 1;
    offset += 1;
  }
  return streak;
}

export function bestStreak(sessions) {
  const days = [...new Set(sessions.map((s) => dayKey(s.date)))].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  days.forEach((d) => {
    run = prev && diffInDays(d, prev) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  });
  return best;
}

/** Weighted average of the latest 5 sessions that measured the skill (recent counts more). */
export function skillScore(sessions, skill) {
  const relevant = sessions.filter((s) => typeof s.skills?.[skill] === 'number').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (!relevant.length) return null;
  const weights = [5, 4, 3, 2, 1];
  const total = relevant.reduce((sum, s, i) => sum + s.skills[skill] * weights[i], 0);
  return Math.round(total / relevant.reduce((sum, _s, i) => sum + weights[i], 0));
}

export function trend(sessions, skill, period = 'week', points = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = points - 1; i >= 0; i--) {
    let start;
    let end;
    let label;
    if (period === 'week') {
      end = daysAgo(i * 7, now);
      start = daysAgo(i * 7 + 6, now);
      label = i === 0 ? 'Now' : `-${i}w`;
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      label = start.toLocaleDateString('en-GB', { month: 'short' });
    }
    const sKey = dayKey(start);
    const eKey = dayKey(end);
    const inRange = sessions.filter((s) => {
      const k = dayKey(s.date);
      return k >= sKey && k <= eKey && typeof s.skills?.[skill] === 'number';
    });
    buckets.push({ label, value: inRange.length ? Math.round(average(inRange.map((s) => s.skills[skill]))) : null });
  }
  return buckets;
}

export function minutesByDay(sessions, days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const d = daysAgo(days - 1 - i);
    return { label: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2), key: dayKey(d), value: Math.round(minutesOn(sessions, dayKey(d))) };
  });
}

export function weakAreas(mistakes) {
  const counts = {};
  mistakes
    .filter((m) => !m.mastered)
    .forEach((m) => {
      const key = m.category === 'pronunciation' && m.sound ? `pronunciation:${m.sound}` : m.category;
      counts[key] = (counts[key] || 0) + (m.count || 1);
    });
  return Object.entries(counts)
    .map(([key, count]) => {
      const [cat, sound] = key.split(':');
      return {
        key,
        category: cat,
        sound,
        label: sound ? `Pronunciation - ${sound.toUpperCase()}` : MISTAKE_CATEGORIES[cat]?.label || cat,
        topic: MISTAKE_CATEGORIES[cat]?.topic,
        count,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function computeStats(state) {
  const { sessions, mistakes, vocab, profile } = state;
  const todayKey = dayKey();
  const skillScores = Object.fromEntries(SKILLS.map((s) => [s.id, skillScore(sessions, s.id)]));
  // Pace is tracked separately — it isn't part of the overall English score.
  const overallParts = SKILLS.filter((s) => s.id !== 'pace').map((s) => skillScores[s.id]).filter((v) => v != null);
  const countByType = sessions.reduce((acc, s) => ({ ...acc, [s.type]: (acc[s.type] || 0) + 1 }), {});
  const todayMinutes = Math.round(minutesOn(sessions, todayKey));

  return {
    todayMinutes,
    goalMinutes: profile.dailyMinutes,
    goalProgress: Math.min(1, todayMinutes / Math.max(1, profile.dailyMinutes)),
    streak: computeStreak(sessions),
    bestStreak: bestStreak(sessions),
    last7Days: minutesByDay(sessions, 7),
    skillScores,
    overall: overallParts.length ? Math.round(average(overallParts)) : null,
    totalMinutes: Math.round(sessions.reduce((sum, s) => sum + s.durationSec / 60, 0)),
    countByType,
    totalSessions: sessions.length,
    conversations: countByType.speaking || 0,
    wordsLearned: Object.values(vocab).filter((v) => v.learned).length,
    mistakesCorrected: mistakes.filter((m) => m.mastered).length,
    openMistakes: mistakes.filter((m) => !m.mastered).length,
    bestScore: sessions.reduce((max, s) => Math.max(max, s.score || 0), 0),
    weakAreas: weakAreas(mistakes),
    todayTypes: new Set(sessions.filter((s) => dayKey(s.date) === todayKey).map((s) => s.type)),
  };
}

export function xpForSession(score, durationSec) {
  return Math.max(10, Math.round((durationSec / 60) * 5 + (score || 0) / 2));
}
