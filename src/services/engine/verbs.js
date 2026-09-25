/** Small verb dictionary used by the rule-based (demo) grammar checker. */
export const IRREGULAR_PAST = {
  go: 'went', do: 'did', have: 'had', make: 'made', take: 'took', come: 'came', see: 'saw', eat: 'ate',
  get: 'got', give: 'gave', find: 'found', meet: 'met', buy: 'bought', bring: 'brought', think: 'thought',
  tell: 'told', say: 'said', write: 'wrote', speak: 'spoke', leave: 'left', feel: 'felt', send: 'sent',
  spend: 'spent', begin: 'began', drink: 'drank', drive: 'drove', run: 'ran', sleep: 'slept', teach: 'taught',
  understand: 'understood', know: 'knew', pay: 'paid', lose: 'lost', become: 'became', break: 'broke',
  choose: 'chose', forget: 'forgot', hear: 'heard', keep: 'kept', sit: 'sat', stand: 'stood', win: 'won',
  fly: 'flew', catch: 'caught', wake: 'woke', wear: 'wore', build: 'built', swim: 'swam', sing: 'sang',
  stop: 'stopped', plan: 'planned', chat: 'chatted', shop: 'shopped', travel: 'traveled', read: 'read',
  put: 'put', cut: 'cut', let: 'let', hit: 'hit', lead: 'led', sell: 'sold', show: 'showed', grow: 'grew',
};

export const PARTICIPLE_TO_PAST = {
  done: 'did', gone: 'went', seen: 'saw', written: 'wrote', eaten: 'ate', taken: 'took', given: 'gave',
  spoken: 'spoke', broken: 'broke', chosen: 'chose', forgotten: 'forgot', known: 'knew', begun: 'began',
  driven: 'drove', flown: 'flew', grown: 'grew', worn: 'wore', woken: 'woke', become: 'became',
};

export const PAST_TO_PARTICIPLE = {
  went: 'gone', came: 'come', saw: 'seen', ate: 'eaten', took: 'taken', wrote: 'written', spoke: 'spoken',
  began: 'begun', drove: 'driven', gave: 'given', knew: 'known', broke: 'broken', chose: 'chosen', forgot: 'forgotten',
};

const REGULAR = [
  'work', 'complete', 'finish', 'start', 'call', 'visit', 'watch', 'play', 'talk', 'attend', 'test', 'check',
  'fix', 'join', 'learn', 'help', 'ask', 'need', 'want', 'like', 'open', 'move', 'cook', 'clean', 'walk',
  'stay', 'try', 'use', 'prepare', 'discuss', 'explain', 'share', 'deploy', 'review', 'report', 'update',
  'create', 'enjoy', 'decide', 'reach', 'submit', 'deliver', 'schedule', 'fail', 'pass', 'receive', 'change',
  'wait', 'arrive', 'return', 'study', 'live', 'love', 'hate', 'present', 'listen', 'look', 'order', 'book',
  'miss', 'solve', 'handle', 'manage', 'design', 'develop', 'install', 'raise', 'close', 'log', 'push',
  'merge', 'watch', 'relax', 'exercise', 'celebrate', 'practice', 'improve', 'discover', 'identify', 'verify',
];

export const BASE_VERBS = new Set([...Object.keys(IRREGULAR_PAST), ...REGULAR]);

export function regularPast(verb) {
  if (verb.endsWith('e')) return `${verb}d`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
  return `${verb}ed`;
}

export function pastOf(verb) {
  return IRREGULAR_PAST[verb] || regularPast(verb);
}

/** Past-tense form -> base verb (only for verbs we know). */
export const PAST_TO_BASE = (() => {
  const map = {};
  BASE_VERBS.forEach((v) => {
    map[pastOf(v)] = v;
  });
  return map;
})();

export function thirdPerson(verb) {
  if (verb === 'have') return 'has';
  if (verb === 'do') return 'does';
  if (verb === 'go') return 'goes';
  if (/(s|sh|ch|x|z|o)$/.test(verb)) return `${verb}es`;
  if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
  return `${verb}s`;
}

/** Returns the base form if the word is a base or 3rd-person form of a known verb. */
export function baseOf(word) {
  const w = word.toLowerCase();
  if (BASE_VERBS.has(w)) return w;
  if (w === 'has') return 'have';
  if (w === 'does') return 'do';
  if (w === 'goes') return 'go';
  if (w.endsWith('ies') && BASE_VERBS.has(`${w.slice(0, -3)}y`)) return `${w.slice(0, -3)}y`;
  if (w.endsWith('es') && BASE_VERBS.has(w.slice(0, -2))) return w.slice(0, -2);
  if (w.endsWith('s') && BASE_VERBS.has(w.slice(0, -1))) return w.slice(0, -1);
  return null;
}

export function isPastForm(word) {
  const w = word.toLowerCase();
  return Boolean(PAST_TO_BASE[w]) || ['was', 'were'].includes(w);
}
