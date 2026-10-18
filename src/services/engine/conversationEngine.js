/**
 * Demo conversation engine for Emma. It reacts to what you say (topic keywords,
 * mood, questions, very short answers), asks follow-ups, then moves through the
 * topic's question list. It never interrupts to correct you — mistakes are
 * collected and explained in the report after the session.
 *
 * Replace with a real LLM via services/providers/remoteAiProvider.js.
 */
import { getMode } from '../../data/conversationModes.js';
import { pick } from '../../utils/text.js';

const ACKS = {
  friendly: {
    positive: ["That's wonderful to hear!", 'How lovely!', 'That sounds great!', "I'm really happy for you!"],
    negative: ["Oh no, I'm sorry to hear that.", 'That sounds difficult.', "That must have been hard. I hope it's better soon."],
    work: ['That sounds like a productive day!', 'You sound really busy!', 'That sounds like good progress.'],
    neutral: ['I see!', 'That’s interesting!', 'Thanks for sharing that.', 'Nice!'],
    short: ['Could you tell me a little more?', 'Can you say that in a full sentence?', 'Interesting — can you give me more details?'],
    none: ["That's okay!", 'No problem at all.', 'No worries!', "That's completely fine."],
    sick: ["Oh no, I'm sorry you're not feeling well.", 'Oh dear, I hope you feel better soon.', 'That sounds uncomfortable. Please take care of yourself.'],
  },
  interviewer: {
    positive: ['Thank you, that is a good example.', 'Excellent, thank you.', "That's a strong point."],
    negative: ['I understand. Thank you for being honest.', 'I see. That sounds challenging.'],
    work: ['Thank you. That is relevant experience.', 'Understood. That gives me a clear picture.'],
    neutral: ['Thank you.', 'I see.', 'Understood.', 'Noted, thank you.'],
    short: ['Could you elaborate on that?', 'Can you give me a specific example?', 'Could you expand on that a little?'],
    none: ['That is fine, thank you for being honest.', 'Understood.', 'I see, thank you.'],
    sick: ['I am sorry to hear you are unwell.', 'I hope you recover soon.'],
  },
  friend: {
    positive: ['Oh nice, that’s awesome!', 'No way, that’s so cool!', 'Ha, I love that!'],
    negative: ['Oh man, that’s rough.', 'Ugh, sorry to hear that!', 'Oh no! That sucks.'],
    work: ['Wow, busy day!', 'Sounds like you got loads done!', 'Nice, you’re on fire!'],
    neutral: ['Oh, cool!', 'Haha, okay!', 'Oh really?', 'Nice one.'],
    short: ['Come on, tell me more!', 'And then what?', 'Wait, what do you mean?'],
    none: ['Haha, fair enough!', 'Ah, okay, no worries!', 'Totally fine!'],
    sick: ['Oh no, get well soon!', 'Ugh, being sick is the worst!', 'Aw, rest up, okay?'],
  },
  coach: {
    positive: ['Good. Keep your sentences that clear.', 'Good answer.', 'Better. Keep going.'],
    negative: ['Okay. Describe it clearly.', 'Understood. Explain what happened.'],
    work: ['Good. Now be more specific.', 'Fine. Use the past tense carefully.'],
    neutral: ['Okay.', 'Fine.', 'Continue.'],
    short: ['That answer is too short. Give me at least two full sentences.', 'Use a complete sentence, please.', 'More detail, please.'],
    none: ['Okay, that is fine.', 'Understood.'],
    sick: ['Sorry to hear that. Take care.', 'Understood. Rest well.'],
  },
};

const OPENERS = {
  friendly: (o) => o,
  interviewer: (o) => o,
  friend: (o) => o.replace(/^Hi!|^Hello|^Good (morning|evening)[^.!]*[.!]/, 'Hey!'),
  coach: (o) => `Let's begin. Answer in full sentences. ${o}`,
};

const FOLLOW_UPS = [
  { keys: /\b(work|office|job|task|tasks)\b/i, none: ['So it was a quiet day! What did you do instead?'], past: ['What kind of work did you complete?', 'What was the most challenging task?'], present: ['What does a typical workday look like for you?', 'What do you enjoy most about your work?'] },
  { keys: /\b(meeting|meetings|call|calls)\b/i, past: ['What was the meeting about?', 'How did the meeting go?'], present: ['How many meetings do you usually have in a day?'] },
  { keys: /\b(bug|bugs|testing|test|tests|defect|issue|issues)\b/i, past: ['Interesting! What kind of bugs did you find?', 'How did you report the issue?'], present: ['What kind of testing do you usually do?', 'Which testing tools do you use?'] },
  { keys: /\b(family|mother|father|mom|dad|wife|husband|son|daughter|kids|children|parents|brother|sister)\b/i, past: ['What did you do together?'], present: ['Tell me more about your family.', 'How often do you see them?'] },
  { keys: /\b(movie|film|series|show|netflix)\b/i, none: ['What do you like to do in your free time instead?'], past: ['What was it about?', 'Would you recommend it?'], present: ['What kind of movies do you like?'] },
  { keys: /\b(food|lunch|dinner|breakfast|ate|eat|cook|cooked|restaurant)\b/i, past: ['What did you eat?', 'Was it tasty?'], present: ['What is your favourite dish?', 'Do you like cooking?'] },
  { keys: /\b(trip|travel|travelled|traveled|visit|visited|holiday|vacation)\b/i, none: ['If you could go anywhere, where would you like to go?'], past: ['What was the best part of the trip?', 'Who did you go with?'], present: ['Where would you like to travel next?'] },
  { keys: /\b(friend|friends)\b/i, past: ['What did you and your friends do?'], present: ['How did you meet your best friend?'] },
  { keys: /\b(gym|exercise|walk|run|running|yoga|cricket|football|sport|sports)\b/i, none: ['Would you like to start some exercise? What kind?'], past: ['How did you feel after that?'], present: ['How often do you exercise?', 'What sport do you enjoy the most?'] },
  { keys: /\b(study|studied|learn|learned|learnt|learning|course|english|practice|practise)\b/i, none: ['What would you like to learn next?', 'What makes it hard to find time to practise English?', 'That is why we are practising together now! What would help you practise a little every day?'], past: ['What did you learn?'], present: ['What is the hardest part of learning English for you?', 'How do you practise English every day?'] },
  { keys: /\b(weekend|saturday|sunday)\b/i, none: ['A relaxing weekend then! Did you rest at home?'], past: ['What was the highlight of your weekend?'], present: ['What are your plans for this weekend?'] },
];

const POSITIVE = /\b(good|great|happy|nice|fun|enjoy|enjoyed|love|loved|awesome|amazing|excited|fantastic|wonderful|productive|relaxing)\b/i;
// "hard" only as a description ("it was hard", "a hard day") — not "I worked hard".
const NEGATIVE = /\b(bad|sad|sick|ill|tired|stressed|stressful|difficult|problem|problems|angry|terrible|boring|exhausted|worried|upset|worse|worst|awful|horrible)\b|\b(was|is|were|so|very|really|too|quite|pretty|a)\s+hard\b|\bhard\s+(day|time|week)\b/i;
// "not", "never", "nothing", "didn't", "can't"… — the learner is saying no.
const NEGATED = /\b(not|never|nothing|none|nobody|nowhere|no)\b|n['’]t\b/i;
// Contextual words only: "a film about a hospital" or "a cold drink" is not being ill.
const SICK = /\b(sick(?!\s+of\b)|ill|unwell|cough|coughing|fever|flu|headache|stomachache|toothache|migraine|infection|injured|sore throat)\b|\b(in|to|at|from|into)\s+(the\s+|a\s+)?hospital\b|\b(take|took|taking|takes|on|need|needed)\s+(some\s+|my\s+|the\s+)?medicines?\b|\b(a|have|had|got|and|with) (bad )?cold\b(?!\s+(drinks?|coffee|water|beer|juice|weather|day|night|morning|evening|wind|shower|bath|place|room|start|call|email|feet|hands|storage|brew|food|soup|war)\b)/i;
// "I'm not sick anymore", "no fever today" — getting better, not being ill.
const NOT_SICK = /(\b(not|no\s+longer|never)|n['’]t)\s+([\w'’]+\s+){0,2}?(sick|ill|unwell)\b(\s+anymore)?|\bno\s+(more\s+)?(fever|cough|cold|headache|flu|pain)\b/gi;
// "Not bad", "no problems", "nothing bad happened" — a negated complaint means things went fine.
const NOT_BAD = /(\b(not|no|never|nothing|without)|n['’]t)\s+([\w'’]+\s+){0,2}?(bad|hard|difficult|boring|problems?|issues?|stress|stressed|stressful|tired|worried|terrible)\b/gi;
const NOT_GOOD = /(\b(not|never|nothing)|n['’]t)\s+(\w+\s+)?(good|great|happy|nice|fun|well|enjoy|enjoyed|productive|relaxing)\b/i;
// Negative words used to say something very positive.
const EMPHATIC = /\b(can['’]?t|cannot|couldn['’]?t)\s+wait\b|\bcouldn['’]?t\s+(be|have\s+been)\s+(happier|better)\b|\bnever\s+(been|felt)\s+(better|happier)\b|\bno\s+complaints\b/i;
const SICK_FOLLOW_UPS = ['Are you feeling any better now?', 'Did you see a doctor or take some medicine?', 'Are you getting enough rest?', 'What do you usually do to feel better when you are sick?'];
// Replies to a sick follow-up ("Are you feeling better?") — matched to how they say they are.
const SICK_REPLY_ACKS = {
  better: ['Good, rest is really important.', "That's good. Take it easy today.", "I'm glad to hear that."],
  other: ['I hope you feel better soon.', 'Okay. Please take it easy today.'],
};
const NEGATIVE_FOLLOW_UPS = ['What happened?', 'What made it so difficult?', 'Is there anything that could make it better?'];
const NONE_FOLLOW_UPS = ['What did you do instead?', 'What would you like to talk about instead?'];
const WORKY = /\b(work|office|completed|finished|meeting|project|deadline|testing|bugs?|deployed|release)\b/i;
const PAST_HINT = /\b(yesterday|today|last|ago|went|did|was|were|had|completed|finished|found|met|ate|saw|\w+ed)\b/i;

/** What kind of answer did the learner give? Negation-aware, so "not good" isn't positive. */
export function moodOf(text) {
  // A leading "No," just answers the question — judge what follows ("No, it was a great day").
  const t = text.replace(/^\s*(no|nope|nah)\b[\s,.!]+(?=\S)/i, '').replace(NOT_SICK, ' ');
  if (SICK.test(t)) return 'sick';
  if (EMPHATIC.test(t)) return 'positive';
  const eased = t.replace(NOT_BAD, ' ');
  if (NOT_GOOD.test(eased) || NEGATIVE.test(eased)) return 'negative';
  if (eased !== t) return 'positive';
  if (NEGATED.test(eased)) return POSITIVE.test(eased) ? 'positive' : 'none';
  if (WORKY.test(eased)) return 'work';
  if (POSITIVE.test(eased)) return 'positive';
  return 'neutral';
}

const EMMA_ANSWERS = [
  "Good question! As your English coach, my favourite part of the day is hearing how people practise. ",
  "I'm an AI, so I don't have a real day — but I love learning about yours! ",
  "For me, the best thing is a good conversation, like this one. ",
];

/**
 * @param {{mode:string, difficulty:string, personality:string, history:Array<{role:'ai'|'user', text:string}>, focusTip?:string}} params
 * @returns {{ text: string, done?: boolean }}
 */
export function nextReply({ mode, difficulty = 'intermediate', personality = 'friendly', history = [], focusTip }) {
  const topic = getMode(mode);
  const style = ACKS[personality] || ACKS.friendly;
  const userTurns = history.filter((h) => h.role === 'user');
  const asked = new Set(history.filter((h) => h.role === 'ai').map((h) => h.text));

  if (!userTurns.length) {
    const opener = (OPENERS[personality] || OPENERS.friendly)(topic.opener);
    return { text: focusTip ? `${opener} ${focusTip}` : opener };
  }

  const last = userTurns[userTurns.length - 1].text.trim();
  const wordCount = last.split(/\s+/).filter(Boolean).length;
  const easy = ['beginner', 'elementary'].includes(difficulty);
  const pool = easy && topic.easy?.length ? topic.easy : topic.questions;
  const unasked = (list) => list.filter((q) => ![...asked].some((a) => a.includes(q)));

  if (userTurns.length >= 10) {
    return {
      text: pick(['This has been a great conversation! Tap “End session” whenever you are ready and I will show you your feedback.', 'Great job today! You can keep talking, or end the session to see your score and corrections.']),
      done: true,
    };
  }

  const lastAi = [...history].reverse().find((h) => h.role === 'ai')?.text || '';
  const answeringSick = SICK_FOLLOW_UPS.some((q) => lastAi.includes(q));
  let mood = moodOf(last);
  if (answeringSick && mood === 'negative') mood = 'sick'; // "No, I feel worse" — still unwell

  // Very short answer → ask for more (not every time, so it doesn't feel robotic). "I have fever" still gets sympathy.
  if (wordCount < 4 && mood !== 'sick' && !/\?$/.test(last) && userTurns.length % 2 === 1) {
    return { text: pick(style.short) };
  }

  // Avoid repeating the acknowledgement Emma used last turn.
  const fresh = (list) => pick(list.filter((a) => !lastAi.startsWith(a)).length ? list.filter((a) => !lastAi.startsWith(a)) : list);
  let ack = '';
  if (/\?\s*$/.test(last) || /^(what|how|do|did|are|can|where|why|who)\b.*\byou\b/i.test(last)) {
    ack = fresh(EMMA_ANSWERS);
  } else if (mood !== 'sick' && answeringSick) {
    // they're answering "Are you feeling better?" — stay caring
    ack = fresh(mood === 'none' ? SICK_REPLY_ACKS.other : SICK_REPLY_ACKS.better);
  } else ack = fresh(style[mood] || style.neutral);

  // Feeling unwell → show care and stay on it before changing the subject.
  if (mood === 'sick') {
    const options = unasked(SICK_FOLLOW_UPS);
    if (options.length) return { text: `${ack} ${options[0]}` };
  }

  // Something went wrong → ask about it before switching topic.
  if (mood === 'negative' && userTurns.length < 8) {
    const options = unasked(NEGATIVE_FOLLOW_UPS);
    if (options.length && Math.random() < 0.6) return { text: `${ack} ${pick(options)}` };
  }

  // Follow up on something the learner mentioned (first two follow-ups per topic).
  // A "no" answer ("I didn't learn anything") gets a matching follow-up, never "What did you learn?".
  const isPast = PAST_HINT.test(last);
  const follow = FOLLOW_UPS.find((f) => f.keys.test(last));
  if (follow && userTurns.length < 8) {
    const options = unasked(mood === 'none' ? follow.none || [] : isPast ? follow.past : follow.present);
    if (options.length && (mood === 'none' || Math.random() < 0.75)) return { text: `${ack} ${pick(options)}` };
  }
  if (mood === 'none' && userTurns.length < 8 && Math.random() < 0.5) {
    const options = unasked(NONE_FOLLOW_UPS);
    if (options.length) return { text: `${ack} ${pick(options)}` };
  }

  const remaining = unasked(pool);
  const extraProbe = ['upper-intermediate', 'advanced'].includes(difficulty) && Math.random() < 0.3 ? ' Could you give me a specific example?' : '';
  if (remaining.length) return { text: `${ack} ${remaining[0]}${extraProbe && remaining[0].length < 40 ? extraProbe : ''}` };

  return { text: `${ack} ${pick(['What else would you like to talk about?', 'Tell me something interesting about your week.', 'What is one thing you want to improve this month?'])}` };
}
