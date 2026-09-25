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

/** Merge stored data onto defaults so new fields added in later versions get sensible values. */
function migrate(stored) {
  const base = createInitialState();
  if (!stored || typeof stored !== 'object') return base;
  return {
    ...base,
    ...stored,
    version: SCHEMA_VERSION,
    profile: { ...base.profile, ...(stored.profile || {}) },
    settings: { ...base.settings, ...(stored.settings || {}) },
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

  importData(jsonText) {
    return migrate(JSON.parse(jsonText));
  },
};
