/**
 * REAL AI provider — calls YOUR backend, never an AI vendor directly.
 *
 *   Browser  ──►  VITE_API_BASE_URL/ai/<action>  ──►  server/index.js  ──►  Claude / OpenAI / Gemini
 *
 * The API key lives only on the server (server/.env). Each endpoint must return
 * JSON in the same shape as the matching method in mockAiProvider.js.
 */
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TIMEOUT_MS = 30000;

export class AiServiceError extends Error {
  constructor(message, { code = 'ai-error', status } = {}) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function post(action, payload) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new AiServiceError('You appear to be offline.', { code: 'offline' });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/ai/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new AiServiceError(`AI service returned ${res.status}`, { code: 'http', status: res.status });
    return await res.json();
  } catch (err) {
    if (err instanceof AiServiceError) throw err;
    if (err.name === 'AbortError') throw new AiServiceError('The AI service took too long to respond.', { code: 'timeout' });
    throw new AiServiceError('Could not reach the AI service.', { code: 'network' });
  } finally {
    clearTimeout(timer);
  }
}

export const remoteAiProvider = {
  name: 'SpeakBetter AI backend',
  isDemo: false,
  generateConversation: (params) => post('conversation', params),
  analyzeSpeaking: (params) => post('analyze-speaking', params),
  analyzeWriting: (params) => post('analyze-writing', params),
  analyzePronunciation: (params) => post('analyze-pronunciation', params),
  analyzeGrammar: (params) => post('analyze-grammar', params),
};
