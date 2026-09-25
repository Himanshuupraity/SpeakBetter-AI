import { useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Check, Lightbulb, X } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import Tabs, { TabPanel } from '../components/common/Tabs.jsx';
import Quiz from '../components/common/Quiz.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import EmmaAvatar from '../components/common/EmmaAvatar.jsx';
import Badge from '../components/common/Badge.jsx';
import { getTopic, quizMistakes } from '../services/grammarService.js';
import { aiService } from '../services/aiService.js';
import { useApp } from '../context/AppContext.jsx';
import { MISTAKE_CATEGORIES } from '../services/engine/grammarRules.js';
import { seededShuffle } from '../utils/date.js';

const TABS = [
  { id: 'learn', label: 'Learn' },
  { id: 'practice', label: 'Practice' },
  { id: 'quiz', label: 'Quiz' },
];

/** Grammar topic → mistake category, so wrong quiz answers land in the right weak area. */
const TOPIC_CATEGORY = Object.entries(MISTAKE_CATEGORIES).reduce((acc, [k, v]) => (v.topic && !acc[v.topic] ? { ...acc, [v.topic]: k } : acc), {});

export default function GrammarTopic() {
  const { topicId } = useParams();
  const [params, setParams] = useSearchParams();
  const topic = getTopic(topicId);
  const { recordSession } = useApp();
  const tab = TABS.some((t) => t.id === params.get('mode')) ? params.get('mode') : 'learn';
  const [comment, setComment] = useState(null);
  const [quizKey, setQuizKey] = useState(0);
  const startedAt = useRef(Date.now());

  if (!topic) {
    return (
      <div>
        <PageHeader title="Topic not found" back="/grammar" />
        <EmptyState title="This grammar topic doesn’t exist" action={<Button to="/grammar">All topics</Button>} />
      </div>
    );
  }

  const setTab = (id) => {
    setParams(id === 'learn' ? {} : { mode: id }, { replace: true });
    startedAt.current = Date.now();
    setComment(null);
  };

  const onQuizComplete = async (graded, mode) => {
    const category = TOPIC_CATEGORY[topic.id] || 'sentence';
    recordSession({
      type: 'grammar',
      title: `${topic.title} ${mode === 'quiz' ? 'Quiz' : 'Practice'}`,
      durationSec: (Date.now() - startedAt.current) / 1000,
      score: graded.score,
      skills: { grammar: graded.score },
      details: { topicId: topic.id, mode, correct: graded.correct, total: graded.total, results: graded.results },
      mistakes: quizMistakes(graded, { source: 'grammar', category, topic: topic.id }),
    });
    const res = await aiService.analyzeGrammar({ topicTitle: topic.title, results: graded.results });
    setComment(res.comment);
  };

  const practiceQuestions = seededShuffle(topic.questions, `${topic.id}-${quizKey}`);

  return (
    <div>
      <PageHeader title={topic.title} subtitle={topic.summary} back="/grammar" actions={<Badge>{topic.level}</Badge>} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} label={`${topic.title} sections`} />

      {tab === 'learn' && (
        <TabPanel id="learn">
          <div className="space-y-5">
            <Card>
              <CardTitle icon={Lightbulb}>Simple explanation</CardTitle>
              <div className="space-y-2 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {topic.explanation.map((p) => <p key={p}>{p}</p>)}
              </div>
            </Card>

            {topic.sections?.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {topic.sections.map((s) => (
                  <Card key={s.title}>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.rule}</p>
                    <ul className="mt-2 space-y-1">
                      {s.examples.map((e) => <li key={e} className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm dark:bg-slate-800/60">{e}</li>)}
                    </ul>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardTitle>Examples</CardTitle>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {topic.examples.map((e) => (
                  <li key={e.sentence} className="py-2.5">
                    <p className="font-medium">{e.sentence}</p>
                    <p className="text-sm text-slate-500">{e.note}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardTitle>Common mistakes</CardTitle>
              <ul className="space-y-3">
                {topic.commonMistakes.map((m) => (
                  <li key={m.wrong} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                    <p className="flex gap-2 text-rose-700 dark:text-rose-300"><X className="mt-0.5 size-4 shrink-0" aria-label="Wrong" />{m.wrong}</p>
                    <p className="mt-1 flex gap-2 font-medium text-emerald-700 dark:text-emerald-300"><Check className="mt-0.5 size-4 shrink-0" aria-label="Correct" />{m.right}</p>
                    <p className="mt-1.5 text-slate-600 dark:text-slate-400">{m.why}</p>
                  </li>
                ))}
              </ul>
            </Card>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button size="lg" onClick={() => setTab('practice')}>Start practice</Button>
              <Button size="lg" variant="outline" onClick={() => setTab('quiz')}>Take the quiz</Button>
            </div>
          </div>
        </TabPanel>
      )}

      {tab !== 'learn' && (
        <TabPanel id={tab}>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            {tab === 'practice' ? 'Practice mode: you’ll see the answer and explanation after every question.' : 'Quiz mode: answer all questions, then see your score and explanations for any wrong answers.'}
          </p>
          <Quiz
            key={`${tab}-${quizKey}`}
            questions={tab === 'practice' ? practiceQuestions : topic.questions}
            mode={tab}
            onComplete={(g) => onQuizComplete(g, tab)}
            onRetry={() => {
              setQuizKey((k) => k + 1);
              setComment(null);
              startedAt.current = Date.now();
            }}
            resultExtra={
              comment && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-brand-50/70 p-3 text-left dark:bg-brand-500/10">
                  <EmmaAvatar size="sm" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">{comment}</p>
                </div>
              )
            }
          />
        </TabPanel>
      )}
    </div>
  );
}
