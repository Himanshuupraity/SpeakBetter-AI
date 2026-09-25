import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CircleCheck, Info, TriangleAlert, Trophy, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const ToastContext = createContext(null);

const ICONS = { success: CircleCheck, info: Info, warning: TriangleAlert, achievement: Trophy };
const STYLES = {
  success: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-brand-600 dark:text-brand-400',
  warning: 'text-amber-600 dark:text-amber-400',
  achievement: 'text-amber-500',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (message, { type = 'info', title, duration = 3500 } = {}) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-2), { id, message, type, title }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-fade-in items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <Icon className={cn('mt-0.5 size-5 shrink-0', STYLES[t.type])} aria-hidden="true" />
              <div className="min-w-0 flex-1 text-sm">
                {t.title && <p className="font-semibold">{t.title}</p>}
                <p className="text-slate-600 dark:text-slate-300">{t.message}</p>
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600" aria-label="Dismiss notification">
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
