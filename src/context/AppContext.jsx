/**
 * Global learner state: profile, settings, sessions, mistakes, vocabulary, XP.
 * Persistence goes through storageService so a backend can replace localStorage later.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { storageService, createInitialState } from '../services/storageService.js';
import { computeStats, xpForSession } from '../utils/stats.js';
import { achievementProgress } from '../data/achievements.js';
import { buildDemoData } from '../data/demoSeed.js';
import { uid } from '../utils/date.js';
import { useToast } from './ToastContext.jsx';

const AppContext = createContext(null);

const SR_INTERVAL_DAYS = [0, 1, 2, 4, 7, 15, 30];

function mergeMistakes(existing, incoming, extra = {}) {
  const now = new Date().toISOString();
  const list = [...existing];
  incoming.forEach((m) => {
    const key = `${m.category}|${m.said.toLowerCase().trim()}`;
    const i = list.findIndex((x) => `${x.category}|${x.said.toLowerCase().trim()}` === key);
    if (i >= 0) {
      list[i] = { ...list[i], count: (list[i].count || 1) + 1, lastSeen: now, mastered: false };
    } else {
      list.unshift({ id: uid('m'), count: 1, mastered: false, createdAt: now, lastSeen: now, categories: [m.category], reasons: [], ...m, ...extra });
    }
  });
  return list;
}

function applyTheme(theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#020617' : '#4f46e5');
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => storageService.load());
  const toast = useToast();
  const silentAchievements = useRef(false);

  useEffect(() => {
    storageService.save(state);
  }, [state]);

  const stats = useMemo(() => computeStats(state), [state]);

  // Theme (and follow the OS when set to "system").
  useEffect(() => {
    applyTheme(state.settings.theme);
    if (state.settings.theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [state.settings.theme]);

  // Unlock achievements as stats change.
  useEffect(() => {
    const newly = achievementProgress(stats).filter((a) => a.unlocked && !state.achievements[a.id]);
    if (!newly.length) return;
    const now = new Date().toISOString();
    setState((s) => ({ ...s, achievements: { ...s.achievements, ...Object.fromEntries(newly.map((a) => [a.id, now])) } }));
    if (!silentAchievements.current) {
      newly.forEach((a) => toast.show(a.description, { type: 'achievement', title: `Achievement unlocked: ${a.title}`, duration: 5000 }));
    }
    silentAchievements.current = false;
  }, [stats, state.achievements, toast]);

  const completeOnboarding = useCallback((profile, { loadDemo } = {}) => {
    silentAchievements.current = true;
    setState((s) => {
      const next = { ...s, profile: { ...s.profile, ...profile, onboarded: true } };
      if (loadDemo && !s.hasDemoData) {
        const demo = buildDemoData();
        return {
          ...next,
          sessions: [...demo.sessions, ...s.sessions],
          mistakes: [...s.mistakes, ...demo.mistakes],
          vocab: { ...demo.vocab, ...s.vocab },
          xp: s.xp + demo.xp,
          demoXp: demo.xp,
          hasDemoData: true,
        };
      }
      return next;
    });
  }, []);

  const updateProfile = useCallback((patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })), []);
  const updateSettings = useCallback((patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })), []);

  /** Save a finished practice session (and any mistakes found). Returns the new session id. */
  const recordSession = useCallback(({ type, title, durationSec, score, skills = {}, details = {}, mistakes = [] }) => {
    const id = uid('s');
    const xp = xpForSession(score, durationSec);
    const session = { id, type, title, date: new Date().toISOString(), durationSec: Math.max(30, Math.round(durationSec)), score, skills, details, xp };
    setState((s) => ({
      ...s,
      sessions: [session, ...s.sessions],
      mistakes: mistakes.length ? mergeMistakes(s.mistakes, mistakes, { sessionId: id }) : s.mistakes,
      xp: s.xp + xp,
    }));
    return session;
  }, []);

  const addMistakes = useCallback((mistakes) => {
    if (!mistakes.length) return;
    setState((s) => ({ ...s, mistakes: mergeMistakes(s.mistakes, mistakes) }));
  }, []);

  const updateMistake = useCallback((id, patch) => {
    setState((s) => ({ ...s, mistakes: s.mistakes.map((m) => (m.id === id ? { ...m, ...patch } : m)), xp: patch.mastered ? s.xp + 5 : s.xp }));
  }, []);

  const deleteMistake = useCallback((id) => setState((s) => ({ ...s, mistakes: s.mistakes.filter((m) => m.id !== id) })), []);

  const updateWord = useCallback((wordId, patch) => {
    setState((s) => {
      const current = s.vocab[wordId] || { learned: false, favorite: false, box: 0, reviews: 0 };
      const next = { ...current, ...patch };
      if (patch.learned && !current.learned) {
        next.box = Math.max(1, current.box || 0);
        next.due = new Date(Date.now() + SR_INTERVAL_DAYS[next.box] * 86400000).toISOString();
      }
      return { ...s, vocab: { ...s.vocab, [wordId]: next }, xp: patch.learned && !current.learned ? s.xp + 3 : s.xp };
    });
  }, []);

  /** Spaced repetition (Leitner boxes): again → box 1, good → +1, easy → +2. */
  const reviewWord = useCallback((wordId, grade) => {
    setState((s) => {
      const current = s.vocab[wordId] || { learned: true, favorite: false, box: 0, reviews: 0 };
      let box = current.box || 0;
      if (grade === 'again') box = 1;
      if (grade === 'good') box = Math.min(6, box + 1);
      if (grade === 'easy') box = Math.min(6, box + 2);
      const days = grade === 'again' ? 0 : SR_INTERVAL_DAYS[box];
      const due = new Date(Date.now() + days * 86400000 + (grade === 'again' ? 10 * 60000 : 0)).toISOString();
      return {
        ...s,
        vocab: { ...s.vocab, [wordId]: { ...current, learned: true, box, due, reviews: (current.reviews || 0) + 1, lastReviewed: new Date().toISOString() } },
      };
    });
  }, []);

  const loadDemoData = useCallback(() => {
    silentAchievements.current = true;
    setState((s) => {
      if (s.hasDemoData) return s;
      const demo = buildDemoData();
      return { ...s, sessions: [...s.sessions, ...demo.sessions].sort((a, b) => new Date(b.date) - new Date(a.date)), mistakes: [...s.mistakes, ...demo.mistakes], vocab: { ...demo.vocab, ...s.vocab }, xp: s.xp + demo.xp, demoXp: demo.xp, hasDemoData: true };
    });
  }, []);

  const clearDemoData = useCallback(() => {
    setState((s) => ({
      ...s,
      sessions: s.sessions.filter((x) => !x.demo),
      mistakes: s.mistakes.filter((x) => !x.demo),
      vocab: Object.fromEntries(Object.entries(s.vocab).filter(([, v]) => !v.demo)),
      xp: Math.max(0, s.xp - (s.demoXp || 0)),
      demoXp: 0,
      achievements: {},
      hasDemoData: false,
    }));
    silentAchievements.current = true;
  }, []);

  const resetAll = useCallback(() => {
    storageService.clear();
    setState(createInitialState());
  }, []);

  const importState = useCallback((json) => {
    setState(storageService.importData(json));
  }, []);

  const actions = useMemo(
    () => ({ completeOnboarding, updateProfile, updateSettings, recordSession, addMistakes, updateMistake, deleteMistake, updateWord, reviewWord, loadDemoData, clearDemoData, resetAll, importState }),
    [completeOnboarding, updateProfile, updateSettings, recordSession, addMistakes, updateMistake, deleteMistake, updateWord, reviewWord, loadDemoData, clearDemoData, resetAll, importState],
  );

  const value = useMemo(() => ({ state, stats, ...actions }), [state, stats, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
