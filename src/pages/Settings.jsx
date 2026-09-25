import { useEffect, useRef, useState } from 'react';
import { Bot, ClipboardCheck, Database, Download, Moon, Monitor, Palette, RefreshCw, Sun, Trash, Upload, User, Volume2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardTitle } from '../components/common/Card.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import Button from '../components/common/Button.jsx';
import Alert from '../components/common/Alert.jsx';
import Badge from '../components/common/Badge.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { aiService } from '../services/aiService.js';
import { speechService } from '../services/speechService.js';
import { storageService } from '../services/storageService.js';
import { CEFR_LEVELS } from '../utils/levels.js';
import { DAILY_GOALS } from '../utils/plan.js';
import { DIFFICULTIES, PERSONALITIES } from '../data/conversationModes.js';
import { GOALS } from './Onboarding.jsx';

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block font-medium">{label}</span>
        {description && <span className="block text-sm text-slate-500">{description}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 dark:bg-slate-600" />
    </label>
  );
}

export default function Settings() {
  const { state, updateProfile, updateSettings, loadDemoData, clearDemoData, resetAll, importState } = useApp();
  const { profile, settings } = state;
  const toast = useToast();
  const tts = useTextToSpeech();
  const [name, setName] = useState(profile.name);
  const [confirm, setConfirm] = useState(null);
  const fileRef = useRef(null);
  const englishVoices = tts.voices.filter((v) => /^en[-_]/i.test(v.lang));

  useEffect(() => {
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, []);

  const exportData = () => {
    const url = URL.createObjectURL(storageService.exportData(state));
    const a = document.createElement('a');
    a.href = url;
    a.download = `speakbetter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      importState(await file.text());
      toast.show('Your data was imported.', { type: 'success' });
    } catch {
      toast.show('That file could not be read. Please choose a SpeakBetter backup (.json).', { type: 'warning' });
    }
    e.target.value = '';
  };

  const runConfirm = () => {
    if (confirm === 'clear') {
      clearDemoData();
      toast.show('Sample data cleared. Only your own practice remains.', { type: 'success' });
    }
    if (confirm === 'reset') {
      resetAll();
      window.location.assign('/welcome');
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Profile & Settings" icon={User} />

      <Card>
        <CardTitle icon={User}>Profile</CardTitle>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            updateProfile({ name: name.trim() });
            toast.show('Name updated.', { type: 'success' });
          }}
        >
          <label htmlFor="pname" className="sr-only">Your name</label>
          <input id="pname" value={name} onChange={(e) => setName(e.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" />
          <Button type="submit" variant="secondary" disabled={!name.trim() || name.trim() === profile.name}>Save</Button>
        </form>
        <div className="mt-4 space-y-4">
          <ChoiceGroup label="English level" options={CEFR_LEVELS.map((l) => ({ id: l.id, label: `${l.id} · ${l.label}` }))} value={profile.level} onChange={(level) => updateProfile({ level })} />
          <ChoiceGroup label="Main goal" options={GOALS.map(({ id, label }) => ({ id, label }))} value={profile.goal} onChange={(goal) => updateProfile({ goal })} />
          <ChoiceGroup label="Daily goal" options={DAILY_GOALS.map((m) => ({ id: m, label: `${m} min` }))} value={profile.dailyMinutes} onChange={(dailyMinutes) => updateProfile({ dailyMinutes })} />
          <Button to="/level-test" variant="outline" icon={ClipboardCheck}>{profile.levelTest ? `Retake level test (last: ${profile.levelTest.level})` : 'Take the level test'}</Button>
        </div>
      </Card>

      <Card>
        <CardTitle icon={Palette}>Appearance</CardTitle>
        <ChoiceGroup
          label="Theme"
          hideLabel
          options={[{ id: 'light', label: 'Light', icon: Sun }, { id: 'dark', label: 'Dark', icon: Moon }, { id: 'system', label: 'System', icon: Monitor }]}
          value={settings.theme}
          onChange={(theme) => updateSettings({ theme })}
        />
      </Card>

      <Card>
        <CardTitle icon={Volume2}>Emma’s voice & conversation</CardTitle>
        {!speechService.synthesisSupported && <Alert tone="warning" className="mb-3">Text-to-speech isn’t supported in this browser, so Emma’s replies will be text only.</Alert>}
        {!speechService.recognitionSupported && <Alert tone="warning" className="mb-3">Speech recognition isn’t supported in this browser. You can type your replies instead. Chrome, Edge and Safari support voice input.</Alert>}
        {speechService.synthesisSupported && (
          <div className="space-y-4">
            <div>
              <label htmlFor="voice" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Voice</label>
              <div className="flex gap-2">
                <select id="voice" value={settings.voiceURI || ''} onChange={(e) => updateSettings({ voiceURI: e.target.value || null })} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <option value="">Automatic (recommended)</option>
                  {englishVoices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                </select>
                <Button variant="secondary" icon={Volume2} onClick={() => tts.speak('Hi! I’m Emma, your English coach. Let’s practise together.')}>Test</Button>
              </div>
            </div>
            <div>
              <label htmlFor="rate" className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">Speaking speed <span className="tabular-nums">{settings.speechRate.toFixed(2)}×</span></label>
              <input id="rate" type="range" min="0.6" max="1.3" step="0.05" value={settings.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} className="w-full accent-brand-600" />
            </div>
          </div>
        )}
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle label="Emma speaks her replies" description="Read Emma’s messages aloud automatically." checked={settings.autoSpeak} onChange={(autoSpeak) => updateSettings({ autoSpeak })} />
          <Toggle label="Hands-free mode" description="Start listening automatically after Emma finishes speaking." checked={settings.autoListen} onChange={(autoListen) => updateSettings({ autoListen })} />
        </div>
        <div className="mt-4 space-y-4">
          <ChoiceGroup label="Default personality" options={PERSONALITIES.map(({ id, label }) => ({ id, label }))} value={settings.personality} onChange={(personality) => updateSettings({ personality })} />
          <ChoiceGroup label="Default difficulty" options={[{ id: null, label: 'Adaptive (recommended)' }, ...DIFFICULTIES]} value={settings.difficulty} onChange={(difficulty) => updateSettings({ difficulty })} />
        </div>
      </Card>

      <Card id="ai">
        <CardTitle icon={Bot}>AI engine</CardTitle>
        <div className="flex items-center gap-2">
          <p className="font-medium">{aiService.providerName}</p>
          <Badge tone={aiService.isDemo ? 'warning' : 'success'}>{aiService.isDemo ? 'Demo mode' : 'Connected'}</Badge>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {aiService.isDemo
            ? 'Emma is running on built-in demo logic: conversations are simulated, and feedback uses a rule-based grammar checker. Everything works offline. To connect a real AI model (Claude, OpenAI or Gemini), see “Connecting a real AI backend” in README.md.'
            : 'Emma is connected to your AI backend. If it’s unreachable, the app falls back to demo logic automatically.'}
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Pronunciation and fluency scores are estimated from browser speech recognition. A dedicated speech-assessment API gives more reliable results.</p>
      </Card>

      <Card>
        <CardTitle icon={Database}>Your data</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Progress is saved in this browser {storageService.isPersistent ? '(localStorage)' : '— storage is blocked, so data will be lost when you close the tab'}.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {state.hasDemoData ? (
            <Button variant="outline" icon={Trash} onClick={() => setConfirm('clear')}>Clear sample data</Button>
          ) : (
            <Button variant="outline" icon={RefreshCw} onClick={() => { loadDemoData(); toast.show('Sample progress loaded.', { type: 'success' }); }}>Load sample data</Button>
          )}
          <Button variant="outline" icon={Download} onClick={exportData}>Export backup</Button>
          <Button variant="outline" icon={Upload} onClick={() => fileRef.current?.click()}>Import backup</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importFile} className="sr-only" aria-label="Import backup file" tabIndex={-1} />
          <Button variant="outline" className="text-rose-600 dark:text-rose-400" icon={Trash} onClick={() => setConfirm('reset')}>Reset everything</Button>
        </div>
      </Card>

      <p className="pb-4 text-center text-xs text-slate-500">SpeakBetter AI · Practice English. Speak Confidently. Improve Every Day.</p>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm === 'reset' ? 'Reset everything?' : 'Clear sample data?'}
        confirmLabel={confirm === 'reset' ? 'Reset' : 'Clear'}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      >
        {confirm === 'reset' ? 'This permanently deletes your profile, progress, mistakes and settings on this device. Consider exporting a backup first.' : 'This removes the sample sessions, mistakes and words. Your own practice is kept.'}
      </ConfirmDialog>
    </div>
  );
}
