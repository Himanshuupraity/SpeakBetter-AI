/**
 * Rule-based English checker used by DEMO MODE.
 *
 * It catches the most common learner mistakes (tense, articles, prepositions,
 * subject-verb agreement, common Indian-English expressions, …) so the demo
 * gives real feedback on what you actually say or write. A real AI backend
 * (see services/providers/remoteAiProvider.js) replaces this with far more
 * complete analysis — the output shape stays the same.
 *
 * Each rule: { id, category, test(sentence) -> bool, fix(sentence) -> sentence, why, practice }
 */
import {
  BASE_VERBS,
  IRREGULAR_PAST,
  PARTICIPLE_TO_PAST,
  PAST_TO_BASE,
  PAST_TO_PARTICIPLE,
  baseOf,
  isPastForm,
  pastOf,
  thirdPerson,
} from './verbs.js';

export const MISTAKE_CATEGORIES = {
  'verb-tense': { label: 'Verb tense', topic: 'tenses' },
  'verb-form': { label: 'Verb form', topic: 'verbs' },
  'subject-verb': { label: 'Subject-verb agreement', topic: 'subject-verb-agreement' },
  articles: { label: 'Articles', topic: 'articles' },
  prepositions: { label: 'Prepositions', topic: 'prepositions' },
  'plural-singular': { label: 'Plural / singular', topic: 'subject-verb-agreement' },
  'word-order': { label: 'Word order', topic: 'question-formation' },
  adjectives: { label: 'Adjectives & comparison', topic: 'adjectives' },
  vocabulary: { label: 'Word choice', topic: null },
  sentence: { label: 'Sentence formation', topic: 'conjunctions' },
  pronouns: { label: 'Pronouns', topic: 'pronouns' },
  adverbs: { label: 'Adverbs', topic: 'adverbs' },
  modals: { label: 'Modals', topic: 'modals' },
  passive: { label: 'Active / passive voice', topic: 'active-passive' },
  'reported-speech': { label: 'Reported speech', topic: 'direct-indirect' },
  conditionals: { label: 'Conditionals', topic: 'conditionals' },
  spelling: { label: 'Spelling', topic: null },
  punctuation: { label: 'Punctuation & capitals', topic: null },
  pronunciation: { label: 'Pronunciation', topic: null },
  pace: { label: 'Speaking pace', topic: null },
  hindi: { label: 'Hindi', topic: null },
};

export function categoryLabel(id) {
  return MISTAKE_CATEGORIES[id]?.label || id;
}

const PAST_MARKER = /\b(yesterday|last\s+(night|week|month|year|weekend|time|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\w+\s+(days?|weeks?|months?|years?|hours?)\s+ago|ago)\b/i;
const SOFT_PAST_MARKER = /\b(today|this\s+morning|this\s+week|earlier)\b/i;
// "since last week", "for the past two years" — a starting point / unfinished period, which goes WITH the present perfect.
const UNFINISHED_PERIOD = /\bsince\s+(?:yesterday|last\s+\w+|\w+\s+\w+\s+ago)\b|\b(?:for|in|over|during|within)\s+the\s+(?:last|past)\s+(?:\w+\s+)?\w+\b/gi;
// Talking about now ("…and now I work at Infosys") — verbs after this are present, not past.
const PRESENT_MARKER = /\b(now|currently|nowadays|these\s+days|at\s+present|at\s+the\s+moment|still|every\s+day|usually)\b/i;

/** "in 2019" is past, "in 2030" is not. */
function mentionsPastYear(sentence) {
  return [...sentence.matchAll(/\bin\s+((?:19|20)\d\d)\b/gi)].some((m) => Number(m[1]) < new Date().getFullYear());
}

/** Is the sentence clearly about the past? "today" counts only if another past verb is present. */
function isPastContext(sentence) {
  const s = sentence.replace(UNFINISHED_PERIOD, ' ');
  if (PAST_MARKER.test(s) || mentionsPastYear(s)) return true;
  if (SOFT_PAST_MARKER.test(s)) {
    return (s.match(/[a-z']+/gi) || []).some((w) => isPastForm(w) && !['read', 'put', 'cut', 'let', 'hit'].includes(w.toLowerCase()));
  }
  return false;
}

function keepCase(original, replacement) {
  if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Optional def.skip(match, ...groups, offset, string) -> true leaves that match alone
 * (for checks a regex can't express, e.g. "is the next word a noun?").
 */
function regexRule(def) {
  const accept = (args) => !def.skip || !def.skip(...args);
  const all = new RegExp(def.pattern.source, def.pattern.flags.includes('g') ? def.pattern.flags : `${def.pattern.flags}g`);
  return {
    ...def,
    test: (s) => {
      if (!def.skip) {
        def.pattern.lastIndex = 0;
        return def.pattern.test(s);
      }
      return [...s.matchAll(all)].some((m) => accept([...m, m.index, s]));
    },
    fix: (s) => s.replace(def.pattern, (...args) => {
      const match = args[0];
      if (!accept(args)) return match;
      const out = typeof def.replace === 'function' ? def.replace(...args) : match.replace(new RegExp(def.pattern.source, 'i'), def.replace);
      return keepCase(match, out);
    }),
  };
}

/** Does this word look like a plural noun that the previous noun is describing ("project MANAGERS")? */
function isPluralHead(word) {
  return /^[a-z]+s$/.test(word) && !/(ss|us|is)$/.test(word) && !NOT_A_HEAD_NOUN.has(word);
}

/** Next word after a match (lowercased), or '' at the end of the sentence. */
function nextWord(str, end) {
  return (str.slice(end).match(/^[\s-]+([a-z']+)/i)?.[1] || '').toLowerCase();
}

// Words that can follow a noun without making it a compound ("one of my friend IS…").
const NOT_A_HEAD_NOUN = new Set(['is', 'was', 'has', 'does', 'as', 'us', 'this', 'always', 'across', 'plus', 'unless', 'thus', 'yes', 'perhaps', 'sometimes']);

const OFFICE_COMPOUND = /^[\s-]+(?:supplies|space|work|hours|building|chair|desk|party|politics|staff|equipment|furniture|job|admin|manager|boy|timings?|premises|culture|bearer)\b/i;

const SUBJECT = '(I|we|they|you|he|she|it|my\\s+(?:manager|friend|boss|team|colleague|brother|sister|mother|father|wife|husband|lead)|the\\s+team|everyone)';
const ADVERB = '(?:(?:also|just|then|really|finally|again|first|only|actually)\\s+)?';

const DURATION = '(?:\\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|many|several|few|a\\s+few)\\s+(?:years?|months?|weeks?|days?|hours?|minutes?)';

// "since it is late" means "because" — not a starting point in time.
const SINCE_BECAUSE = "(?:it|he|she|they|we|you|i|there|my|our|his|her|their|your|a|an|everyone|nobody|someone|this\\s+is|that\\s+is)\\b";
const TRIP_VERBS = new Set(['going', 'coming', 'leaving', 'travelling', 'traveling', 'flying', 'heading', 'visiting', 'moving', 'returning', 'staying']);

const PAST_SUBJECT_BE = { i: 'was', he: 'was', she: 'was', it: 'was', we: 'were', they: 'were', you: 'were' };
const HAVE_BEEN = { 'i am': 'I have been', "i'm": "I've been", 'we are': 'we have been', "we're": "we've been", 'they are': 'they have been', "they're": "they've been", 'you are': 'you have been', "you're": "you've been", 'he is': 'he has been', "he's": "he's been", 'she is': 'she has been', "she's": "she's been" };

export const RULES = [
  regexRule({
    id: 'myself-intro',
    category: 'vocabulary',
    pattern: /^myself\s+(?!(?:and|or|too|also|alone|included|am|was|have|had|will)\b)([A-Za-z]+)/i, // not "Myself and my team…"
    replace: (_m, name) => `I'm ${name.charAt(0).toUpperCase()}${name.slice(1)}`,
    why: 'To introduce yourself, say "I\'m …" or "My name is …". "Myself …" is not used this way in natural English.',
    practice: { question: 'Introduce yourself: "___ Priya, and I work in QA."', answer: "I'm" },
  }),
  regexRule({
    id: 'go-office',
    category: 'articles',
    pattern: /\b(go|goes|went|going|come|comes|came|coming|return|returned|get|got)\s+(?:to\s+)?office\b/gi,
    // "get office supplies" — here "office" describes another noun.
    skip: (m, _verb, offset, str) => OFFICE_COMPOUND.test(str.slice(offset + m.length)),
    replace: (_m, verb) => `${verb} to the office`,
    why: 'We say "go to the office" — "go" needs "to", and "office" needs the article "the" because it is a specific place.',
    practice: { question: 'I ___ office at 9 a.m. every day.', answer: 'go to the' },
  }),
  regexRule({
    id: 'reach-office',
    category: 'articles',
    pattern: /\b(reach|reached|reaches|reaching|leave|left|leaves|leaving)\s+(?:to\s+)?office\b/gi,
    replace: (_m, verb) => `${verb} the office`,
    why: '"Reach" and "leave" do not take "to", but "office" still needs "the": "I reached the office."',
    practice: { question: 'I reached ___ office late today.', answer: 'the' },
  }),
  regexRule({
    id: 'at-office',
    category: 'articles',
    pattern: /\b(at|in|from|to)\s+office\b/gi,
    replace: (_m, prep) => `${prep} the office`,
    why: 'Use "the" before "office" when you mean your workplace: "at the office", "from the office".',
    practice: { question: 'She is still ___ office.', answer: 'at the' },
  }),
  regexRule({
    id: 'to-home',
    category: 'prepositions',
    pattern: /\b(go|goes|went|going|come|comes|came|coming|reach|reached|get|got|return|returned)\s+to\s+home\b(?![\s-]+(?:page|screen|tab|button|loan|town|country|base|ground|office|team|delivery|care|decor|appliances|minister|ministry|run|feed)\b)(?!['’]s)/gi,
    replace: (_m, verb) => `${verb} home`,
    why: '"Home" works like an adverb after movement verbs, so we say "go home", not "go to home".',
    practice: { question: 'After work, I went ___.', answer: 'home' },
  }),
  {
    id: 'perfect-with-past-time',
    category: 'verb-tense',
    why: 'When you say WHEN something happened (yesterday, last week, today with other past events), use the simple past, not the present perfect.',
    practice: { question: 'I ___ (finish) the report yesterday.', answer: 'finished' },
    _re: /\b(I|we|they|you|he|she)\s+(have|has|'ve|'s)\s+([a-z]+)\b/gi,
    test(s) {
      if (!isPastContext(s)) return false;
      this._re.lastIndex = 0;
      let m;
      while ((m = this._re.exec(s))) {
        const w = m[3].toLowerCase();
        if (PARTICIPLE_TO_PAST[w] || PAST_TO_BASE[w]) return true;
      }
      return false;
    },
    fix(s) {
      return s.replace(this._re, (full, subj, _aux, part) => {
        const w = part.toLowerCase();
        const past = PARTICIPLE_TO_PAST[w] || (PAST_TO_BASE[w] ? w : null);
        return past ? `${subj} ${past}` : full;
      });
    },
  },
  {
    id: 'past-tense',
    category: 'verb-tense',
    why: 'You are talking about something that already happened, so use the past tense (e.g. "go" → "went", "complete" → "completed").',
    practice: { question: 'Yesterday I ___ (meet) my manager.', answer: 'met' },
    _re: new RegExp(`(?<!\\b(?:did|didn't|do|does|don't|will|would|can|could|should|to|not|never|thank|let)\\s+)\\b${SUBJECT}\\s+${ADVERB}([a-z]+)\\b`, 'gi'),
    /** Only the part before "now / currently / these days…" is about the past. */
    _pastPart(s) {
      const at = s.search(PRESENT_MARKER);
      return at === -1 ? s : s.slice(0, at);
    },
    test(s) {
      if (!isPastContext(s)) return false;
      const part = this._pastPart(s);
      this._re.lastIndex = 0;
      let m;
      while ((m = this._re.exec(part))) {
        const word = m[2].toLowerCase();
        if (['am', 'is', 'are'].includes(word) || baseOf(word)) return true;
      }
      return false;
    },
    fix(s) {
      const part = this._pastPart(s);
      return part.replace(this._re, (full, subj, verb) => {
        const lower = verb.toLowerCase();
        if (['am', 'is', 'are'].includes(lower)) {
          return full.replace(new RegExp(`\\b${verb}\\b`), PAST_SUBJECT_BE[subj.toLowerCase()] || (/^(we|they|you)$/i.test(subj) ? 'were' : 'was'));
        }
        const base = baseOf(lower);
        if (!base) return full;
        return full.replace(new RegExp(`\\b${verb}\\b`), pastOf(base));
      }) + s.slice(part.length);
    },
  },
  regexRule({
    id: 'did-past',
    category: 'verb-form',
    pattern: /\b(did|didn't|did\s+not|does|doesn't|does\s+not|do|don't|do\s+not)\s+([a-z]+)\b/gi,
    replace: (m, aux, verb) => {
      const base = PAST_TO_BASE[verb.toLowerCase()];
      return base && !BASE_VERBS.has(verb.toLowerCase()) ? `${aux} ${base}` : m;
    },
    why: 'After "did / didn\'t / does / do", always use the base form of the verb: "I didn\'t go", not "I didn\'t went".',
    practice: { question: "I didn't ___ (see) the email.", answer: 'see' },
  }),
  regexRule({
    id: 'have-past',
    category: 'verb-form',
    pattern: /\b(have|has|had|'ve)\s+(went|came|saw|ate|took|wrote|spoke|began|drove|gave|knew|broke|chose|forgot)\b/gi,
    replace: (_m, aux, verb) => `${aux} ${PAST_TO_PARTICIPLE[verb.toLowerCase()]}`,
    why: 'After "have / has / had", use the past participle: "I have gone", "she has written" — not the simple past.',
    practice: { question: 'Have you ___ (see) the new update?', answer: 'seen' },
  }),
  regexRule({
    id: 'from-duration',
    category: 'prepositions',
    pattern: new RegExp(`\\b(?:from|since)\\s+(${DURATION})\\b(?!\\s+(?:to|till|until|onwards?|ago|back|old|later|before|after|earlier)\\b)`, 'gi'), // not "from one day to another"
    replace: (_m, dur) => `for ${dur}`,
    why: 'Use "for" with a length of time (for 2 years). Use "since" only with a starting point (since 2022, since Monday).',
    practice: { question: 'I have lived here ___ five years.', answer: 'for' },
  }),
  regexRule({
    id: 'perfect-continuous',
    category: 'verb-tense',
    pattern: new RegExp(`\\b(I am|I'm|we are|we're|they are|they're|you are|you're|he is|he's|she is|she's)\\s+([a-z]+ing)\\b(?=.*\\b(?:for\\s+${DURATION}|since\\s+(?!${SINCE_BECAUSE})\\w+))`, 'gi'),
    // "I'm going to Goa for two days" is a plan, not an action that started in the past.
    skip: (_m, _subj, verb, offset, str) => TRIP_VERBS.has(verb.toLowerCase()) && !new RegExp(`\\bsince\\s+(?!${SINCE_BECAUSE})\\w+`, 'i').test(str.slice(offset)),
    replace: (_m, subj, verb) => `${HAVE_BEEN[subj.toLowerCase()]} ${verb}`,
    why: 'For an action that started in the past and is still continuing, use the present perfect continuous: "I have been working here for 2 years."',
    practice: { question: 'She ___ (work) here since 2021.', answer: 'has been working' },
  }),
  regexRule({
    id: 'third-person-s',
    category: 'subject-verb',
    pattern: /(?<!\b(?:did|does|do|didn['’]t|doesn['’]t|don['’]t|has|have|had|hasn['’]t|haven['’]t|hadn['’]t|will|won['’]t|would|wouldn['’]t|can|can['’]t|cannot|could|couldn['’]t|should|shouldn['’]t|shall|may|might|must|mustn['’]t|to|let|make|makes|made|help|helps|watch|see|saw|hear|heard)\s+)\b(he|she|it|my\s+(?:manager|friend|boss|team|brother|sister|father|mother|colleague|wife|husband|son|daughter)|everyone|everybody|someone|somebody|nobody)\s+(always\s+|usually\s+|often\s+|never\s+|sometimes\s+|also\s+|really\s+)?(go|do|have|work|like|want|need|make|take|come|say|know|live|play|watch|study|teach|get|try|use|think|help|write|speak|eat|drink|leave|call|check|test|manage|handle|lead|love|enjoy|travel|start|finish)\b/gi,
    replace: (_m, subj, adv, verb) => `${subj} ${adv || ''}${thirdPerson(verb.toLowerCase())}`,
    why: 'For he / she / it (and one person or thing) in the present simple, add -s or -es to the verb: "he goes", "she works", "it has".',
    practice: { question: 'She ___ (go) to work every morning.', answer: 'goes' },
  }),
  regexRule({
    id: 'many-uncountable',
    category: 'plural-singular',
    pattern: /\bmany\s+(work|information|advice|furniture|equipment|homework|feedback|knowledge|luggage|baggage|money|traffic|research|stuff|software)\b/gi,
    // "many software engineers", "many research papers" — the noun describes a plural noun.
    skip: (m, _noun, offset, str) => isPluralHead(nextWord(str, offset + m.length)),
    replace: (_m, noun) => `a lot of ${noun}`,
    why: 'This noun is uncountable, so we don\'t use "many" with it. Use "a lot of" or "much" instead: "a lot of work".',
    practice: { question: 'I have ___ work today. (many / a lot of)', answer: 'a lot of' },
  }),
  regexRule({
    id: 'uncountable-plural',
    category: 'plural-singular',
    // "researches" / "stuffs" are also verbs ("she researches…"), so only after a determiner.
    pattern: /\b(informations|advices|furnitures|equipments|homeworks|feedbacks|knowledges|luggages|softwares)\b|(?<=\b(?:the|some|any|my|your|our|his|her|their|these|those|many|several|all|of|more|few)\s+)(researches|stuffs)\b/gi,
    replace: (m) => (/researches$/i.test(m) ? m.slice(0, -2) : m.slice(0, -1)),
    why: 'This noun is uncountable in English, so it has no plural "-s": "information", "feedback", "software".',
    practice: { question: 'Thanks for your ___ (feedback / feedbacks).', answer: 'feedback' },
  }),
  regexRule({
    id: 'discuss-about',
    category: 'prepositions',
    pattern: /\b(discuss|discussed|discusses|discussing)\s+about\b/gi,
    replace: (_m, v) => v,
    why: '"Discuss" already means "talk about", so don\'t add "about": "Let\'s discuss the plan."',
    practice: { question: 'We need to ___ the release date.', answer: 'discuss' },
  }),
  regexRule({
    id: 'explain-me',
    category: 'prepositions',
    // Not "explain them to me" (them = the things), or "explained her decision" (her = possessive).
    pattern: /\b(explain|explained|explains|explaining)\s+(?:(me|him|us)\b(?!\s+to\b)|(her|them)\b(?=\s*$|\s*[.,!?]|\s+(?:how|what|why|when|where|who|which|that|the|a|an|it|this|these|those|everything|something|about)\b))/gi,
    replace: (_m, v, obj, objHerThem) => `${v} to ${obj || objHerThem}`,
    why: '"Explain" needs "to" before the person: "Can you explain it to me?" or "Can you explain to me how…"',
    practice: { question: 'Could you explain ___ me how this works?', answer: 'to' },
  }),
  regexRule({
    id: 'revert-back',
    category: 'vocabulary',
    pattern: /\b(revert|reverted|reverts|reverting)\s+back\b/gi,
    replace: (_m, v) => ({ revert: 'reply', reverted: 'replied', reverts: 'replies', reverting: 'replying' })[v.toLowerCase()],
    why: 'In international English, "revert" means "go back to an earlier state". To answer someone, say "reply" or "get back to you".',
    practice: { question: "I'll ___ to you by Friday. (get back / revert back)", answer: 'get back' },
  }),
  regexRule({
    id: 'return-back',
    category: 'vocabulary',
    pattern: /\b(return|returned|returns|returning)\s+back\b/gi,
    replace: (_m, v) => v,
    why: '"Return" already means "come or go back", so "back" is repeated. Just say "return".',
    practice: { question: 'She ___ from Mumbai yesterday. (returned / returned back)', answer: 'returned' },
  }),
  regexRule({
    id: 'cope-up',
    category: 'vocabulary',
    pattern: /\bcope\s+up\s+with\b/gi,
    replace: 'cope with',
    why: 'The correct phrase is "cope with" (no "up").',
    practice: { question: 'How do you ___ with stress?', answer: 'cope' },
  }),
  regexRule({
    id: 'prepone',
    category: 'vocabulary',
    pattern: /\b(prepone|preponed|prepones)\b/gi,
    replace: (m) => ({ prepone: 'bring forward', preponed: 'brought forward', prepones: 'brings forward' })[m.toLowerCase()],
    why: '"Prepone" is only understood in India. International teams say "bring forward" or "move earlier".',
    practice: { question: 'Can we ___ the meeting to 3 p.m.? (bring forward / prepone)', answer: 'bring forward' },
  }),
  regexRule({
    id: 'do-the-needful',
    category: 'vocabulary',
    pattern: /\bdo\s+the\s+needful\b/gi,
    replace: 'take the necessary action',
    why: '"Do the needful" sounds old-fashioned and unclear to international readers. Say exactly what you need.',
    practice: { question: 'Rewrite politely: "Please do the needful."', answer: 'Please take the necessary action.' },
  }),
  regexRule({
    id: 'out-of-station',
    category: 'vocabulary',
    pattern: /\bout\s+of\s+station\b/gi,
    replace: 'out of town',
    why: '"Out of station" is Indian English. Most English speakers say "out of town" or "away".',
    practice: { question: "I'll be ___ next week. (out of town / out of station)", answer: 'out of town' },
  }),
  regexRule({
    id: 'doubt-question',
    category: 'vocabulary',
    pattern: /(?<!\b(?:beyond|without|no|shadow\s+of)\s+)\b(a|one|some|few|a\s+few|many|two|three|small|any)\s+(doubts?)\b/gi, // not "beyond a doubt"
    replace: (_m, q, d) => `${q} ${d.toLowerCase().endsWith('s') || q.toLowerCase() === 'any' ? 'questions' : 'question'}`,
    why: 'In most English, "doubt" means you think something may not be true. When you want to ask something, say "I have a question".',
    practice: { question: 'Excuse me, I have a ___ about the task.', answer: 'question' },
  }),
  regexRule({
    id: 'am-agree',
    category: 'verb-form',
    pattern: /\b(I|we|they|you|he|she)\s+(?:am|are|is|'m|'re|'s)\s+(agree|disagree)\b/gi,
    replace: (_m, subj, v) => `${subj} ${/^(he|she)$/i.test(subj) ? `${v}s` : v}`,
    why: '"Agree" is a verb, so it doesn\'t need "am / is / are": say "I agree", not "I am agree".',
    practice: { question: 'I ___ with you. (agree / am agree)', answer: 'agree' },
  }),
  regexRule({
    id: 'stative-having',
    category: 'verb-tense',
    pattern: /\b(I am|I'm|we are|we're|they are|they're|you are|you're|he is|he's|she is|she's)\s+having\s+((?:a|an|some|one|two|three|many|no)\s+)?(question|questions|car|house|laptop|brother|brothers|sister|sisters|idea|knowledge|experience|bike|phone|pet|dog|cat)\b(?![\s-]+(?:calls?|number|charger|screen|rides?|loan|meetings?|sessions?|food|walk|show)\b)/gi, // "having a phone call" is fine
    replace: (_m, subj, det, noun) => {
      const s = subj.toLowerCase().replace(/'m|'re|'s| am| are| is/g, '');
      const verb = ['he', 'she'].includes(s.trim()) ? 'has' : 'have';
      const pron = s.trim() === 'i' ? 'I' : s.trim();
      return `${pron} ${verb} ${det || ''}${noun}`;
    },
    why: 'When "have" means possession (a car, a question, a brother), we don\'t use the -ing form. Say "I have a question", not "I am having a question".',
    practice: { question: 'She ___ two brothers. (has / is having)', answer: 'has' },
  }),
  regexRule({
    id: 'can-able',
    category: 'verb-form',
    pattern: /\b(can|could|will)\s+(?:be\s+)?able\s+to\b/gi,
    replace: (_m, modal) => (modal.toLowerCase() === 'will' ? 'will be able to' : modal),
    why: '"Can" already means "be able to", so "can able to" repeats the idea. Say "I can do it" or "I am able to do it".',
    practice: { question: 'I ___ join the call. (can / can able to)', answer: 'can' },
  }),
  regexRule({
    id: 'double-comparative',
    category: 'adjectives',
    pattern: /\b(more|most)\s+(better|worse|easier|faster|bigger|smaller|harder|cheaper|happier|best|worst|easiest|biggest)\b/gi,
    replace: (_m, _more, adj) => adj,
    why: '"Better", "easier", "best" are already comparative/superlative forms — don\'t add "more" or "most".',
    practice: { question: 'This version is ___ than the old one. (better / more better)', answer: 'better' },
  }),
  regexRule({
    id: 'article-profession',
    category: 'articles',
    pattern: /\b(I am|I'm|he is|he's|she is|she's|you are|you're|I work as|she works as|he works as)\s+(engineer|developer|tester|teacher|doctor|student|manager|designer|analyst|accountant|nurse|lawyer|architect|consultant|intern|QA engineer|QA|software engineer|software developer|test engineer|automation engineer|project manager|team lead)\b/gi,
    replace: (_m, subj, job) => `${subj} ${/^[aeio]/i.test(job) ? 'an' : 'a'} ${job}`,
    why: 'Use "a" or "an" before a job: "I am a QA engineer", "She is an analyst".',
    practice: { question: 'He is ___ engineer.', answer: 'an' },
  }),
  regexRule({
    id: 'missing-article-event',
    category: 'articles',
    pattern: /\b(have|has|had|having|attend|attended|attending|join|joined|joining|in|scheduled|schedule)\s+(meeting|call|interview|presentation)\b(?![\s-]+(?:centre|center|notes?|rooms?|links?|invites?|invitations?|details|slots?|logs?|recordings?|agenda|minutes|experience|preparation|skills?|questions?|tips|panel|rounds?|process|letter|deck|slides?|summary|schedule|series|quality|volume|waiting)\b)/gi,
    replace: (_m, v, noun) => `${v} ${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`,
    why: 'Singular countable nouns like "meeting" or "call" need an article: "I have a meeting", "I joined a call".',
    practice: { question: 'I have ___ meeting at 4 p.m.', answer: 'a' },
  }),
  regexRule({
    id: 'missing-article-role',
    category: 'articles',
    // "HR" works like a department name ("talk to HR"); "to lead the project" is the verb.
    pattern: /\b(with|to|from|by|for|ask|asked|tell|told|inform|informed|call|called)\s+(developer|manager|client|tester|customer|team lead|lead(?![\s-]+(?:the|a|an|this|that|these|those|my|our|your|his|her|their|it|them|us|him|me|by|teams?|projects?|people|efforts?|initiatives?|discussions?|meetings?|sessions?|calls?)\b)|doctor|interviewer)\b/gi,
    replace: (_m, w, role) => `${w} the ${role}`,
    why: 'A singular job title like "developer" or "manager" needs an article. Use "the" when you mean a specific person: "I talked to the developer."',
    practice: { question: 'I will discuss it with ___ developer tomorrow.', answer: 'the' },
  }),
  regexRule({
    id: 'question-word-order',
    category: 'word-order',
    // "What you are saying is right." is a statement — the clause is the subject of a second verb.
    pattern: /^(what|where|why|how|when|who)\s+(you|they|we|he|she|it)\s+(are|is|were|was|have|has|can|will|should|would|could)\b(?!.*\b(?:is|was|are|were|isn['’]t|wasn['’]t|seems|sounds|makes|means|matters|depends|looks)\b)/i,
    replace: (_m, wh, subj, aux) => `${wh} ${aux} ${subj}`,
    why: 'In questions, put the helping verb before the subject: "What are you doing?", not "What you are doing?"',
    practice: { question: 'Put in order: "you / where / are / going?"', answer: 'Where are you going?' },
  }),
  regexRule({
    id: 'one-of-plural',
    category: 'plural-singular',
    pattern: /\bone\s+of\s+(my|the|our|his|her|their|your)\s+((?:best|closest|biggest|main|favourite|favorite|old|new|good|close|top)\s+)?(friend|colleague|teammate|project|problem|task|brother|sister|client|customer|manager|reason|issue|bug|goal|hobby)\b(?!s)/gi,
    skip: (m, _det, _adj, _noun, offset, str) => isPluralHead(nextWord(str, offset + m.length)), // "one of the project managers"
    replace: (_m, det, adj, noun) => `one of ${det} ${adj || ''}${noun.toLowerCase() === 'hobby' ? 'hobbies' : `${noun}s`}`,
    why: 'After "one of", use a plural noun: "one of my friends", "one of the issues".',
    practice: { question: 'She is one of my best ___ (friend).', answer: 'friends' },
  }),
  regexRule({
    id: 'people-is',
    category: 'subject-verb',
    pattern: /\b(people|children|police|team members)\s+(is|was|has)\b/gi,
    replace: (_m, noun, v) => `${noun} ${({ is: 'are', was: 'were', has: 'have' })[v.toLowerCase()]}`,
    why: '"People" and "children" are plural, so they take plural verbs: "people are", "children were".',
    practice: { question: 'Many people ___ working from home now. (is / are)', answer: 'are' },
  }),
  regexRule({
    id: 'there-is-plural',
    category: 'subject-verb',
    // "some news", "a lot of stress" end in -s but are not plurals.
    pattern: /\bthere\s+(is|was)\s+(many|several|a\s+lot\s+of|lots\s+of|two|three|four|five|some|few)\s+(?!(?:news|series|species|means|physics|maths|mathematics|politics|economics|lens|always|this|thus)\b)([a-z]+s)(?<!ss|us|is)\b/gi,
    replace: (_m, v, q, noun) => `there ${v.toLowerCase() === 'is' ? 'are' : 'were'} ${q} ${noun}`,
    why: 'Use "there are / there were" with plural nouns: "There are many bugs."',
    practice: { question: 'There ___ three tickets in the backlog. (is / are)', answer: 'are' },
  }),
  regexRule({
    id: 'married-with',
    category: 'prepositions',
    pattern: /\bmarried\s+with\b/gi,
    replace: 'married to',
    why: 'We say "married to someone", not "married with".',
    practice: { question: 'He is married ___ a doctor.', answer: 'to' },
  }),
  regexRule({
    id: 'good-in',
    category: 'prepositions',
    // "[a-z]+ing" is for skills (testing, cooking) — not nouns like "spring" or "the morning".
    pattern: /\b(good|bad|better|excellent|great)\s+in\s+(english|maths|math|coding|testing|cooking|sports|communication|speaking|writing|programming|(?!(?:spring|string|ring|king|wing|thing|morning|evening|building|ceiling|wedding|pudding|clothing|meeting|setting|ending|beginning|painting|lighting|feeling|evening)\b)[a-z]+ing)\b/gi,
    replace: (_m, adj, skill) => `${adj} at ${skill}`,
    why: 'We are "good at" a skill or activity, not "good in": "She is good at testing."',
    practice: { question: 'I am good ___ problem-solving.', answer: 'at' },
  }),
  regexRule({
    id: 'at-morning',
    category: 'prepositions',
    pattern: /\b(?:at|in)\s+(morning|evening|afternoon)\b(?![\s-]+(?:assembly|meetings?|stand-?ups?|shifts?|walks?|prayers?|sessions?|briefings?|class(?:es)?|news|shows?|tea|coffee|routine|runs?|slots?|batch)\b)/gi,
    replace: (_m, part) => `in the ${part}`,
    why: 'Use "in the" with parts of the day: "in the morning", "in the evening" (but "at night").',
    practice: { question: 'I usually exercise ___ morning.', answer: 'in the' },
  }),
  regexRule({
    id: 'in-night',
    category: 'prepositions',
    // Only on its own — "on night shifts", "in night mode" are fine.
    pattern: /\b(?:in|on)\s+night\b(?![\s-]+(?!(?:and|but|so|or|i|we|he|she|they|you|it|because|after|before|too|also|then|when|while|time)\b)[a-z])/gi,
    replace: 'at night',
    why: 'We say "at night" (but "in the morning / afternoon / evening").',
    practice: { question: "I can't sleep ___ night.", answer: 'at' },
  }),
  regexRule({
    id: 'angry-on',
    category: 'prepositions',
    // Only "angry on <person>" — "mad on the call" is about where it happened.
    pattern: /\b(angry|upset|mad)\s+on\b(?=\s+(?:me|him|her|us|them|you|my|his|their|our|your|everyone|everybody|someone|people)\b)/gi,
    replace: (_m, adj) => `${adj} with`,
    why: 'You are angry or upset "with" a person (and "about" a situation), not "on".',
    practice: { question: 'My manager was upset ___ me.', answer: 'with' },
  }),
];

/** Writing-only rules (speech transcripts have no reliable spelling/punctuation). */
const COMMON_MISSPELLINGS = {
  recieve: 'receive', recieved: 'received', occured: 'occurred', seperate: 'separate', definately: 'definitely',
  untill: 'until', adress: 'address', wich: 'which', becuase: 'because', beacuse: 'because', tommorow: 'tomorrow',
  tomorow: 'tomorrow', accomodate: 'accommodate', enviroment: 'environment', managment: 'management',
  succesful: 'successful', successfull: 'successful', teh: 'the', thier: 'their', wierd: 'weird',
  begining: 'beginning', beleive: 'believe', calender: 'calendar', collegue: 'colleague', comittee: 'committee',
  existance: 'existence', goverment: 'government', immediatly: 'immediately', independant: 'independent',
  neccessary: 'necessary', necesary: 'necessary', noticable: 'noticeable', occassion: 'occasion',
  persue: 'pursue', posible: 'possible', prefered: 'preferred', realy: 'really', refered: 'referred',
  responsibilty: 'responsibility', sucess: 'success', truely: 'truly', writting: 'writing', enviornment: 'environment',
  maintainance: 'maintenance', mantain: 'maintain', acheive: 'achieve', acheived: 'achieved', greatful: 'grateful',
  apologise: 'apologise', availble: 'available', avaliable: 'available', emial: 'email', plz: 'please', pls: 'please',
  thx: 'thanks', u: 'you', ur: 'your', r: 'are',
};

const TEXT_SPEAK = new Set(['u', 'ur', 'r']);

/** Corrected spelling, or null. Text-speak ("u", "r") only as a lowercase word on its own — not "U.S." or "R&D". */
function misspelling(w, offset, s) {
  const fixed = COMMON_MISSPELLINGS[w.toLowerCase()];
  if (!fixed || fixed === w.toLowerCase()) return null;
  if (TEXT_SPEAK.has(w.toLowerCase())) {
    const before = s[offset - 1] || ' ';
    const after = s[offset + w.length] || ' ';
    if (w !== w.toLowerCase() || /[.&'’\-/]/.test(before) || /[.&'’\-/]/.test(after) && !/^\.(\s|$)/.test(s.slice(offset + w.length))) return null;
  }
  return fixed;
}

export const WRITING_RULES = [
  {
    id: 'spelling',
    category: 'spelling',
    why: 'Spelling mistake — check the corrected word.',
    practice: { question: 'Spell correctly: "recieve"', answer: 'receive' },
    test: (s) => s.replace(/[a-z]+/gi, (w, offset) => (misspelling(w, offset, s) ? '\u0000' : w)).includes('\u0000'),
    fix: (s) => s.replace(/[a-z]+/gi, (w, offset) => {
      const fixed = misspelling(w, offset, s);
      return fixed ? keepCase(w, fixed) : w;
    }),
  },
  {
    id: 'lowercase-i',
    category: 'punctuation',
    why: 'The pronoun "I" is always a capital letter.',
    practice: { question: 'Fix: "yesterday i called him."', answer: 'Yesterday I called him.' },
    test: (s) => /(^|\s)i(\s|'|$)/.test(s),
    fix: (s) => s.replace(/(^|\s)i(?=\s|'|$)/g, '$1I'),
  },
  {
    id: 'capital-start',
    category: 'punctuation',
    why: 'Start every sentence with a capital letter.',
    practice: { question: 'Fix: "the build passed."', answer: 'The build passed.' },
    test: (s) => /^[a-z]/.test(s),
    fix: (s) => s.charAt(0).toUpperCase() + s.slice(1),
  },
];

export { IRREGULAR_PAST };
