export default function Logo({ compact }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-xl bg-brand-600 text-white shadow-sm" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M5 7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5l-4 3.5V16a3 3 0 0 1-2-2.8z" /><circle cx="9.5" cy="10" r="1.1" className="fill-brand-600" /><circle cx="12" cy="10" r="1.1" className="fill-brand-600" /><circle cx="14.5" cy="10" r="1.1" className="fill-brand-600" /></svg>
      </span>
      <span className="text-[17px] font-bold tracking-tight">
        SpeakBetter<span className="text-brand-600 dark:text-brand-400"> AI</span>
      </span>
      {!compact && <span className="sr-only">Home</span>}
    </span>
  );
}
