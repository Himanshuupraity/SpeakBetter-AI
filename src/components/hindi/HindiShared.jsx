import { Snail, Volume2 } from 'lucide-react';
import Alert from '../common/Alert.jsx';
import { cn } from '../../utils/cn.js';

/** Listen (normal) + listen slowly buttons for a piece of Hindi. */
export function ListenButtons({ text, speak, label, className, size = 'md' }) {
  const dims = size === 'sm' ? 'size-9' : 'size-10';
  return (
    <div className={cn('flex shrink-0 gap-1', className)}>
      <button type="button" onClick={() => speak(text)} className={cn('grid place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800', dims)} aria-label={`Listen to ${label || text}`}>
        <Volume2 className="size-5" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => speak(text, { slow: true })} className={cn('grid place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800', dims)} aria-label={`Listen slowly to ${label || text}`}>
        <Snail className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Shown when the device has no Hindi voice, so audio may sound wrong or be silent. */
export function HindiVoiceNotice({ voice, className }) {
  if (!voice.supported) {
    return <Alert tone="warning" className={className} title="Audio isn’t available">This browser can’t read text aloud. Try Chrome, Edge or Safari.</Alert>;
  }
  if (!voice.voicesLoaded || voice.hasVoice) return null;
  return (
    <Alert tone="warning" className={className} title="No Hindi voice found on this device">
      Audio may be silent or sound English. Chrome includes a Hindi voice. On a Mac, add one in System Settings → Accessibility → Spoken Content → System voice → Manage Voices → Hindi. On Windows, add Hindi in Settings → Time &amp; language → Speech. On Android, install Hindi in Google’s text-to-speech settings.
    </Alert>
  );
}

/** Large Devanagari text with its romanisation and English meaning underneath. */
export function HindiText({ hi, roman, en, className, big }) {
  return (
    <div className={className}>
      <p lang="hi" className={cn('font-semibold leading-snug', big ? 'text-3xl' : 'text-xl')}>{hi}</p>
      {roman && <p className="text-sm text-brand-700 italic dark:text-brand-300">{roman}</p>}
      {en && <p className="text-sm text-slate-600 dark:text-slate-400">{en}</p>}
    </div>
  );
}
