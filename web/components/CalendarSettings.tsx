'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { CALENDAR_SETTINGS_KEY, DEFAULT_PLANNING_WINDOW, isPlanningWindow, planningTimeLabel, PlanningWindow } from '../lib/calendar-settings';

type Props = { value: PlanningWindow; onSave: (value: PlanningWindow) => void; onClose: () => void };

export default function CalendarSettings({ value, onSave, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { opener?.focus({ preventScroll: true }); };
  }, []);
  function save() {
    if (!isPlanningWindow(draft)) { setError('Choose an end time later than the start time.'); return; }
    try { localStorage.setItem(CALENDAR_SETTINGS_KEY, JSON.stringify(draft)); }
    catch { setError('Your browser could not remember these settings. Check browser storage and try again.'); return; }
    onSave(draft);
    dialog.current?.close();
    onClose();
  }
  return <dialog ref={dialog} className="dialog calendar-settings-dialog" aria-labelledby="calendar-settings-title" onCancel={onClose} onClose={onClose}>
    <form onSubmit={event => { event.preventDefault(); save(); }}>
      <div className="dialog-head"><div><h2 id="calendar-settings-title">Calendar settings</h2><p>Make the calendar fit your day.</p></div><button type="button" className="icon-btn" aria-label="Close calendar settings" onClick={onClose}><X size={20}/></button></div>
      <section className="settings-section" aria-labelledby="planning-hours-title">
        <h3 id="planning-hours-title">Planning hours</h3>
        <p id="planning-hours-help">Show only the hours you want to plan. Times follow your local timezone.</p>
        <div className="two">
          <label><span id="planning-start-label">Start time</span><select aria-labelledby="planning-start-label" autoFocus value={draft.start} aria-describedby="planning-hours-help" onChange={event => { setDraft({ ...draft, start: Number(event.target.value) }); setError(''); }}>{Array.from({ length: 96 }, (_, i) => i * 15).map(minute => <option key={minute} value={minute}>{planningTimeLabel(minute)}</option>)}</select></label>
          <label><span id="planning-end-label">End time</span><select aria-labelledby="planning-end-label" value={draft.end} aria-describedby="planning-hours-help planning-hours-error" aria-invalid={!isPlanningWindow(draft)} onChange={event => { setDraft({ ...draft, end: Number(event.target.value) }); setError(''); }}>{Array.from({ length: 96 }, (_, i) => (i + 1) * 15).map(minute => <option key={minute} value={minute}>{planningTimeLabel(minute)}</option>)}</select></label>
        </div>
        <p className="settings-help">Activities outside these hours stay saved. You can find them in the activity log.</p>
        <button type="button" className="settings-reset" onClick={() => { setDraft(DEFAULT_PLANNING_WINDOW); setError(''); }}>Reset to 6:00 AM – 10:00 PM</button>
      </section>
      <p className="form-error" id="planning-hours-error" role={error ? 'alert' : undefined}>{error}</p>
      <div className="dialog-actions"><div className="spacer"/><button type="button" className="outline" onClick={onClose}>Cancel</button><button type="submit" className="primary">Save settings</button></div>
    </form>
  </dialog>;
}
