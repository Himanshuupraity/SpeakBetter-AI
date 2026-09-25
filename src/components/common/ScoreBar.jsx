import ProgressBar from './ProgressBar.jsx';
import { scoreColor } from '../../utils/levels.js';
import { cn } from '../../utils/cn.js';

/** Label + percentage + bar. value null = not measured. */
export default function ScoreBar({ label, value, hint, suffix = '%' }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className={cn('font-semibold tabular-nums', value == null ? 'text-slate-400' : scoreColor(value))}>{value == null ? '—' : `${value}${suffix}`}</span>
      </div>
      <ProgressBar value={value ?? 0} label={`${label} ${value ?? 'not measured'}`} />
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
