import { useRef, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import ChoiceGroup from '../../components/common/ChoiceGroup.jsx';
import Quiz from '../../components/common/Quiz.jsx';
import { HINDI_WORD_CATEGORIES, HINDI_WORDS } from '../../data/hindi.js';
import { useApp } from '../../context/AppContext.jsx';
import { quizMistakes } from '../../services/grammarService.js';
import { buildWordQuiz } from '../../utils/hindi.js';

export default function HindiQuiz() {
  const { state, recordSession, updateWord } = useApp();
  const [scope, setScope] = useState('all');
  const [mode, setMode] = useState('practice');
  const [questions, setQuestions] = useState(null);
  const startedAt = useRef(Date.now());
  const learned = HINDI_WORDS.filter((w) => state.vocab[w.id]?.learned);

  const scopeOptions = [
    { id: 'all', label: 'All words' },
    ...(learned.length >= 4 ? [{ id: 'learned', label: `My learned words (${learned.length})` }] : []),
    ...HINDI_WORD_CATEGORIES,
  ];

  const start = () => {
    const words = scope === 'all' ? HINDI_WORDS : scope === 'learned' ? learned : HINDI_WORDS.filter((w) => w.category === scope);
    startedAt.current = Date.now();
    setQuestions(buildWordQuiz(words, { count: Math.min(10, words.length), pool: HINDI_WORDS }));
  };

  const onComplete = (graded) => {
    const label = scopeOptions.find((o) => o.id === scope)?.label || 'Words';
    recordSession({
      type: 'hindi',
      title: `Hindi word quiz: ${label}`,
      durationSec: (Date.now() - startedAt.current) / 1000,
      score: graded.score,
      skills: { hindi: graded.score },
      details: { activity: 'quiz', correct: graded.correct, total: graded.total, results: graded.results },
      mistakes: quizMistakes(graded, { source: 'hindi', category: 'hindi', topic: null }),
    });
    // Words answered correctly count as learned.
    graded.results.forEach((r) => {
      const q = questions.find((x) => x.id === r.id);
      if (r.correct && q && !state.vocab[q.wordId]?.learned) updateWord(q.wordId, { learned: true });
    });
  };

  if (questions) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Hindi Word Quiz" subtitle={mode === 'practice' ? 'Practice: see the answer after each question' : 'Quiz: see your score at the end'} actions={<Button variant="ghost" size="sm" onClick={() => setQuestions(null)}>Close</Button>} />
        <Quiz questions={questions} mode={mode} onComplete={onComplete} onRetry={start} resultExtra={<Button variant="secondary" size="sm" className="mt-3" onClick={() => setQuestions(null)}>Choose another quiz</Button>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Hindi Word Quiz" subtitle="प्रश्नोत्तरी · 10 questions, Hindi ↔ English" back="/hindi" icon={ClipboardCheck} />
      <Card className="space-y-5">
        <ChoiceGroup label="Which words?" options={scopeOptions} value={scope} onChange={setScope} />
        <ChoiceGroup label="Mode" options={[{ id: 'practice', label: 'Practice (instant feedback)' }, { id: 'quiz', label: 'Quiz (score at the end)' }]} value={mode} onChange={setMode} />
        <Button block size="lg" onClick={start}>Start</Button>
      </Card>
    </div>
  );
}
