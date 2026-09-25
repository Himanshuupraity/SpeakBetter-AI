export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
      {Icon && (
        <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800" aria-hidden="true">
          <Icon className="size-6" />
        </span>
      )}
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
