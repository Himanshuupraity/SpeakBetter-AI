import { useRef } from 'react';
import { cn } from '../../utils/cn.js';

/** Accessible tabs (arrow-key navigation). tabs: [{ id, label }] */
export default function Tabs({ tabs, value, onChange, label, className }) {
  const refs = useRef({});
  const onKey = (e, i) => {
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (next) {
      e.preventDefault();
      onChange(next.id);
      refs.current[next.id]?.focus();
    }
  };
  return (
    <div role="tablist" aria-label={label} className={cn('flex gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80', className)}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => (refs.current[t.id] = el)}
          role="tab"
          type="button"
          id={`tab-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={value === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
          className={cn('h-10 flex-1 rounded-xl px-3 text-sm font-semibold transition-colors', value === t.id ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ id, children }) {
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className="mt-4 animate-fade-in">
      {children}
    </div>
  );
}
