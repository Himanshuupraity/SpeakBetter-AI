import { Play } from 'lucide-react';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import ChoiceGroup from '../common/ChoiceGroup.jsx';
import Icon from '../common/Icon.jsx';
import EmmaAvatar from '../common/EmmaAvatar.jsx';
import { CONVERSATION_MODES, DIFFICULTIES, PERSONALITIES } from '../../data/conversationModes.js';
import { cn } from '../../utils/cn.js';
import StickyActions from '../common/StickyActions.jsx';

export default function SessionSetup({ config, setConfig, recommendedDifficulty, onStart, micNotice }) {
  const set = (patch) => setConfig((c) => ({ ...c, ...patch }));
  return (
    <div className="space-y-5">
      <Card className="flex items-center gap-4">
        <EmmaAvatar size="md" />
        <div>
          <p className="font-semibold">Talk with Emma</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">She won’t interrupt to correct you. Just speak naturally — you’ll get a full report with every mistake explained at the end.</p>
        </div>
      </Card>
      {micNotice}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Choose a topic</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONVERSATION_MODES.map((m) => {
            const active = config.mode === m.id;
            return (
              <label
                key={m.id}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-2xl border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                  active ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/15' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                )}
              >
                <input type="radio" name="mode" value={m.id} checked={active} onChange={() => set({ mode: m.id })} className="sr-only" />
                <Icon name={m.icon} className={cn('size-5', active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500')} />
                <span className="text-sm leading-tight font-semibold">{m.title}</span>
                <span className="hidden text-xs text-slate-500 sm:block">{m.description}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <ChoiceGroup
        label="Difficulty"
        options={DIFFICULTIES.map((d) => ({ ...d, label: d.id === recommendedDifficulty ? `${d.label} ★` : d.label }))}
        value={config.difficulty}
        onChange={(difficulty) => set({ difficulty })}
      />
      <p className="-mt-3 text-xs text-slate-500">★ Recommended by Emma based on your level and recent scores.</p>

      <ChoiceGroup label="Emma’s personality" variant="cards" columns="sm:grid-cols-2" options={PERSONALITIES} value={config.personality} onChange={(personality) => set({ personality })} />

      <StickyActions>
        <Button size="lg" block icon={Play} onClick={onStart}>Start conversation</Button>
      </StickyActions>
    </div>
  );
}
