/**
 * DEMO / MOCK AI provider — runs fully in the browser, no API key needed.
 * Every method returns the same shape a real backend must return
 * (see remoteAiProvider.js and server/index.js).
 */
import { nextReply } from '../engine/conversationEngine.js';
import { analyzeSentence, betterWays, toMistakeRecords, vocabularySignals } from '../engine/textAnalyzer.js';
import { scoreSpeaking } from '../engine/scoring.js';
import { MISTAKE_CATEGORIES } from '../engine/grammarRules.js';
import { splitSentences, similarity, clamp, average } from '../../utils/text.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const thinking = () => wait(350 + Math.random() * 550);

function countBy(items, key) {
  return items.reduce((acc, it) => ({ ...acc, [it[key]]: (acc[it[key]] || 0) + 1 }), {});
}

function speakingSummary(score, issues) {
  const top = Object.entries(countBy(issues, 'category')).sort((a, b) => b[1] - a[1])[0];
  const focus = top ? MISTAKE_CATEGORIES[top[0]]?.label.toLowerCase() : null;
  if (score >= 85) return `Excellent work! You spoke clearly and naturally.${focus ? ` Keep an eye on ${focus} and you'll sound even more polished.` : ''}`;
  if (score >= 70) return `Good conversation! You kept it going well.${focus ? ` Your main area to improve is ${focus} — let's practise it next.` : ''}`;
  if (score >= 50) return `Nice effort! Try to give longer answers.${focus ? ` I noticed a few ${focus} mistakes, so let's work on those.` : ''}`;
  return `Thanks for practising! Every conversation helps. Try to answer in full sentences${focus ? ` and review your ${focus} mistakes below` : ''}.`;
}

export const mockAiProvider = {
  name: 'Demo AI (built-in)',
  isDemo: true,

  async generateConversation(params) {
    await thinking();
    return nextReply(params);
  },

  /**
   * @param {{turns: Array<{text, confidence?, spokenMs?, viaVoice}>, mode: string}} params
   */
  async analyzeSpeaking({ turns }) {
    await wait(900);
    const analyses = turns.flatMap((t) => splitSentences(t.text).map((s) => analyzeSentence(s, { mode: 'speaking' })));
    const issues = analyses.flatMap((a) => a.issues);
    const score = scoreSpeaking({ turns, issues });
    const mistakes = toMistakeRecords(analyses, 'speaking');

    const candidates = [...analyses]
      .sort((a, b) => b.issues.length - a.issues.length || b.original.length - a.original.length)
      .filter((a) => a.original.split(/\s+/).length >= 4);
    const better = [];
    for (const c of candidates) {
      const b = betterWays(c.original);
      if (b) better.push(b);
      if (better.length === 3) break;
    }

    const strengths = [];
    const improvements = [];
    if (score.stats.avgWordsPerTurn >= 10) strengths.push('You gave detailed, well-developed answers.');
    if (score.stats.advancedWords.length >= 3) strengths.push(`Good vocabulary — you used words like “${score.stats.advancedWords.slice(0, 3).join('”, “')}”.`);
    if (!issues.length && score.stats.totalWords > 10) strengths.push('No grammar mistakes detected — great accuracy!');
    if (score.stats.fillers === 0 && turns.length >= 3) strengths.push('You spoke without filler words like “um” and “uh”.');
    if (!strengths.length) strengths.push('You completed a full conversation — that builds confidence.');
    if (score.stats.avgWordsPerTurn < 8) improvements.push('Give longer answers: add a reason (“because…”) or an example.');
    const cats = countBy(issues, 'category');
    Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .forEach(([cat, n]) => improvements.push(`${MISTAKE_CATEGORIES[cat]?.label}: ${n} mistake${n > 1 ? 's' : ''} — review the corrections below.`));
    if (score.stats.fillers > 2) improvements.push('Reduce filler words (“um”, “like”). A short pause sounds more confident.');

    return {
      ...score,
      mistakes,
      categoryCounts: cats,
      betterWays: better,
      strengths,
      improvements,
      summary: speakingSummary(score.overall, issues),
      demo: true,
    };
  },

  /**
   * @param {{text: string, type: {id, professional: boolean, checks?: string[]}}} params
   */
  async analyzeWriting({ text, type }) {
    await wait(800);
    const sentences = splitSentences(text).map((s) => analyzeSentence(s, { mode: 'writing' }));
    const issues = sentences.flatMap((s) => s.issues);
    const sig = vocabularySignals(text);
    const byCat = countBy(issues, 'category');
    const sentenceLens = sentences.map((s) => s.original.split(/\s+/).length);
    const avgLen = average(sentenceLens);
    const longSentences = sentenceLens.filter((n) => n > 28).length;
    const informal = (text.match(/\b(gonna|wanna|gotta|u|ur|pls|plz|thx|lol|btw|hey guys|asap|yeah|yup|nope)\b|!!|:\)|:D/gi) || []).length;
    const professional = Boolean(type?.professional);

    const grammarErr = issues.filter((i) => !['spelling', 'punctuation', 'vocabulary'].includes(i.category)).length;
    const scores = {
      grammar: clamp(Math.round(100 - grammarErr * 12), 30, 100),
      spelling: clamp(Math.round(100 - (byCat.spelling || 0) * 15 - (byCat.punctuation || 0) * 5), 30, 100),
      structure: clamp(Math.round(92 - longSentences * 10 - (sentences.length < 2 ? 15 : 0) - (avgLen < 5 ? 15 : 0)), 30, 100),
      vocabulary: clamp(Math.round(62 + Math.min(25, sig.advancedWords.length * 5) + Math.min(10, sig.uniqueWords / 6) - (byCat.vocabulary || 0) * 8), 30, 100),
      tone: clamp(Math.round((professional ? 95 - informal * 15 : 90 - informal * 3)), 30, 100),
      clarity: clamp(Math.round(95 - longSentences * 12 - Math.max(0, avgLen - 22) * 2), 30, 100),
      professionalism: clamp(Math.round((professional ? 92 : 85) - informal * (professional ? 15 : 5) - grammarErr * 5 - (byCat.vocabulary || 0) * 6), 30, 100),
    };
    const overall = Math.round(average(Object.values(scores)));

    const tips = [];
    const checks = type?.checks || [];
    if (checks.includes('greeting') && !/^(hi|hello|dear|good (morning|afternoon|evening))\b/i.test(text.trim())) tips.push('Start with a greeting, e.g. “Hi Rahul,” or “Dear Ms. Sharma,”.');
    if (checks.includes('signoff') && !/\b(regards|thanks|thank you|best|sincerely|cheers)\b[\s\S]{0,40}$/i.test(text.trim())) tips.push('End with a sign-off, e.g. “Best regards,” followed by your name.');
    if (checks.includes('steps') && !/\bsteps?\b/i.test(text)) tips.push('Add clear “Steps to reproduce” (1, 2, 3…).');
    if (checks.includes('expected') && !/\bexpected\b/i.test(text)) tips.push('State the “Expected result” and the “Actual result”.');
    if (checks.includes('dates') && !/\b(\d{1,2}(st|nd|rd|th)?|monday|tuesday|wednesday|thursday|friday|tomorrow|next week|from|to)\b/i.test(text)) tips.push('Mention the exact dates you are requesting.');
    if (longSentences) tips.push('Break long sentences into shorter ones — one idea per sentence.');
    if (professional && informal) tips.push('Avoid informal words like “pls”, “gonna” or “asap” in professional messages.');
    if (sig.totalWords < 25) tips.push('Try writing a little more — aim for at least 3-4 sentences.');
    if (!tips.length) tips.push('Well structured! Try using a few more precise words to sound even more fluent.');

    const correctedText = sentences.map((s) => s.corrected).join(' ');
    const professionalVersion = sentences
      .map((s) => betterWays(s.corrected)?.professional || s.corrected)
      .join(' ');

    return {
      overall,
      scores,
      correctedText,
      professionalVersion,
      mistakes: toMistakeRecords(sentences, 'writing'),
      tips,
      stats: { words: sig.totalWords, sentences: sentences.length, avgSentenceLength: Math.round(avgLen) },
      demo: true,
    };
  },

  /**
   * Pronunciation is ESTIMATED from what the speech recogniser heard. It cannot
   * judge individual sounds. A real pronunciation-assessment API should replace this.
   * @param {{ target: string, alternatives: Array<{transcript: string, confidence: number}> }} params
   */
  async analyzePronunciation({ target, alternatives = [] }) {
    await wait(400);
    const t = target.toLowerCase().replace(/[^a-z' ]/g, '').trim();
    const heard = alternatives.map((a) => ({ ...a, clean: a.transcript.toLowerCase().replace(/[^a-z' ]/g, '').trim() }));
    const exactIndex = heard.findIndex((h) => h.clean === t || h.clean.split(' ').includes(t));
    let score;
    let matched = false;
    if (exactIndex === 0) {
      matched = true;
      score = Math.round(72 + (heard[0].confidence || 0.8) * 26);
    } else if (exactIndex > 0) {
      matched = true;
      score = Math.round(58 + (heard[exactIndex].confidence || 0.6) * 14);
    } else {
      const best = Math.max(0, ...heard.map((h) => similarity(h.clean, t)));
      score = Math.round(20 + best * 45);
    }
    score = clamp(score, 10, 98);
    const feedback =
      score >= 85
        ? 'Great! Your word was recognised clearly.'
        : score >= 65
          ? 'Good — the word was recognised, but not with full confidence. Listen to the slow version and try again.'
          : `The recogniser heard “${heard[0]?.transcript || 'nothing'}”. Listen carefully, slow down, and focus on the key sound.`;
    return { score, matched, heard: heard[0]?.transcript || '', alternatives: heard.map((h) => h.transcript), feedback, method: 'speech-recognition-estimate', demo: true };
  },

  async analyzeGrammar({ topicTitle, results }) {
    await wait(300);
    const correct = results.filter((r) => r.correct).length;
    const pct = Math.round((correct / Math.max(1, results.length)) * 100);
    const comment =
      pct >= 90 ? `Excellent! You have a strong understanding of ${topicTitle}.`
        : pct >= 70 ? `Good job! Review the explanations for the questions you missed.`
          : pct >= 50 ? `Nice try. ${topicTitle} needs a bit more practice — read the explanation again and retry.`
            : `${topicTitle} is a weak area for now. Don't worry — read the examples and try the practice mode first.`;
    return { score: pct, comment, demo: true };
  },
};
