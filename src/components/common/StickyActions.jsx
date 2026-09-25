import { cn } from '../../utils/cn.js';

/** Primary action pinned above the mobile bottom nav, with a solid fade so it never overlaps content. */
export default function StickyActions({ children, className }) {
  return (
    <div className={cn('sticky bottom-16 z-10 -mx-4 mt-4 bg-gradient-to-t from-slate-50 from-70% to-transparent px-4 pt-6 pb-3 sm:-mx-6 sm:px-6 lg:bottom-0 lg:-mx-8 lg:px-8 dark:from-slate-950', className)}>
      {children}
    </div>
  );
}
