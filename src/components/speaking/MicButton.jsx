import { Mic, Square } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/** Large, thumb-friendly microphone button with a recording pulse. */
export default function MicButton({ listening, disabled, onClick, size = 'lg', label }) {
  const dims = size === 'lg' ? 'size-20' : 'size-16';
  return (
    <div className="relative grid place-items-center">
      {listening && (
        <>
          <span className={cn('absolute animate-pulse-ring rounded-full bg-rose-500', dims)} aria-hidden="true" />
          <span className={cn('absolute animate-pulse-ring rounded-full bg-rose-500 [animation-delay:0.5s]', dims)} aria-hidden="true" />
        </>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={label || (listening ? 'Stop recording and send' : 'Tap to speak')}
        className={cn(
          'relative grid place-items-center rounded-full text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:shadow-none',
          dims,
          listening ? 'bg-rose-500 hover:bg-rose-600' : 'bg-brand-600 hover:bg-brand-700',
        )}
      >
        {listening ? <Square className="size-7 fill-current" aria-hidden="true" /> : <Mic className="size-8" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function SoundBars({ className }) {
  return (
    <span className={cn('inline-flex h-4 items-end gap-0.5', className)} aria-hidden="true">
      {[0, 0.2, 0.4, 0.1].map((d) => (
        <span key={d} className="h-full w-1 origin-bottom animate-bar rounded-full bg-current" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}
