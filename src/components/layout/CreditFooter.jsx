import { cn } from '../../utils/cn.js';

export default function CreditFooter({ className }) {
  return (
    <footer className={cn('py-6 text-center text-xs text-slate-500 dark:text-slate-400', className)}>
      Created by <span className="font-semibold text-slate-700 dark:text-slate-200">Himanshu Upraity</span>
    </footer>
  );
}
