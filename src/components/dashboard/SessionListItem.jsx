import { Link } from 'react-router-dom';
import { AudioLines, BookA, Gauge, BookOpen, ChevronRight, ClipboardCheck, GraduationCap, Headphones, Mic, PenLine } from 'lucide-react';
import { SESSION_TYPES } from '../../utils/stats.js';
import { formatDate, formatTime } from '../../utils/date.js';
import { scoreColor } from '../../utils/levels.js';
import { getMode } from '../../data/conversationModes.js';
import { cn } from '../../utils/cn.js';

export const SESSION_ICONS = { speaking: Mic, grammar: GraduationCap, vocabulary: BookA, writing: PenLine, reading: BookOpen, listening: Headphones, pronunciation: AudioLines, speed: Gauge, 'level-test': ClipboardCheck };

export default function SessionListItem({ session: s, showDate = true }) {
  const Icon = SESSION_ICONS[s.type] || Mic;
  const subtitle = s.type === 'speaking' ? getMode(s.details?.mode).title : SESSION_TYPES[s.type]?.label;
  return (
    <Link to={`/history/${s.id}`} className="flex min-h-16 items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{s.title}</p>
        <p className="truncate text-xs text-slate-500">
          {subtitle}{showDate && ` · ${formatDate(s.date, { day: 'numeric', month: 'short' })}, ${formatTime(s.date)}`} · {Math.max(1, Math.round(s.durationSec / 60))} min
        </p>
      </div>
      {typeof s.score === 'number' && <span className={cn('text-lg font-bold tabular-nums', scoreColor(s.score))}>{s.score}<span className="sr-only"> points</span></span>}
      <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
    </Link>
  );
}
