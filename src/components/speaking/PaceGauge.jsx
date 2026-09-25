/**
 * Speedometer for words per minute. Zones are labelled with text (Slow / Ideal /
 * Fast), so the meaning never depends on colour alone.
 */
import { PACE_SCALE } from '../../services/engine/paceAnalyzer.js';

const W = 260;
const H = 150;
const CX = W / 2;
const CY = 132;
const R = 104;

const angleOf = (v) => Math.PI - ((Math.min(PACE_SCALE.max, Math.max(PACE_SCALE.min, v)) - PACE_SCALE.min) / (PACE_SCALE.max - PACE_SCALE.min)) * Math.PI;
const point = (v, r = R) => [CX + r * Math.cos(angleOf(v)), CY - r * Math.sin(angleOf(v))];

function arc(from, to) {
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
}

export default function PaceGauge({ wpm, range, live }) {
  const [lo, hi] = range;
  const [nx, ny] = point(wpm ?? PACE_SCALE.min, R - 22);
  const labels = [
    { v: (PACE_SCALE.min + lo) / 2, text: 'Slow' },
    { v: (lo + hi) / 2, text: 'Ideal' },
    { v: (hi + PACE_SCALE.max) / 2, text: 'Fast' },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H + 8}`} className="mx-auto w-full max-w-xs" role="img" aria-label={wpm == null ? `Ideal pace ${lo} to ${hi} words per minute` : `${wpm} words per minute. Ideal is ${lo} to ${hi}.`}>
      <path d={arc(PACE_SCALE.min, lo - 1)} className="fill-none stroke-amber-400" strokeWidth="14" strokeLinecap="round" />
      <path d={arc(lo + 1, hi - 1)} className="fill-none stroke-emerald-500" strokeWidth="14" />
      <path d={arc(hi + 1, PACE_SCALE.max)} className="fill-none stroke-rose-500" strokeWidth="14" strokeLinecap="round" />
      {labels.map((l) => {
        const [x, y] = point(l.v, R + 18);
        return <text key={l.text} x={x} y={y + 4} textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold dark:fill-slate-400">{l.text}</text>;
      })}
      {[lo, hi].map((v) => {
        const [x, y] = point(v, R - 16);
        return <text key={v} x={x} y={y + 3} textAnchor="middle" className="fill-slate-400 text-[9px]">{v}</text>;
      })}
      {wpm != null && (
        <>
          <line x1={CX} y1={CY} x2={nx} y2={ny} className="stroke-slate-800 transition-all duration-500 dark:stroke-slate-100" strokeWidth="3" strokeLinecap="round" />
          <circle cx={CX} cy={CY} r="7" className="fill-slate-800 dark:fill-slate-100" />
        </>
      )}
      <text x={CX} y={CY - 34} textAnchor="middle" className="fill-slate-900 text-[30px] font-extrabold dark:fill-white">{wpm ?? '–'}</text>
      <text x={CX} y={CY - 18} textAnchor="middle" className="fill-slate-500 text-[10px] dark:fill-slate-400">{live ? 'words / min (live)' : 'words per minute'}</text>
    </svg>
  );
}
