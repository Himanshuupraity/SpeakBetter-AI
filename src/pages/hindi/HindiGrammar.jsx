import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, GraduationCap } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Quiz from '../../components/common/Quiz.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Tabs, { TabPanel } from '../../components/common/Tabs.jsx';
import { HindiVoiceNotice, ListenButtons } from '../../components/hindi/HindiShared.jsx';
import { HINDI_LESSONS } from '../../data/hindi.js';
import { useApp } from '../../context/AppContext.jsx';
import { useHindiVoice } from '../../hooks/useHindiVoice.js';
import { quizMistakes } from '../../services/grammarService.js';
import { scoreColor } from '../../utils/levels.js';
import { cn } from '../../utils/cn.js';

function LessonList() {
  const { state } = useApp();
  const best = {};
  state.sessions.filter((s) => s.type === 'hindi' && s.details?.lessonId).forEach((s) => {
    best[s.details.lessonId] = Math.max(best[s.details.lessonId] || 0, s.score);
  });
  return (
    <div>
      <PageHeader title="Hindi Grammar" subtitle="व्याकरण · Short, simple lessons with quizzes" back="/hindi" icon={GraduationCap} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {HINDI_LESSONS.map((l, i) => (
          <li key={l.id}>
            <Link to={`/hindi/grammar/${l.id}`} className="flex h-full items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 lang="hi" className="font-semibold">{l.title}</h2>
                  <Badge>{l.level}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{l.summary}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {l.quiz.length} questions{best[l.id] != null && <> · Best: <span className={cn('font-semibold', scoreColor(best[l.id]))}>{best[l.id]}%</span></>}
                </p>
              </div>
              <ChevronRight className="mt-1 size-5 shrink-0 text-slate-400" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Lesson({ lesson }) {
  const { recordSession } = useApp();
  const voice = useHindiVoice();
  const [tab, setTab] = useState('learn');
  const startedAt = useRef(Date.now());
  const idx = HINDI_LESSONS.indexOf(lesson);
  const nextLesson = HINDI_LESSONS[idx + 1];

  const onComplete = (graded) => {
    const mistakes = quizMistakes(graded, { source: 'hindi', category: 'hindi', topic: null });
    recordSession({
      type: 'hindi',
      title: `Hindi grammar: ${lesson.title}`,
      durationSec: (Date.now() - startedAt.current) / 1000,
      score: graded.score,
      skills: { hindi: graded.score },
      details: { activity: 'grammar', lessonId: lesson.id, correct: graded.correct, total: graded.total, results: graded.results },
      mistakes,
    });
  };

  return (
    <div>
      <PageHeader title={lesson.title} subtitle={`Lesson ${idx + 1} of ${HINDI_LESSONS.length} · ${lesson.level}`} back="/hindi/grammar" />
      <Tabs tabs={[{ id: 'learn', label: 'Learn' }, { id: 'quiz', label: `Quiz (${lesson.quiz.length})` }]} value={tab} onChange={setTab} label="Lesson sections" />
      {tab === 'learn' && (
        <TabPanel id="learn">
          <HindiVoiceNotice voice={voice} className="mb-4" />
          <Card className="mb-4"><p>{lesson.summary}</p></Card>
          <ol className="space-y-3">
            {lesson.rules.map((r, i) => (
              <li key={i}>
                <Card>
                  <p lang="hi" className="font-semibold">{r.text}</p>
                  {r.examples.map((e) => (
                    <div key={e.hi} className="mt-2 flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                      <div>
                        <p lang="hi" className="text-lg">{e.hi}</p>
                        <p className="text-sm text-brand-700 italic dark:text-brand-300">{e.roman}</p>
                        <p className="text-sm text-slate-500">{e.en}</p>
                      </div>
                      <ListenButtons text={e.hi} speak={voice.speak} label={e.roman} size="sm" />
                    </div>
                  ))}
                </Card>
              </li>
            ))}
          </ol>
          <Button block size="lg" className="mt-4" onClick={() => setTab('quiz')}>Take the quiz</Button>
        </TabPanel>
      )}
      {tab === 'quiz' && (
        <TabPanel id="quiz">
          <Quiz
            key={lesson.id}
            questions={lesson.quiz}
            mode="practice"
            onComplete={onComplete}
            onRetry={() => (startedAt.current = Date.now())}
            resultExtra={nextLesson && <Button to={`/hindi/grammar/${nextLesson.id}`} variant="secondary" size="sm" className="mt-3">Next lesson: {nextLesson.title}</Button>}
          />
        </TabPanel>
      )}
    </div>
  );
}

export default function HindiGrammar() {
  const { lessonId } = useParams();
  if (!lessonId) return <LessonList />;
  const lesson = HINDI_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return <EmptyState icon={GraduationCap} title="Lesson not found" action={<Button to="/hindi/grammar">All lessons</Button>}>This lesson doesn’t exist.</EmptyState>;
  return <Lesson key={lesson.id} lesson={lesson} />;
}
