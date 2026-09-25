import { useState } from 'react';
import { ChevronDown, MessagesSquare, Play, Volume2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Icon from '../components/common/Icon.jsx';
import { CONVERSATION_MODES } from '../data/conversationModes.js';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { useApp } from '../context/AppContext.jsx';
import { cn } from '../utils/cn.js';

/** Role-play library: pick a real-life scenario, learn key phrases, then talk to Emma. */
export default function Conversation() {
  const { state } = useApp();
  const tts = useTextToSpeech();
  const [open, setOpen] = useState(null);
  const counts = state.sessions.filter((s) => s.type === 'speaking').reduce((acc, s) => ({ ...acc, [s.details?.mode]: (acc[s.details?.mode] || 0) + 1 }), {});

  return (
    <div>
      <PageHeader title="Conversation Practice" subtitle="Role-play real situations with Emma" icon={MessagesSquare} />
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Choose a scenario, warm up with useful phrases, then start the role-play. Emma plays the other person.</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {CONVERSATION_MODES.map((m) => {
          const isOpen = open === m.id;
          return (
            <li key={m.id}>
              <Card className="h-full">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><Icon name={m.icon} className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">{m.title}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{m.description}</p>
                    {counts[m.id] > 0 && <p className="mt-1 text-xs text-slate-500">Practised {counts[m.id]}×</p>}
                  </div>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm italic text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">Emma: “{m.opener}”</p>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : m.id)}
                  aria-expanded={isOpen}
                  aria-controls={`phrases-${m.id}`}
                  className="mt-3 flex w-full items-center justify-between rounded-lg py-1 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Useful phrases <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                </button>
                {isOpen && (
                  <ul id={`phrases-${m.id}`} className="mt-2 space-y-1.5">
                    {m.phrases.map((p) => (
                      <li key={p}>
                        <button type="button" onClick={() => tts.speak(p.replace(/…/g, ''))} disabled={!tts.supported} className="flex min-h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 text-left text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                          <Volume2 className="size-4 shrink-0 text-brand-600" aria-hidden="true" />{p}<span className="sr-only"> — listen</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <Button to={`/speak?mode=${m.id}`} block className="mt-3" icon={Play}>Start role-play</Button>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
