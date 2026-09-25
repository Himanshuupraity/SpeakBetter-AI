import { useEffect, useRef } from 'react';
import Button from './Button.jsx';

/** Accessible in-app confirmation dialog (no blocking browser confirm()). */
export default function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      aria-labelledby="confirm-title"
    >
      <div className="p-5">
        <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{children}</div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" block onClick={onCancel}>Cancel</Button>
          <Button variant={tone} block onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
