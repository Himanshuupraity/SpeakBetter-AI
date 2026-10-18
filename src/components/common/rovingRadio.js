/**
 * Arrow-key navigation for custom role="radio" button groups (roving tabindex:
 * only the checked radio — or the first, if none is — has tabIndex 0).
 * Arrow keys / Home / End move focus to the next radio in the same group and
 * call onMove(nextIndex) so the caller can select it. Returns true if handled.
 */
export function onRadioKeyDown(e, index, count, onMove) {
  let next = null;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % count;
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + count) % count;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = count - 1;
  if (next == null) return false;
  e.preventDefault();
  const group = e.currentTarget.closest('[role="radiogroup"]');
  group?.querySelectorAll('[role="radio"]')[next]?.focus();
  onMove?.(next);
  return true;
}

/** tabIndex for radio `index` when `checkedIndex` (or -1/undefined) is selected. */
export const radioTabIndex = (index, checkedIndex) => (index === (checkedIndex == null || checkedIndex < 0 ? 0 : checkedIndex) ? 0 : -1);
