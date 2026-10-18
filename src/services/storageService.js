/**
 * Storage service — the ONLY module that knows where app data lives.
 *
 * Today it persists to localStorage. To move to a real backend/database later,
 * keep this interface (load / save / clear / exportData / importData) and
 * replace the bodies with API calls (e.g. GET/PUT /api/user-state). Nothing
 * else in the app touches localStorage directly (except the theme pre-paint
 * script in index.html).
 */
const STORAGE_KEY = 'speakbetter:v1';
export const SCHEMA_VERSION = 1;

export function createInitialState() {
  return {
    version: SCHEMA_VERSION,
    profile: {
      name: '',
      level: 'B1',
      goal: 'speaking',
      dailyMinutes: 25,
      onboarded: false,
      createdAt: new Date().toISOString(),
      levelTest: null,
    },
    settings: {
      theme: 'system',
      voiceURI: null,
      speechRate: 1,
      personality: 'friendly',
      difficulty: null, // null = follow profile level
      autoSpeak: true,
      autoListen: false,
    },
    sessions: [],
    mistakes: [],
    vocab: {},
    xp: 0,
    achievements: {},
    hasDemoData: false,
  };
}

function isStorageAvailable() {
  try {
    const k = '__sb_test__';
    window.localStorage.setItem(k, k);
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const available = typeof window !== 'undefined' && isStorageAvailable();

const isPlainObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);

/** Keys that identify a SpeakBetter backup/state object. */
const KNOWN_KEYS = ['profile', 'settings', 'sessions', 'mistakes', 'vocab', 'xp', 'achievements'];

/**
 * Merge stored data onto defaults so new fields added in later versions get sensible values.
 * Collections with the wrong type (e.g. corrupted or hand-edited data) fall back to defaults,
 * and malformed entries inside them are dropped, so bad data can never crash the app.
 */
function migrate(stored) {
  const base = createInitialState();
  if (!isPlainObject(stored)) return base;
  const sessions = Array.isArray(stored.sessions)
    ? stored.sessions.filter((x) => isPlainObject(x) && typeof x.date === 'string' && !Number.isNaN(new Date(x.date).getTime())).map((x) => ({ ...x, durationSec: isFiniteNumber(x.durationSec) ? x.durationSec : 0, skills: isPlainObject(x.skills) ? x.skills : {} }))
    : base.sessions;
  const mistakes = Array.isArray(stored.mistakes)
    ? stored.mistakes.filter((x) => isPlainObject(x)).map((x) => ({ ...x, said: typeof x.said === 'string' ? x.said : String(x.said ?? '') }))
    : base.mistakes;
  const vocab = isPlainObject(stored.vocab) ? Object.fromEntries(Object.entries(stored.vocab).filter(([, v]) => isPlainObject(v))) : base.vocab;
  const achievements = isPlainObject(stored.achievements) ? stored.achievements : base.achievements;
  const profile = { ...base.profile, ...(isPlainObject(stored.profile) ? stored.profile : {}) };
  if (!isFiniteNumber(profile.dailyMinutes) || profile.dailyMinutes <= 0) profile.dailyMinutes = base.profile.dailyMinutes;
  return {
    ...base,
    ...stored,
    version: SCHEMA_VERSION,
    profile,
    settings: { ...base.settings, ...(isPlainObject(stored.settings) ? stored.settings : {}) },
    sessions,
    mistakes,
    vocab,
    achievements,
    xp: isFiniteNumber(stored.xp) ? Math.max(0, stored.xp) : base.xp,
    demoXp: isFiniteNumber(stored.demoXp) ? stored.demoXp : 0,
    hasDemoData: Boolean(stored.hasDemoData),
  };
}

export const storageService = {
  isPersistent: available,

  load() {
    if (!available) return createInitialState();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return migrate(raw ? JSON.parse(raw) : null);
    } catch {
      return createInitialState();
    }
  },

  save(state) {
    if (!available) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      // Quota exceeded or storage blocked — the app keeps working in memory.
      return false;
    }
  },

  clear() {
    if (!available) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },

  exportData(state) {
    return new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  },

  /** Parses a backup file. Throws an Error with a readable message if it isn't a SpeakBetter backup. */
  importData(jsonText) {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('This file is not valid JSON.');
    }
    if (!isPlainObject(parsed) || !KNOWN_KEYS.some((k) => k in parsed)) {
      throw new Error('This file is not a SpeakBetter backup.');
    }
    if (parsed.version != null && !(isFiniteNumber(parsed.version) && parsed.version <= SCHEMA_VERSION)) {
      throw new Error('This backup was made by a newer version of SpeakBetter. Please update the app and try again.');
    }
    return migrate(parsed);
  },
};
