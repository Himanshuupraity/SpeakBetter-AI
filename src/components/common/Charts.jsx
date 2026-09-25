/**
 * Lightweight, dependency-free SVG charts (responsive via viewBox).
 * One series per chart (small multiples) — the card title names the series,
 * so no legend is needed and identity never relies on colour.
 */
import { useId, useState } from 'react';
import { cn } from '../../utils/cn.js';

const W = 320;
const PAD = { top: 16, right: 12, bottom: 26, left: 30 };

export function LineChart({ data, height = 170, min = 0, max = 100, unit = '', label, band }) {
  const [hover, setHover] = useState(null);
  const gradId = useId();
  const H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  // Values outside the axis range are drawn at the edge (the tooltip still shows the real value).
  const y = (v) => PAD.top + innerH - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * innerH;
  const points = data.map((d, i) => ({ ...d, i, px: x(i), py: d.value == null ? null : y(d.value) }));
  const valid = points.filter((p) => p.py != null);
  const path = valid.map((p, i) => `${i ? 'L' : 'M'}${p.px},${p.py}`).join(' ');
  const area = valid.length > 1 ? `${path} L${valid[valid.length - 1].px},${PAD.top + innerH} L${valid[0].px},${PAD.top + innerH} Z` : '';
  const ticks = band ? [min, band[0], band[1], max] : [min, (min + max) / 2, max];
  const active = hover != null ? points[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none" role="img" aria-label={label} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-brand-500)]" stopOpacity="0.18" />
            <stop offset="100%" className="[stop-color:var(--color-brand-500)]" stopOpacity="0" />
          </linearGradient>
        </defs>
        {band && (
          <rect x={PAD.left} y={y(band[1])} width={innerW} height={y(band[0]) - y(band[1])} className="fill-emerald-500/10 dark:fill-emerald-400/10" />
        )}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" className="fill-slate-400 text-[10px]">{Math.round(t)}</text>
          </g>
        ))}
        {points.map((p) => (
          <text key={p.label} x={p.px} y={H - 8} textAnchor="middle" className={cn('text-[10px]', hover === p.i ? 'fill-slate-700 dark:fill-slate-200' : 'fill-slate-400')}>{p.label}</text>
        ))}
        {area && <path d={area} fill={`url(#${gradId})`} />}
        {path && <path d={path} className="fill-none stroke-brand-600 dark:stroke-brand-400" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {active?.py != null && <line x1={active.px} x2={active.px} y1={PAD.top} y2={PAD.top + innerH} className="stroke-slate-300 dark:stroke-slate-600" strokeDasharray="3 3" />}
        {valid.map((p) => (
          <circle key={p.i} cx={p.px} cy={p.py} r={hover === p.i ? 5 : 4} className="fill-brand-600 stroke-white dark:fill-brand-400 dark:stroke-slate-900" strokeWidth="2" />
        ))}
        {points.map((p) => (
          <rect
            key={`hit-${p.i}`}
            x={p.px - innerW / Math.max(2, (data.length - 1) * 2)}
            y={PAD.top}
            width={innerW / Math.max(1, data.length - 1)}
            height={innerH}
            fill="transparent"
            onPointerEnter={() => setHover(p.i)}
            onPointerDown={() => setHover(p.i)}
          />
        ))}
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow dark:bg-slate-100 dark:text-slate-900"
          style={{ left: `${(active.px / W) * 100}%` }}
        >
          {active.label}: {active.value == null ? 'no data' : `${active.value}${unit}`}
        </div>
      )}
    </div>
  );
}

export function BarChart({ data, height = 150, unit = '', label, goal }) {
  const [hover, setHover] = useState(null);
  const H = height;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(goal || 0, ...data.map((d) => d.value), 1) * 1.1;
  const slot = innerW / data.length;
  const barW = Math.min(28, slot * 0.6);
  const y = (v) => PAD.top + innerH - (v / max) * innerH;
  const active = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label={label} onPointerLeave={() => setHover(null)}>
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} className="stroke-slate-200 dark:stroke-slate-800" />
        {goal ? (
          <g>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(goal)} y2={y(goal)} className="stroke-slate-400 dark:stroke-slate-500" strokeDasharray="4 4" />
            <text x={PAD.left - 6} y={y(goal) + 3.5} textAnchor="end" className="fill-slate-500 text-[10px]">{goal}</text>
          </g>
        ) : null}
        {data.map((d, i) => {
          const h = Math.max(d.value ? 3 : 0, (d.value / max) * innerH);
          const bx = PAD.left + i * slot + (slot - barW) / 2;
          const by = PAD.top + innerH - h;
          const r = Math.min(4, h / 2, barW / 2);
          const path = h ? `M${bx},${PAD.top + innerH} V${by + r} Q${bx},${by} ${bx + r},${by} H${bx + barW - r} Q${bx + barW},${by} ${bx + barW},${by + r} V${PAD.top + innerH} Z` : '';
          return (
            <g key={d.key || d.label} onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)}>
              <rect x={PAD.left + i * slot} y={PAD.top} width={slot} height={innerH} fill="transparent" />
              {path && <path d={path} className={cn(goal && d.value >= goal ? 'fill-emerald-500' : 'fill-brand-500 dark:fill-brand-400', hover === i && 'opacity-80')} />}
              <text x={bx + barW / 2} y={H - 8} textAnchor="middle" className={cn('text-[10px]', hover === i ? 'fill-slate-700 dark:fill-slate-200' : 'fill-slate-400')}>{d.label}</text>
            </g>
          );
        })}
      </svg>
      {active && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow dark:bg-slate-100 dark:text-slate-900" style={{ left: `${((PAD.left + hover * slot + slot / 2) / W) * 100}%` }}>
          {active.label}: {active.value}{unit}
        </div>
      )}
    </div>
  );
}

/** Screen-reader / "table view" alternative for any chart. */
export function ChartTable({ data, valueLabel = 'Value', unit = '', caption }) {
  return (
    <details className="mt-2 text-xs text-slate-500">
      <summary className="cursor-pointer rounded select-none hover:text-slate-700 dark:hover:text-slate-300">Show as table</summary>
      <table className="mt-2 w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800"><th className="py-1 font-medium">Period</th><th className="py-1 text-right font-medium">{valueLabel}</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key || d.label} className="border-b border-slate-100 dark:border-slate-800/60">
              <td className="py-1">{d.label}</td>
              <td className="py-1 text-right tabular-nums">{d.value == null ? '—' : `${d.value}${unit}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
