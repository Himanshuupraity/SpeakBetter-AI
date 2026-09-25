/** Quiz grading shared by Grammar, Reading, Listening and the Level Test. */
import { GRAMMAR_TOPICS } from '../data/grammarTopics.js';

export function getTopic(id) {
  return GRAMMAR_TOPICS.find((t) => t.id === id);
}

/**
 * @param {Array<{id, answer, options, explanation, prompt}>} questions
 * @param {Record<string, number>} answers questionId -> selected index
 */
export function gradeQuiz(questions, answers) {
  const results = questions.map((q) => {
    const selected = answers[q.id];
    return {
      id: q.id,
      prompt: q.prompt,
      selected,
      selectedText: q.options[selected],
      correctText: q.options[q.answer],
      correct: selected === q.answer,
      explanation: q.explanation,
      type: q.type,
    };
  });
  const correct = results.filter((r) => r.correct).length;
  return { results, correct, total: questions.length, score: Math.round((correct / Math.max(1, questions.length)) * 100) };
}

/** Wrong quiz answers become entries in "My Mistakes". */
export function quizMistakes(graded, { source, category, topic }) {
  return graded.results
    .filter((r) => !r.correct && r.selected !== undefined)
    .map((r) => ({
      source,
      category,
      categories: [category],
      said: r.prompt.includes('___') ? r.prompt.replace('___', `[${r.selectedText}]`) : `${r.prompt} → ${r.selectedText}`,
      correct: r.prompt.includes('___') ? r.prompt.replace('___', r.correctText) : r.correctText,
      why: r.explanation,
      reasons: [],
      practice: null,
      topic,
    }));
}
