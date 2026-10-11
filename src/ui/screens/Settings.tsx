import { useRef, useState } from 'react';
import { audio, type Timbre } from '../../audio/engine';
import { block, after, sequence } from '../../audio/events';
import { exportData, importData, resetProgress, updateSettings, useSettings, type Settings } from '../../state/store';
import { TopBar } from '../components/common';
import { go } from '../router';

function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented segmented-sm">
      {options.map((o) => (
        <button key={String(o.v)} className={value === o.v ? 'is-active' : ''} onClick={() => onChange(o.v)}>{o.label}</button>
      ))}
    </div>
  );
}

export function SettingsScreen() {
  const s = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const set = (patch: Partial<Settings>) => updateSettings(patch);

  const testSound = () => void audio.play(after(sequence([60, 64, 67], 0.25, 0.4), block([60, 64, 67, 72], 1.4), 0.1));

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `eartrain-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doImport = async (file: File) => {
    try {
      importData(await file.text());
      setMsg('Backup restored.');
    } catch (e) {
      setMsg(`Couldn’t import: ${(e as Error).message}`);
    }
  };

  return (
    <div className="screen">
      <TopBar title="Settings" onBack={() => go('/')} />

      <section className="card settings">
        <h3 className="card-title">Sound</h3>
        <div className="setting">
          <span>Instrument</span>
          <Segmented<Timbre> value={s.timbre} options={[{ v: 'piano', label: 'Piano' }, { v: 'soft', label: 'Soft' }, { v: 'organ', label: 'Organ' }]} onChange={(v) => { set({ timbre: v }); setTimeout(testSound, 0); }} />
        </div>
        <div className="setting">
          <span>Volume</span>
          <input type="range" min={0} max={1} step={0.05} value={s.volume} onChange={(e) => set({ volume: Number(e.target.value) })} aria-label="Volume" />
        </div>
        <button className="btn btn-block" onClick={testSound}>Test sound</button>
      </section>

      <section className="card settings">
        <h3 className="card-title">Practice</h3>
        <div className="setting">
          <span>Questions per session</span>
          <Segmented<number> value={s.sessionLength} options={[10, 15, 20, 30].map((v) => ({ v, label: String(v) }))} onChange={(v) => set({ sessionLength: v })} />
        </div>
        <div className="setting">
          <span>Daily goal</span>
          <Segmented<number> value={s.dailyGoal} options={[20, 40, 80, 120].map((v) => ({ v, label: String(v) }))} onChange={(v) => set({ dailyGoal: v })} />
        </div>
        <label className="setting">
          <span>Auto-advance after a correct answer</span>
          <input type="checkbox" className="switch" checked={s.autoAdvance} onChange={(e) => set({ autoAdvance: e.target.checked })} />
        </label>
      </section>

      <section className="card settings">
        <h3 className="card-title">Appearance</h3>
        <div className="setting">
          <span>Theme</span>
          <Segmented value={s.theme} options={[{ v: 'system', label: 'Auto' }, { v: 'light', label: 'Light' }, { v: 'dark', label: 'Dark' }]} onChange={(v) => set({ theme: v })} />
        </div>
      </section>

      <section className="card settings">
        <h3 className="card-title">Your data</h3>
        <p className="muted small">Progress is stored on this device. Back it up to move it to another phone or browser.</p>
        <div className="row-gap">
          <button className="btn" onClick={doExport}>Export backup</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
        </div>
        <button className="btn btn-ghost btn-danger" onClick={() => { if (window.confirm('Erase all progress? This can’t be undone.')) { resetProgress(); setMsg('Progress reset.'); } }}>
          Reset all progress
        </button>
        {msg && <p className="small">{msg}</p>}
      </section>
      <p className="muted tiny center">EarTrain v2 · keyboard: 1–9 answer · Space replay · Enter continue</p>
    </div>
  );
}
