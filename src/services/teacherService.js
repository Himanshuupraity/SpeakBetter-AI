/**
 * Emma, the persistent AI teacher. She reads the learner's history and weak
 * areas to decide what to say and what to recommend next. With a real backend
 * this could call an LLM with the learner profile as context.
 */
import { CEFR_TO_DIFFICULTY } from '../utils/levels.js';

const DIFFICULTY_ORDER = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];

const FOCUS_MESSAGES = {
  'verb-tense': { message: "Today let's practise the past tense, because I noticed this is one of your weak areas.", tip: 'Today, try to use the past tense carefully when you talk about what happened.', to: '/grammar/tenses', action: 'Practise tenses' },
  'verb-form': { message: "Let's work on verb forms today — things like “didn't go” instead of “didn't went”.", tip: 'Remember: after “did” and “didn’t”, use the base verb.', to: '/grammar/verbs', action: 'Practise verbs' },
  articles: { message: 'Articles (a, an, the) keep coming up in your mistakes. A quick 5-minute review will help a lot!', tip: 'Watch your articles today — “a meeting”, “the office”.', to: '/grammar/articles', action: 'Practise articles' },
  prepositions: { message: "Prepositions are tricky! Let's review “for” vs “since” and “in / on / at”.", tip: 'Pay attention to prepositions like “for two years” and “in the morning”.', to: '/grammar/prepositions', action: 'Practise prepositions' },
  'subject-verb': { message: "Let's practise subject-verb agreement — “he goes”, “she works”.", tip: 'Remember the -s with he, she and it today.', to: '/grammar/subject-verb-agreement', action: 'Practise agreement' },
  'plural-singular': { message: "Let's review countable and uncountable nouns — “a lot of work”, “information”.", tip: 'Careful with words like “work”, “information” and “feedback” — no plural -s.', to: '/grammar/subject-verb-agreement', action: 'Review nouns' },
  'word-order': { message: "Let's practise question word order — “What are you doing?”", tip: 'When you ask me questions, put the helping verb first.', to: '/grammar/question-formation', action: 'Practise questions' },
  vocabulary: { message: "I noticed a few word-choice mistakes. Let's learn some natural alternatives today.", tip: 'Try to use natural, international English expressions today.', to: '/vocabulary', action: 'Learn words' },
  pace: { message: 'Your speaking speed needs a little work. Let’s do a quick read-aloud with the pace guide today.', tip: 'Try to speak at a calm, steady pace today — not too fast, not too slow.', to: '/speed', action: 'Check my speed' },
  pronunciation: { message: "Let's spend 5 minutes practising difficult sounds today.", tip: null, to: '/pronunciation', action: 'Practise sounds' },
};

export const teacherService = {
  /** Emma's message on the dashboard. */
  getInsight(stats, profile) {
    const top = stats.weakAreas?.[0];
    if (top) {
      const f = FOCUS_MESSAGES[top.category];
      if (f && top.category === 'pronunciation' && top.sound) {
        return { message: `Let's spend 5 minutes practising ${top.sound.toUpperCase()} sounds — I noticed they're tricky for you.`, to: `/pronunciation?sound=${top.sound}`, action: `Practise ${top.sound.toUpperCase()}` };
      }
      if (f) return { message: f.message, to: f.to, action: f.action };
    }
    if (!stats.totalSessions) {
      return { message: `Hi ${profile.name || 'there'}! I'm Emma, your English coach. Let's start with a short conversation so I can learn how you speak.`, to: '/speak', action: 'Talk to Emma' };
    }
    if (stats.todayMinutes >= stats.goalMinutes) {
      return { message: "You've reached today's goal — amazing work! Extra practice now will make tomorrow even easier.", to: '/speak', action: 'Keep practising' };
    }
    return { message: `You're on a ${stats.streak}-day streak. Let's keep it going with a quick speaking session!`, to: '/speak', action: 'Start speaking' };
  },

  /** A tip Emma mentions at the start of a Free Conversation. */
  getSessionFocusTip(stats) {
    const top = stats.weakAreas?.[0];
    return top ? FOCUS_MESSAGES[top.category]?.tip || null : null;
  },

  /** Adapt difficulty: step up after strong sessions, down after weak ones. */
  recommendDifficulty(sessions, profile) {
    const base = CEFR_TO_DIFFICULTY[profile.level] || 'intermediate';
    const recent = sessions.filter((s) => s.type === 'speaking').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    if (recent.length < 3) return base;
    const avg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    let i = DIFFICULTY_ORDER.indexOf(base);
    if (avg >= 85) i = Math.min(DIFFICULTY_ORDER.length - 1, i + 1);
    if (avg < 55) i = Math.max(0, i - 1);
    return DIFFICULTY_ORDER[i];
  },

  /** Listening level 1-5 from the last listening scores. */
  recommendListeningLevel(sessions, profile) {
    const cefrStart = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 }[profile.level] || 3;
    const last = sessions.filter((s) => s.type === 'listening').sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (!last) return cefrStart;
    const lvl = last.details?.level || cefrStart;
    if (last.score >= 80) return Math.min(5, lvl + 1);
    if (last.score < 50) return Math.max(1, lvl - 1);
    return lvl;
  },
};
