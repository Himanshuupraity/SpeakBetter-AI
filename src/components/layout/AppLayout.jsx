import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Flame, WifiOff, Zap } from 'lucide-react';
import { BOTTOM_NAV, NAV_GROUPS } from './navigation.js';
import { useApp } from '../../context/AppContext.jsx';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';
import { aiService } from '../../services/aiService.js';
import { xpLevel } from '../../utils/levels.js';
import { cn } from '../../utils/cn.js';
import Logo from './Logo.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import CreditFooter from './CreditFooter.jsx';

function Sidebar() {
  const { state, stats } = useApp();
  const lvl = xpLevel(state.xp);
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
        <Link to="/" className="inline-flex rounded-lg"><Logo /></Link>
        <ThemeToggle />
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="mt-4">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{g.label}</p>
            <ul>
              {g.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                        isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                      )
                    }
                  >
                    <item.icon className="size-[18px]" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{lvl.current.name}</span>
          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400"><Flame className="size-4" aria-hidden="true" />{stats.streak}<span className="sr-only">day streak</span></span>
        </div>
        <ProgressBar value={lvl.progress * 100} size="sm" className="mt-2" label="Progress to next level" />
        <p className="mt-1.5 text-xs text-slate-500">{state.xp} XP{lvl.next ? ` · ${lvl.next.minXp - state.xp} to ${lvl.next.name}` : ''}</p>
      </div>
    </aside>
  );
}

function MobileTopBar() {
  const { state, stats } = useApp();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/85">
      <Link to="/" className="rounded-lg"><Logo compact /></Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link to="/progress" className="flex h-9 items-center gap-1 rounded-full bg-orange-50 px-3 text-sm font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" aria-label={`${stats.streak} day streak`}>
          <Flame className="size-4" aria-hidden="true" /> {stats.streak}
        </Link>
        <Link to="/progress" className="flex h-9 items-center gap-1 rounded-full bg-brand-50 px-3 text-sm font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" aria-label={`${state.xp} XP`}>
          <Zap className="size-4" aria-hidden="true" /> {state.xp}
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (item) => item.match.some((m) => (m === '/' ? pathname === '/' : pathname.startsWith(m)));
  return (
    <nav aria-label="Main" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {BOTTOM_NAV.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium', active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400')}
              >
                <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', active && 'bg-brand-50 dark:bg-brand-500/15')}>
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function AppLayout() {
  const online = useOnlineStatus();
  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only z-50 rounded-lg bg-brand-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">Skip to content</a>
      <Sidebar />
      <div className="lg:pl-64">
        <MobileTopBar />
        {!online && (
          <div role="status" className="flex items-center justify-center gap-2 bg-slate-800 px-4 py-2 text-center text-sm text-white">
            <WifiOff className="size-4" aria-hidden="true" /> You’re offline. Demo practice still works; speech recognition may not.
          </div>
        )}
        {aiService.isDemo && (
          <div className="hidden justify-end px-8 pt-4 lg:flex">
            <Link to="/settings#ai" className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300">Demo AI mode</Link>
          </div>
        )}
        <main id="main" className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-4 lg:pb-12">
          <Outlet />
          <CreditFooter className="mt-8" />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
