import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { cn } from '../../utils/cn.js';

const prefersDark = () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

/** One-tap light/dark switch. Settings still offers "System" to follow the device. */
export default function ThemeToggle({ className, showLabel }) {
  const { state, updateSettings } = useApp();
  const { theme } = state.settings;
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white',
        showLabel ? 'px-3 text-sm font-medium' : 'w-9',
        className,
      )}
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      {showLabel && (isDark ? 'Light mode' : 'Dark mode')}
    </button>
  );
}
