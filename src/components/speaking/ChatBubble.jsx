import { Keyboard, Mic, Volume2 } from 'lucide-react';
import EmmaAvatar from '../common/EmmaAvatar.jsx';
import { cn } from '../../utils/cn.js';

export default function ChatBubble({ message, onReplay, interim }) {
  const isAi = message.role === 'ai';
  return (
    <li className={cn('flex animate-fade-in items-end gap-2', isAi ? 'justify-start' : 'justify-end')}>
      {isAi && <EmmaAvatar size="sm" className="mb-1 hidden sm:block" />}
      <div className={cn('max-w-[85%] sm:max-w-[75%]')}>
        <p className="sr-only">{isAi ? 'Emma said:' : 'You said:'}</p>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed',
            isAi ? 'rounded-bl-md bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700' : 'rounded-br-md bg-brand-600 text-white',
            interim && 'bg-brand-500/70 italic',
          )}
        >
          {message.text}
        </div>
        <div className={cn('mt-1 flex items-center gap-2 px-1 text-[11px] text-slate-400', !isAi && 'justify-end')}>
          {isAi && onReplay && (
            <button type="button" onClick={() => onReplay(message.text)} className="-m-1 inline-flex items-center gap-1 rounded-lg p-1 font-medium text-slate-500 hover:text-brand-600" aria-label="Play Emma's message again">
              <Volume2 className="size-3.5" aria-hidden="true" /> Play
            </button>
          )}
          {!isAi && !interim && (message.viaVoice ? <Mic className="size-3" aria-label="Spoken" /> : <Keyboard className="size-3" aria-label="Typed" />)}
          {interim && <span>Listening…</span>}
        </div>
      </div>
    </li>
  );
}
