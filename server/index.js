/**
 * SpeakBetter AI — optional backend that connects the app to Claude.
 *
 *   Browser ──► POST /api/ai/<action> ──► this server ──► Anthropic API
 *
 * The API key is read from server/.env (ANTHROPIC_API_KEY) and NEVER sent to
 * the browser. Each endpoint returns the same JSON shape as the matching
 * method in src/services/providers/mockAiProvider.js, so the UI doesn't change.
 *
 * Run:  cd server && npm install && cp .env.example .env  (add your key)  && npm start
 * Then: set VITE_AI_PROVIDER=api in the project's .env.local and run `npm run dev`.
 */
import http from 'node:http';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
// Pure scoring code shared with the frontend (no browser APIs inside).
import { scoreSpeaking, SCORE_COMPONENTS } from '../src/services/engine/scoring.js';
import { mockAiProvider } from '../src/services/providers/mockAiProvider.js';

const PORT = Number(process.env.PORT || 8787);
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim());
const MAX_BODY_BYTES = 200_000;

if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
  console.warn('[server] ANTHROPIC_API_KEY is not set — add it to server/.env. Requests will fail until then.');
}

const client = new Anthropic();

// Server-side refusal fallback: if the model declines, the API re-runs the request
// on Anthropic's recommended fallback model inside the same call.
const FALLBACK = { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' };

const TEACHER = `You are Emma, a warm, encouraging English coach for adult beginner-to-intermediate learners (many are Indian IT professionals).
Use simple, clear English. Never mock the learner.`;

const CATEGORY_IDS = ['verb-tense', 'verb-form', 'subject-verb', 'articles', 'prepositions', 'plural-singular', 'word-order', 'adjectives', 'vocabulary', 'sentence', 'spelling', 'punctuation', 'pronouns', 'adverbs', 'modals', 'passive', 'reported-speech', 'conditionals'];
const CATEGORY_TOPIC = { 'verb-tense': 'tenses', 'verb-form': 'verbs', 'subject-verb': 'subject-verb-agreement', articles: 'articles', prepositions: 'prepositions', 'plural-singular': 'subject-verb-agreement', 'word-order': 'question-formation', adjectives: 'adjectives', sentence: 'conjunctions', pronouns: 'pronouns', adverbs: 'adverbs', modals: 'modals', passive: 'active-passive', 'reported-speech': 'direct-indirect', conditionals: 'conditionals' };

const Mistake = z.object({
  category: z.enum(CATEGORY_IDS),
  said: z.string().describe('The learner’s original sentence, exactly as written/spoken'),
  correct: z.string().describe('Corrected sentence'),
  why: z.string().describe('One or two simple sentences explaining the rule'),
  practiceQuestion: z.string().describe('A short fill-in-the-blank practice question using ___'),
  practiceAnswer: z.string(),
});

const toMistake = (m, source) => ({
  source,
  category: m.category,
  categories: [m.category],
  said: m.said,
  correct: m.correct,
  why: m.why,
  reasons: [],
  practice: { question: m.practiceQuestion, answer: m.practiceAnswer },
  topic: CATEGORY_TOPIC[m.category] || null,
});

function refusalGuard(response) {
  if (response.stop_reason === 'refusal') {
    const err = new Error('The model declined this request.');
    err.status = 502;
    throw err;
  }
}

// ── Handlers ────────────────────────────────────────────────────────────────

async function conversation({ mode, difficulty, personality, history = [], focusTip }) {
  const system = `${TEACHER}
You are having a spoken conversation. Topic/scenario: "${mode}". Learner level: ${difficulty}. Your personality: ${personality}.
Rules: reply in 1-3 short sentences, react naturally to what they said, then ask ONE follow-up question.
Do NOT correct mistakes during the conversation — they are reviewed afterwards.
${focusTip ? `In your first message, gently mention: ${focusTip}` : ''}`;
  const messages = history.length
    ? history.map((h) => ({ role: h.role === 'ai' ? 'assistant' : 'user', content: h.text }))
    : [{ role: 'user', content: '(The learner just opened the session. Greet them and start the conversation.)' }];
  if (messages[0].role === 'assistant') messages.unshift({ role: 'user', content: '(Session started.)' });

  const response = await client.beta.messages.create({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: 'low' }, // fast replies keep the conversation natural
    system,
    messages,
  });
  refusalGuard(response);
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join(' ').trim();
  return { text };
}

const SpeakingAnalysis = z.object({
  grammar: z.number().int().min(0).max(20),
  vocabulary: z.number().int().min(0).max(20),
  sentence: z.number().int().min(0).max(10),
  naturalness: z.number().int().min(0).max(10),
  mistakes: z.array(Mistake),
  betterWays: z.array(z.object({ original: z.string(), basic: z.string(), natural: z.string(), professional: z.string() })),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  summary: z.string().describe('Two sentences from Emma to the learner'),
});

async function analyzeSpeaking({ turns = [] }) {
  const transcript = turns.map((t, i) => `${i + 1}. ${t.text}`).join('\n');
  const response = await client.beta.messages.parse({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'medium', format: zodOutputFormat(SpeakingAnalysis) },
    system: `${TEACHER}
Analyse the learner's side of a spoken conversation (speech-to-text transcript: ignore missing punctuation and capitalisation).
Score grammar (0-20), vocabulary (0-20), sentence formation (0-10) and naturalness (0-10).
List every real mistake (one entry per sentence), give up to 3 "better way to say it" rewrites (basic / natural / professional), 2-3 strengths and 2-3 improvements.`,
    messages: [{ role: 'user', content: `Learner's replies:\n${transcript}` }],
  });
  refusalGuard(response);
  const ai = response.parsed_output;
  if (!ai) throw Object.assign(new Error('Could not parse analysis'), { status: 502 });

  // Pronunciation & fluency come from the speech signal (or a speech-assessment API), not the LLM.
  const heuristic = scoreSpeaking({ turns, issues: [] });
  const breakdown = { ...heuristic.breakdown, grammar: ai.grammar, vocabulary: ai.vocabulary, sentence: ai.sentence, naturalness: ai.naturalness };
  const earned = Object.values(breakdown).filter((v) => v != null).reduce((a, b) => a + b, 0);
  const possible = SCORE_COMPONENTS.filter((c) => breakdown[c.id] != null).reduce((a, c) => a + c.max, 0);
  const mistakes = ai.mistakes.map((m) => toMistake(m, 'speaking'));
  return {
    ...heuristic,
    overall: Math.round((earned / possible) * 100),
    breakdown,
    percentages: Object.fromEntries(SCORE_COMPONENTS.map((c) => [c.id, breakdown[c.id] == null ? null : Math.round((breakdown[c.id] / c.max) * 100)])),
    mistakes,
    categoryCounts: mistakes.reduce((acc, m) => ({ ...acc, [m.category]: (acc[m.category] || 0) + 1 }), {}),
    betterWays: ai.betterWays.slice(0, 3),
    strengths: ai.strengths,
    improvements: ai.improvements,
    summary: ai.summary,
    demo: false,
  };
}

const WritingAnalysis = z.object({
  scores: z.object({
    grammar: z.number().int().min(0).max(100),
    spelling: z.number().int().min(0).max(100),
    structure: z.number().int().min(0).max(100),
    vocabulary: z.number().int().min(0).max(100),
    tone: z.number().int().min(0).max(100),
    clarity: z.number().int().min(0).max(100),
    professionalism: z.number().int().min(0).max(100),
  }),
  correctedText: z.string(),
  professionalVersion: z.string(),
  mistakes: z.array(Mistake),
  tips: z.array(z.string()),
});

async function analyzeWriting({ text = '', type = {} }) {
  const response = await client.beta.messages.parse({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'medium', format: zodOutputFormat(WritingAnalysis) },
    system: `${TEACHER}
Review a piece of writing of type "${type.label || 'general'}"${type.professional ? ' (it should sound professional)' : ''}.
Score each dimension 0-100. Give the corrected text (minimal changes), a more professional version, every mistake (one per sentence), and 2-4 practical tips.`,
    messages: [{ role: 'user', content: text }],
  });
  refusalGuard(response);
  const ai = response.parsed_output;
  if (!ai) throw Object.assign(new Error('Could not parse analysis'), { status: 502 });
  const words = (text.match(/\S+/g) || []).length;
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean).length;
  const values = Object.values(ai.scores);
  return {
    overall: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    scores: ai.scores,
    correctedText: ai.correctedText,
    professionalVersion: ai.professionalVersion,
    mistakes: ai.mistakes.map((m) => toMistake(m, 'writing')),
    tips: ai.tips,
    stats: { words, sentences, avgSentenceLength: Math.round(words / Math.max(1, sentences)) },
    demo: false,
  };
}

async function analyzeGrammar({ topicTitle, results = [] }) {
  const correct = results.filter((r) => r.correct).length;
  const score = Math.round((correct / Math.max(1, results.length)) * 100);
  const wrong = results.filter((r) => !r.correct).map((r) => `- ${r.prompt} (chose "${r.selectedText}", correct "${r.correctText}")`).join('\n');
  const response = await client.beta.messages.create({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: 'low' },
    system: `${TEACHER} Write ONE or TWO encouraging sentences of feedback after a grammar quiz. Mention the pattern behind the mistakes if there is one.`,
    messages: [{ role: 'user', content: `Topic: ${topicTitle}. Score: ${score}%.\nWrong answers:\n${wrong || 'none'}` }],
  });
  refusalGuard(response);
  return { score, comment: response.content.filter((b) => b.type === 'text').map((b) => b.text).join(' ').trim(), demo: false };
}

// Pronunciation needs audio analysis, which an LLM text API can't do. Plug a
// speech-assessment service in here; until then, reuse the recogniser estimate.
const analyzePronunciation = (params) => mockAiProvider.analyzePronunciation(params);

const ROUTES = {
  conversation,
  'analyze-speaking': analyzeSpeaking,
  'analyze-writing': analyzeWriting,
  'analyze-grammar': analyzeGrammar,
  'analyze-pronunciation': analyzePronunciation,
};

// ── HTTP plumbing ───────────────────────────────────────────────────────────

function send(res, status, body, origin) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request too large'), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}'));
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true, model: MODEL }, origin);

  const match = req.url?.match(/^\/api\/ai\/([a-z-]+)$/);
  const handler = match && ROUTES[match[1]];
  if (req.method !== 'POST' || !handler) return send(res, 404, { error: 'Not found' }, origin);

  try {
    const body = await readJson(req);
    const result = await handler(body);
    send(res, 200, result, origin);
  } catch (err) {
    const status = err instanceof Anthropic.APIError ? 502 : err.status || 500;
    if (err instanceof Anthropic.AuthenticationError) console.error('[server] Invalid ANTHROPIC_API_KEY');
    else if (err instanceof Anthropic.RateLimitError) console.error('[server] Rate limited by the Anthropic API');
    else console.error(`[server] ${match[1]} failed:`, err.message);
    // The frontend falls back to demo logic on any non-2xx response.
    send(res, status, { error: 'AI request failed' }, origin);
  }
});

server.listen(PORT, () => console.log(`[server] SpeakBetter AI backend on http://localhost:${PORT} (model: ${MODEL})`));
