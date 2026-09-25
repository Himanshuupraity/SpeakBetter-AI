import { LoaderCircle } from 'lucide-react';

export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500" role="status">
      <LoaderCircle className="size-8 animate-spin text-brand-600" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
