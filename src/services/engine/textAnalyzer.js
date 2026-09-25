/**
 * Demo-mode text analysis built on the rule set in grammarRules.js.
 * Output shapes here are the CONTRACT that a real AI backend must also return.
 */
import { RULES, WRITING_RULES, MISTAKE_CATEGORIES } from './grammarRules.js';
import { capitalize, ensurePeriod, splitSentences, words } from '../../utils/text.js';

/**
 * Analyse one sentence.
 * @returns {{ original: string, corrected: string, issues: Array<{ruleId, category, why, practice}> }}
 */
export function analyzeSentence(sentence, { mode = 'speaking' } = {}) {
  const rules = mode === 'writing' ? [...RULES, ...WRITING_RULES] : RULES;
  let current = sentence.trim();
  const issues = [];
  for (const rule of rules) {
    try {
      if (rule.test(current)) {
        const next = rule.fix(current);
        if (next !== current) {
          issues.push({ ruleId: rule.id, category: rule.category, why: rule.why, practice: rule.practice });
          current = next;
        }
      }
    } catch {
      // A broken rule must never break the analysis.
    }
  }
  return { original: sentence.trim(), corrected: current, issues };
}

/** Split text into sentences (speech often has no punctuation, so a turn can be one unit). */
export function analyzeText(text, opts) {
  const sentences = splitSentences(text).map((s) => analyzeSentence(s, opts));
  return {
    sentences,
    issues: sentences.flatMap((s) => s.issues),
    correctedText: sentences.map((s) => (s.issues.length ? s.corrected : s.original)).join(' '),
  };
}

/** Most important categories first — decides which rule is the headline of a mistake card. */
const PRIORITY = ['verb-tense', 'subject-verb', 'verb-form', 'word-order', 'prepositions', 'plural-singular', 'articles', 'adjectives', 'vocabulary', 'sentence', 'spelling', 'punctuation'];
const priority = (cat) => (PRIORITY.includes(cat) ? PRIORITY.indexOf(cat) : PRIORITY.length);

/**
 * Convert sentence analyses into mistake records for the "My Mistakes" log.
 * One record per sentence (with every reason listed) keeps feedback readable.
 */
export function toMistakeRecords(sentences, source) {
  return sentences
    .filter((s) => s.issues.length)
    .map((s) => {
      const primary = [...s.issues].sort((a, b) => priority(a.category) - priority(b.category))[0];
      return {
        source,
        category: primary.category,
        categories: [...new Set(s.issues.map((i) => i.category))],
        said: s.original,
        correct: ensurePeriod(capitalize(s.corrected)),
        why: primary.why,
        reasons: s.issues.map((i) => ({ category: i.category, label: MISTAKE_CATEGORIES[i.category]?.label, why: i.why })),
        practice: primary.practice,
        topic: MISTAKE_CATEGORIES[primary.category]?.topic || null,
      };
    });
}

// ── "Better way to say it" ────────────────────────────────────────────────

const PHRASEBANK = [
  {
    match: /\bi want to improve my english\b/i,
    natural: 'I want to become more fluent in English.',
    professional: "I'm working on improving my English communication skills.",
  },
  {
    match: /\bi am (fine|good|ok|okay)\b/i,
    natural: "I'm doing well, thanks! How about you?",
    professional: "I'm doing well, thank you for asking.",
  },
  {
    match: /\b(i don't know|i do not know)\b/i,
    natural: "I'm not sure, to be honest.",
    professional: "I'm not certain, but I'll find out and get back to you.",
  },
  {
    match: /\b(very|so) tired\b/i,
    natural: "I'm exhausted today.",
    professional: "It's been a demanding day, so I'm a little tired.",
  },
  {
    match: /\b(a lot of|many|much) work\b/i,
    natural: 'I had a lot on my plate today.',
    professional: 'I had a heavy workload today.',
  },
  {
    match: /\bmy job is (testing|tester|qa)\b/i,
    natural: 'I work as a software tester.',
    professional: "I'm a QA engineer responsible for software quality.",
  },
];

const NATURAL_SWAPS = [
  [/\bI am\b/g, "I'm"], [/\bdo not\b/g, "don't"], [/\bdid not\b/g, "didn't"], [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"], [/\bwe are\b/gi, "we're"], [/\bthey are\b/gi, "they're"], [/\bcannot\b/gi, "can't"],
  [/\bvery good\b/gi, 'great'], [/\bvery happy\b/gi, 'really happy'], [/\bvery big\b/gi, 'huge'],
  [/\bvery small\b/gi, 'tiny'], [/\bvery tired\b/gi, 'exhausted'], [/\bvery important\b/gi, 'crucial'],
  [/\bvery bad\b/gi, 'terrible'], [/\bvery difficult\b/gi, 'really tough'], [/\bcompleted\b/gi, 'finished'],
];

const PROFESSIONAL_SWAPS = [
  [/\bI'm\b/g, 'I am'], [/\bdon't\b/gi, 'do not'], [/\bcan't\b/gi, 'cannot'], [/\bwon't\b/gi, 'will not'],
  [/\bbugs\b/gi, 'issues'], [/\bbug\b/gi, 'issue'], [/\bfound\b/gi, 'identified'], [/\bfixed\b/gi, 'resolved'],
  [/\bfix\b/gi, 'resolve'], [/\bchecked\b/gi, 'reviewed'], [/\bcheck\b/gi, 'review'], [/\btell\b/gi, 'inform'],
  [/\bgot\b/gi, 'received'], [/\bneed\b/gi, 'require'], [/\bwant to\b/gi, 'would like to'], [/\bthanks\b/gi, 'thank you'],
  [/\basap\b/gi, 'as soon as possible'], [/\bboss\b/gi, 'manager'], [/\ba lot of\b/gi, 'a significant amount of'],
  [/\bstuff\b/gi, 'items'], [/\bhelp\b/gi, 'support'], [/\bbig\b/gi, 'significant'], [/\bstart\b/gi, 'begin'],
  [/\bvery\s+/gi, ''], [/\breally\s+/gi, ''],
];

function applySwaps(text, swaps) {
  return swaps.reduce((t, [re, rep]) => t.replace(re, rep), text);
}

/** Produce Basic / Natural / Professional versions of a sentence. */
export function betterWays(sentence) {
  const basic = ensurePeriod(capitalize(analyzeSentence(sentence).corrected));
  const bank = PHRASEBANK.find((p) => p.match.test(sentence));
  if (bank) return { original: sentence, basic, natural: bank.natural, professional: bank.professional };
  const natural = ensurePeriod(capitalize(applySwaps(basic, NATURAL_SWAPS)));
  const professional = ensurePeriod(capitalize(applySwaps(basic, PROFESSIONAL_SWAPS)));
  if (natural === basic && professional === basic) return null;
  return { original: sentence, basic, natural, professional };
}

// ── Vocabulary signals ───────────────────────────────────────────────────

const ADVANCED_WORDS = new Set(
  (
    'actually although however therefore moreover furthermore currently recently responsible opportunity experience ' +
    'efficient effective challenging collaborate collaboration communicate communication improve improvement ' +
    'confident confidence achieve achievement productive schedule deadline priority prioritize significant ' +
    'especially definitely probably usually generally particular particularly suggest recommend appreciate ' +
    'environment requirement requirements solution solutions approach analyze analyse identify identified ' +
    'deliver delivered issue issues resolve resolved stakeholder stakeholders automation strategy perspective ' +
    'fortunately unfortunately eventually basically honestly interesting fascinating exhausting delighted ' +
    'grateful comfortable independent professional knowledge skills skill develop development quality'
  ).split(' '),
);

const CONNECTORS = /\b(because|so|but|although|however|actually|also|then|after that|while|when|since|therefore|besides|for example)\b/gi;
const CONTRACTIONS = /\b\w+'(m|re|s|ve|ll|d|t)\b/gi;
const FILLERS = /\b(um+|uh+|erm|hmm+|you know|like,)\b/gi;

export function vocabularySignals(text) {
  const w = words(text);
  const unique = new Set(w);
  const advanced = [...unique].filter((x) => ADVANCED_WORDS.has(x) || x.length >= 9);
  return {
    totalWords: w.length,
    uniqueWords: unique.size,
    advancedWords: advanced,
    connectors: (text.match(CONNECTORS) || []).length,
    contractions: (text.match(CONTRACTIONS) || []).length,
    fillers: (text.match(FILLERS) || []).length,
  };
}
