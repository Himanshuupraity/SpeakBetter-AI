/**
 * aiService — the single entry point the UI uses for anything "AI".
 *
 * Provider is chosen by VITE_AI_PROVIDER in .env.local:
 *   mock (default) → built-in demo logic, works offline
 *   api            → your backend (server/index.js), which holds the real API key
 *
 * If the real backend fails, we fall back to demo logic so practice never stops,
 * and mark the result with `fallback: true` so the UI can tell the learner.
 */
import { mockAiProvider } from './providers/mockAiProvider.js';
import { remoteAiProvider } from './providers/remoteAiProvider.js';

const PROVIDER = (import.meta.env.VITE_AI_PROVIDER || 'mock').toLowerCase();
const primary = PROVIDER === 'api' ? remoteAiProvider : mockAiProvider;

async function call(method, params) {
  try {
    return await primary[method](params);
  } catch (err) {
    if (primary === mockAiProvider) throw err;
    console.warn(`[aiService] ${method} failed, using demo fallback:`, err);
    const result = await mockAiProvider[method](params);
    return { ...result, fallback: true, fallbackReason: err.message };
  }
}

export const aiService = {
  providerName: primary.name,
  isDemo: primary.isDemo,

  /** Emma's next conversational turn. → { text, done? } */
  generateConversation: (params) => call('generateConversation', params),
  /** Full speaking report after a session. */
  analyzeSpeaking: (params) => call('analyzeSpeaking', params),
  /** Writing feedback: scores, corrections, professional rewrite. */
  analyzeWriting: (params) => call('analyzeWriting', params),
  /** Single-word pronunciation estimate. */
  analyzePronunciation: (params) => call('analyzePronunciation', params),
  /** Short teacher comment after a grammar quiz. */
  analyzeGrammar: (params) => call('analyzeGrammar', params),
};
