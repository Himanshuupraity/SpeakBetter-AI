import { cn } from '../../utils/cn.js';

/** Emma, the AI coach. `state`: idle | speaking | listening | thinking */
export default function EmmaAvatar({ size = 'md', state = 'idle', className }) {
  const dims = { sm: 'size-9 text-sm', md: 'size-14 text-xl', lg: 'size-24 text-3xl' }[size];
  return (
    <div className={cn('relative shrink-0', className)}>
      {state === 'speaking' && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400" aria-hidden="true" />}
      <div className={cn('relative grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 font-bold text-white shadow-md ring-4 ring-white dark:ring-slate-900', dims)} aria-hidden="true">
        E
      </div>
      <span
        className={cn(
          'absolute right-0 bottom-0 size-3.5 rounded-full ring-2 ring-white dark:ring-slate-900',
          state === 'listening' ? 'bg-rose-500' : state === 'thinking' ? 'bg-amber-400' : 'bg-emerald-500',
          size === 'lg' && 'size-5',
        )}
        aria-hidden="true"
      />
    </div>
  );
}
