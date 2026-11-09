'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { Check, GripVertical, X } from 'lucide-react';
import { CalendarActivity, layoutDay } from '../lib/calendar';
import { PlanningWindow, planningTimeLabel } from '../lib/calendar-settings';
import { ReorderProposal, suggestReorder } from '../lib/agenda';

type Props = {
  day: Date; items: CalendarActivity[]; hours: PlanningWindow; busy: boolean;
  onEdit: (item: CalendarActivity) => void;
  onNew: (day: Date) => void;
  onStatus: (item: CalendarActivity, status: CalendarActivity['status']) => void;
  onMove: (item: CalendarActivity, startAt: string) => Promise<boolean>;
  onViewLog: () => void;
};
type Drag = { id: string; index: number; keyboard: boolean };
type Session = { id: string; pointerId: number; y: number; active: boolean };
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const colors: Record<string,string> = { Health: '#21a985', Family: '#d99356', Career: '#6789e8', Learning: '#9b7bdf', Personal: '#e47c9e' };

export default function DayAgenda({ day, items, hours, busy, onEdit, onNew, onStatus, onMove, onViewLog }: Props) {
  const rows = layoutDay(items, day, hours.start, hours.end);
  const ordered = rows.map(row => row.activity);
  const list = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const session = useRef<Session | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const point = useRef(0);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [proposal, setProposal] = useState<ReorderProposal | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const visibleIds = new Set(ordered.map(item => item.id));
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  const hidden = items.filter(item => !visibleIds.has(item.id) && new Date(item.startAt) < dayEnd && new Date(item.endAt) > dayStart).length;

  function update(next: Drag | null) { dragRef.current = next; setDrag(next); }
  function cancel() { session.current = null; update(null); setAnnouncement('Move cancelled. Activity unchanged.'); }
  function focusSource() {
    const target = opener.current;
    if (target?.isConnected && !target.disabled) target.focus({ preventScroll: true });
    else list.current?.focus({ preventScroll: true });
  }
  function propose(id: string, index: number) {
    const activity = ordered.find(item => item.id === id);
    update(null); session.current = null;
    if (!activity) return;
    const next = suggestReorder(activity, ordered, index, day, hours, items);
    if (!next) { setAnnouncement('Activity order unchanged.'); return; }
    setError(''); setProposal(next);
  }
  useEffect(() => {
    if (proposal) dialog.current?.showModal();
  }, [proposal]);
  useLayoutEffect(() => {
    if (!saving && proposal && dialog.current?.open && !dialog.current.contains(document.activeElement))
      dialog.current.querySelector<HTMLButtonElement>('.proposal-apply')?.focus({ preventScroll: true });
  }, [saving, proposal]);
  function close() {
    if (savingRef.current) return;
    dialog.current?.close(); setProposal(null); setError(''); focusSource();
  }
  async function apply() {
    if (!proposal || proposal.blocked || savingRef.current) return;
    savingRef.current = true; setSaving(true); setError('');
    const success = await onMove(proposal.activity, proposal.startAt);
    savingRef.current = false; setSaving(false);
    if (success) {
      dialog.current?.close(); setProposal(null);
      setAnnouncement(`${proposal.activity.title} moved to ${time(proposal.startAt)}.`);
      requestAnimationFrame(focusSource);
    } else setError('This move could not be saved. The original order and times are unchanged. Try again or cancel.');
  }
  function destination(y: number) {
    const current = session.current;
    if (!current || !list.current) return;
    const others = Array.from(list.current.querySelectorAll<HTMLElement>('.agenda-row')).filter(row => row.dataset.activityId !== current.id);
    const index = others.filter(row => y > row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2).length;
    update({ id: current.id, index, keyboard: false });
  }
  function down(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (busy || proposal || dragRef.current || session.current || !event.isPrimary || event.button !== 0) return;
    opener.current = event.currentTarget;
    event.currentTarget.focus({ preventScroll: true });
    session.current = { id, pointerId: event.pointerId, y: event.clientY, active: false };
    point.current = event.clientY;
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = session.current;
    if (!current || current.pointerId !== event.pointerId) return;
    point.current = event.clientY;
    if (!current.active && Math.abs(event.clientY - current.y) < 6) return;
    if (!current.active) event.currentTarget.setPointerCapture(event.pointerId);
    current.active = true; destination(event.clientY);
  }
  function up(event: PointerEvent<HTMLButtonElement>) {
    const current = session.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const target = dragRef.current;
    session.current = null;
    if (current.active && target) propose(current.id, target.index);
    else update(null);
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, activity: CalendarActivity) {
    if (busy || proposal) return;
    const current = dragRef.current;
    if (!current) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault(); opener.current = event.currentTarget;
        update({ id: activity.id, index: ordered.findIndex(item => item.id === activity.id), keyboard: true });
        setAnnouncement(`Moving ${activity.title}. Up and Down change position. Enter reviews the suggested time. Escape cancels.`);
      }
      return;
    }
    if (!current.keyboard || current.id !== activity.id) return;
    if (event.key === 'Escape' || event.key === 'Tab') { if (event.key === 'Escape') event.preventDefault(); cancel(); return; }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); propose(current.id, current.index); return; }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const index = Math.max(0, Math.min(ordered.length - 1, current.index + (event.key === 'ArrowUp' ? -1 : 1)));
      update({ ...current, index }); setAnnouncement(`Position ${index + 1} of ${ordered.length}. Enter reviews the suggested time.`);
    }
  }
  useEffect(() => {
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape' && dragRef.current) { event.preventDefault(); cancel(); } };
    const blur = () => { if (session.current || dragRef.current) cancel(); };
    window.addEventListener('keydown', escape); window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('blur', blur); };
  }, []);
  useEffect(() => {
    if (!drag || drag.keyboard) return;
    let frame: number;
    const tick = () => {
      if (session.current?.active) {
        const y = point.current;
        const delta = y < 90 ? -10 : y > window.innerHeight - 80 ? 10 : 0;
        if (delta) { window.scrollBy(0, delta); destination(y); }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Start/stop one auto-scroll loop when a pointer move begins/ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(drag && !drag.keyboard)]);
  const dayKey = day.toDateString();
  useEffect(() => { session.current = null; update(null); }, [dayKey, hours.start, hours.end]);
  const remaining = ordered.filter(item => item.id !== drag?.id);
  const beforeId = drag ? remaining[drag.index]?.id : undefined;

  return <section className="day-agenda" aria-label="Daily agenda">
    <div className="agenda-meta"><span>{rows.length} {rows.length === 1 ? 'activity' : 'activities'} in planning hours</span><span>{planningTimeLabel(hours.start)} – {planningTimeLabel(hours.end)}</span></div>
    <p className="sr-only" id="agenda-move-help">Drag a grip to change order. With the keyboard, press Space, use Up and Down, then Enter to review suggested times. Escape cancels. No time changes until you confirm.</p>
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    <div className="agenda-list" ref={list} tabIndex={-1} aria-label="Activities in time order">
      {!rows.length && <div className="agenda-empty"><h2>A little room in your day.</h2><p>No activities in these planning hours.</p><button className="outline" onClick={() => onNew(day)}>Add an activity</button></div>}
      {rows.map(({ activity, continuation }) => <article data-activity-id={activity.id} key={activity.id} className={'agenda-row ' + activity.status + (drag?.id === activity.id ? ' agenda-drag-source' : '') + (beforeId === activity.id ? ' agenda-drop-before' : '')}>
        <button className="agenda-grip" aria-label={`Move ${activity.title}`} aria-describedby="agenda-move-help" aria-pressed={drag?.id === activity.id} disabled={busy || continuation}
          onPointerDown={event => down(event, activity.id)} onPointerMove={move} onPointerUp={up}
          onPointerCancel={cancel} onLostPointerCapture={event => { if (session.current && !event.currentTarget.hasPointerCapture(event.pointerId)) cancel(); }} onKeyDown={event => keyboard(event, activity)} onClick={event => event.preventDefault()}><GripVertical size={18}/></button>
        <button className="agenda-edit" disabled={busy} onClick={() => onEdit(activity)} aria-label={`Edit ${activity.title}`}>
          <span className="agenda-time">{time(activity.startAt)} – {time(activity.endAt)}{continuation && <small>Continues from previous day</small>}</span>
          <span className="agenda-description"><b>{activity.title}</b><span><i className="dot" style={{ background: colors[activity.category] }}/>{activity.category} · {activity.status}</span></span>
        </button>
        <div className="agenda-outcomes"><button disabled={busy} aria-label={`Complete ${activity.title}`} title="Mark complete" aria-pressed={activity.status === 'completed'} onClick={() => onStatus(activity, activity.status === 'completed' ? 'planned' : 'completed')}><Check size={17}/></button><button disabled={busy} aria-label={`Skip ${activity.title}`} title="Mark skipped" aria-pressed={activity.status === 'skipped'} onClick={() => onStatus(activity, activity.status === 'skipped' ? 'planned' : 'skipped')}><X size={17}/></button></div>
      </article>)}
      {drag && !beforeId && <div className="agenda-drop-end" aria-hidden="true"/>}
    </div>
    <details className="agenda-help"><summary>Reordering activities</summary><p>Drag the grip to choose a new position. We’ll suggest a time that keeps your activity’s duration and show overlaps before you save. You can also use Space, arrow keys, and Enter on a grip.</p></details>
    {hidden > 0 && <p className="calendar-window-note">{hidden} {hidden === 1 ? 'activity is' : 'activities are'} outside your planning hours. <button onClick={onViewLog}>View in activity log</button></p>}
    {proposal && <dialog className="dialog reorder-dialog" ref={dialog} aria-labelledby="reorder-title" onCancel={event => { event.preventDefault(); close(); }}>
      <div className="dialog-head"><div><h2 id="reorder-title">{proposal.blocked ? 'Choose a time for this move' : 'Review suggested time'}</h2><p>{proposal.activity.title}</p></div><button type="button" className="icon-btn" aria-label="Close suggested time" disabled={saving} onClick={close}><X size={20}/></button></div>
      {proposal.blocked ? <p>These activities share a start time. Place this activity before or after the group, or edit exact times.</p> : <>
        <p>To place this activity in its new position, change its time and keep the same duration.</p>
        <dl className="time-proposal"><div><dt>Current</dt><dd>{time(proposal.activity.startAt)} – {time(proposal.activity.endAt)}</dd></div><div><dt>Suggested</dt><dd>{time(proposal.startAt)} – {time(proposal.endAt)}{new Date(proposal.endAt).toDateString() !== day.toDateString() && <small>Ends {new Date(proposal.endAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>}</dd></div></dl>
        {proposal.conflicts.length > 0 && <p className="proposal-warning">This overlaps {proposal.conflicts.join(', ')}. Other activities will keep their times.</p>}
        {proposal.outsideHours && <p className="proposal-warning">This time is outside your planning hours. The activity may disappear from this agenda; it stays available in the activity log.</p>}
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="dialog-actions"><button className="outline" disabled={saving} onClick={() => { dialog.current?.close(); setProposal(null); onEdit(proposal.blocked ? proposal.activity : { ...proposal.activity, startAt: proposal.startAt, endAt: proposal.endAt }); }}>Edit exact times</button><div className="spacer"/><button className="outline" disabled={saving} onClick={close}>Cancel</button>{!proposal.blocked && <button className="primary proposal-apply" disabled={saving} onClick={() => void apply()}>{saving ? 'Saving…' : 'Apply time change'}</button>}</div>
    </dialog>}
  </section>;
}
