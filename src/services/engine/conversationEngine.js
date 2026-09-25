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
  },
  interviewer: {
    positive: ['Thank you, that is a good example.', 'Excellent, thank you.', "That's a strong point."],
    negative: ['I understand. Thank you for being honest.', 'I see. That sounds challenging.'],
    work: ['Thank you. That is relevant experience.', 'Understood. That gives me a clear picture.'],
    neutral: ['Thank you.', 'I see.', 'Understood.', 'Noted, thank you.'],
    short: ['Could you elaborate on that?', 'Can you give me a specific example?', 'Could you expand on that a little?'],
  },
  friend: {
    positive: ['Oh nice, that’s awesome!', 'No way, that’s so cool!', 'Ha, I love that!'],
    negative: ['Oh man, that’s rough.', 'Ugh, sorry to hear that!', 'Oh no! That sucks.'],
    work: ['Wow, busy day!', 'Sounds like you got loads done!', 'Nice, you’re on fire!'],
    neutral: ['Oh, cool!', 'Haha, okay!', 'Oh really?', 'Nice one.'],
    short: ['Come on, tell me more!', 'And then what?', 'Wait, what do you mean?'],
  },
  coach: {
    positive: ['Good. Keep your sentences that clear.', 'Good answer.', 'Better. Keep going.'],
    negative: ['Okay. Describe it clearly.', 'Understood. Explain what happened.'],
    work: ['Good. Now be more specific.', 'Fine. Use the past tense carefully.'],
    neutral: ['Okay.', 'Fine.', 'Continue.'],
    short: ['That answer is too short. Give me at least two full sentences.', 'Use a complete sentence, please.', 'More detail, please.'],
  },
};

const OPENERS = {
  friendly: (o) => o,
  interviewer: (o) => o,
  friend: (o) => o.replace(/^Hi!|^Hello|^Good (morning|evening)[^.!]*[.!]/, 'Hey!'),
  coach: (o) => `Let's begin. Answer in full sentences. ${o}`,
};

const FOLLOW_UPS = [
  { keys: /\b(work|office|job|task|tasks)\b/i, past: ['What kind of work did you complete?', 'What was the most challenging task?'], present: ['What does a typical workday look like for you?', 'What do you enjoy most about your work?'] },
  { keys: /\b(meeting|meetings|call|calls)\b/i, past: ['What was the meeting about?', 'How did the meeting go?'], present: ['How many meetings do you usually have in a day?'] },
  { keys: /\b(bug|bugs|testing|test|tests|defect|issue|issues)\b/i, past: ['Interesting! What kind of bugs did you find?', 'How did you report the issue?'], present: ['What kind of testing do you usually do?', 'Which testing tools do you use?'] },
  { keys: /\b(family|mother|father|mom|dad|wife|husband|son|daughter|kids|children|parents|brother|sister)\b/i, past: ['What did you do together?'], present: ['Tell me more about your family.', 'How often do you see them?'] },
  { keys: /\b(movie|film|series|show|netflix)\b/i, past: ['What was it about?', 'Would you recommend it?'], present: ['What kind of movies do you like?'] },
  { keys: /\b(food|lunch|dinner|breakfast|ate|eat|cook|cooked|restaurant)\b/i, past: ['What did you eat?', 'Was it tasty?'], present: ['What is your favourite dish?', 'Do you like cooking?'] },
  { keys: /\b(trip|travel|travelled|traveled|visit|visited|holiday|vacation)\b/i, past: ['What was the best part of the trip?', 'Who did you go with?'], present: ['Where would you like to travel next?'] },
  { keys: /\b(friend|friends)\b/i, past: ['What did you and your friends do?'], present: ['How did you meet your best friend?'] },
  { keys: /\b(gym|exercise|walk|run|running|yoga|cricket|football|sport|sports)\b/i, past: ['How did you feel after that?'], present: ['How often do you exercise?', 'What sport do you enjoy the most?'] },
  { keys: /\b(study|studied|learn|learned|learning|course|english)\b/i, past: ['What did you learn?'], present: ['What is the hardest part of learning English for you?', 'How do you practise English every day?'] },
  { keys: /\b(weekend|saturday|sunday)\b/i, past: ['What was the highlight of your weekend?'], present: ['What are your plans for this weekend?'] },
];

const POSITIVE = /\b(good|great|happy|nice|fun|enjoy|enjoyed|love|loved|awesome|amazing|excited|fantastic|wonderful|productive|relaxing)\b/i;
const NEGATIVE = /\b(bad|sad|sick|ill|tired|stressed|stressful|difficult|problem|problems|angry|terrible|boring|exhausted|worried|upset|hard)\b/i;
const WORKY = /\b(work|office|completed|finished|meeting|project|deadline|testing|bugs?|deployed|release)\b/i;
const PAST_HINT = /\b(yesterday|today|last|ago|went|did|was|were|had|completed|finished|found|met|ate|saw|\w+ed)\b/i;

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

  // Very short answer → ask for more (not every time, so it doesn't feel robotic).
  if (wordCount < 4 && !/\?$/.test(last) && userTurns.length % 2 === 1) {
    return { text: pick(style.short) };
  }

  // Avoid repeating the acknowledgement Emma used last turn.
  const lastAi = [...history].reverse().find((h) => h.role === 'ai')?.text || '';
  const fresh = (list) => pick(list.filter((a) => !lastAi.startsWith(a)).length ? list.filter((a) => !lastAi.startsWith(a)) : list);
  let ack = '';
  if (/\?\s*$/.test(last) || /^(what|how|do|did|are|can|where|why|who)\b.*\byou\b/i.test(last)) {
    ack = fresh(EMMA_ANSWERS);
  } else if (NEGATIVE.test(last)) ack = fresh(style.negative);
  else if (WORKY.test(last)) ack = fresh(style.work);
  else if (POSITIVE.test(last)) ack = fresh(style.positive);
  else ack = fresh(style.neutral);

  // Follow up on something the learner mentioned (first two follow-ups per topic).
  const isPast = PAST_HINT.test(last);
  const follow = FOLLOW_UPS.find((f) => f.keys.test(last));
  if (follow && userTurns.length < 8) {
    const options = unasked(isPast ? follow.past : follow.present);
    if (options.length && Math.random() < 0.75) return { text: `${ack} ${pick(options)}` };
  }

  const remaining = unasked(pool);
  const extraProbe = ['upper-intermediate', 'advanced'].includes(difficulty) && Math.random() < 0.3 ? ' Could you give me a specific example?' : '';
  if (remaining.length) return { text: `${ack} ${remaining[0]}${extraProbe && remaining[0].length < 40 ? extraProbe : ''}` };

  return { text: `${ack} ${pick(['What else would you like to talk about?', 'Tell me something interesting about your week.', 'What is one thing you want to improve this month?'])}` };
}
