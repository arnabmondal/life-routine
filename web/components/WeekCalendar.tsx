'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { Check, GripVertical, Plus, X } from 'lucide-react';
import {
  CalendarActivity, layoutDay, localDateKey, minuteOfDay, moveActivityTo,
  PIXELS_PER_MINUTE, SNAP_MINUTES, snapMinute,
} from '../lib/calendar';

const categories: Record<string, string> = {
  Health: '#21a985', Family: '#d99356', Career: '#6789e8', Learning: '#9b7bdf', Personal: '#e47c9e',
};
const time = (date: string) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const dayName = (day: Date) => day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

type Destination = { activity: CalendarActivity; day: number; minute: number; keyboard: boolean };
type PointerSession = {
  activity: CalendarActivity; pointerId: number; x: number; y: number; offset: number; active: boolean;
};
type Props = {
  days: Date[];
  items: CalendarActivity[];
  busy: boolean;
  onEdit: (activity: CalendarActivity) => void;
  onNew: (day: Date) => void;
  onStatus: (activity: CalendarActivity, status: CalendarActivity['status']) => void;
  onMove: (activity: CalendarActivity, startAt: string) => Promise<void>;
};

export default function WeekCalendar({ days, items, busy, onEdit, onNew, onStatus, onMove }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerSession | null>(null);
  const point = useRef({ x: 0, y: 0 });
  const destinationRef = useRef<Destination | null>(null);
  const suppressClick = useRef(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [selected, setSelected] = useState(() => localDateKey(new Date()));
  const selectedKey = days.some(day => localDateKey(day) === selected) ? selected : localDateKey(days[0]);
  const weekKey = localDateKey(days[0]);

  const preview = (next: Destination | null) => {
    const previous = destinationRef.current;
    if (previous && next && previous.activity.id === next.activity.id && previous.day === next.day && previous.minute === next.minute && previous.keyboard === next.keyboard) return;
    destinationRef.current = next;
    setDestination(next);
  };

  // Start near the earliest commitment, with 15 minutes of context, rather than at midnight.
  useEffect(() => {
    if (scrollRef.current) {
      const earliest = items.length ? Math.min(...items.map(item => minuteOfDay(new Date(item.startAt)))) : 8 * 60;
      scrollRef.current.scrollTop = Math.max(0, earliest - 15) * PIXELS_PER_MINUTE;
    }
    pointer.current = null;
    destinationRef.current = null;
    setDestination(null);
    // Activity edits must not reset the user's scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  function selectDay(day: Date) {
    if (destinationRef.current) return;
    setSelected(localDateKey(day));
    const events = layoutDay(items, day);
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, (events[0]?.start ?? 8 * 60) - 15) * PIXELS_PER_MINUTE;
  }

  function pointDestination(x: number, y: number) {
    const session = pointer.current;
    const scroll = scrollRef.current;
    if (!session || !scroll) return;
    // On a phone, drag onto a date in the picker to keep the time and change the day.
    const dateButtons = scroll.parentElement?.querySelectorAll<HTMLElement>('[data-drop-day]');
    for (const button of dateButtons || []) {
      const bounds = button.getBoundingClientRect();
      if (x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) {
        const day = Number(button.dataset.dropDay);
        preview({ activity: session.activity, day, minute: minuteOfDay(new Date(session.activity.startAt)), keyboard: false });
        setSelected(localDateKey(days[day]));
        return;
      }
    }
    const bounds = scroll.getBoundingClientRect();
    if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
      preview(null);
      return;
    }
    const tracks = scroll.querySelectorAll<HTMLElement>('.time-track');
    for (const track of tracks) {
      const rect = track.getBoundingClientRect();
      if (rect.width && x >= rect.left && x <= rect.right) {
        const minute = snapMinute((y - rect.top) / PIXELS_PER_MINUTE - session.offset);
        preview({ activity: session.activity, day: Number(track.dataset.day), minute, keyboard: false });
        return;
      }
    }
    preview(null);
  }

  // Continue scrolling while a held card is near an edge, even if the pointer stops moving.
  useEffect(() => {
    if (!destination || destination.keyboard) return;
    let frame: number;
    const tick = () => {
      const scroll = scrollRef.current;
      if (scroll && pointer.current?.active) {
        const bounds = scroll.getBoundingClientRect();
        const { x, y } = point.current;
        if (x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) {
          const delta = y < bounds.top + 90 ? -10 : y > bounds.bottom - 60 ? 10 : 0;
          if (delta) {
            scroll.scrollTop += delta;
            pointDestination(x, y);
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Only entering/leaving pointer dragging starts/stops the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(destination && !destination.keyboard)]);

  function cancelMove() {
    pointer.current = null;
    preview(null);
    setAnnouncement('Move cancelled. Activity unchanged.');
  }

  useEffect(() => {
    const cancel = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && destinationRef.current) {
        event.preventDefault();
        pointer.current = null;
        destinationRef.current = null;
        setDestination(null);
        setAnnouncement('Move cancelled. Activity unchanged.');
      }
    };
    window.addEventListener('keydown', cancel);
    return () => window.removeEventListener('keydown', cancel);
  }, []);

  function pointerDown(event: PointerEvent<HTMLElement>, activity: CalendarActivity, continuation: boolean) {
    if (busy || continuation || destinationRef.current?.keyboard || !event.isPrimary || event.button !== 0) return;
    const target = event.target as HTMLElement;
    const handle = target.closest('.drag-handle');
    if (target.closest('.calendar-outcomes') || (event.pointerType === 'touch' && !handle)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = { activity, pointerId: event.pointerId, x: event.clientX, y: event.clientY, offset: (event.clientY - rect.top) / PIXELS_PER_MINUTE, active: false };
    point.current = { x: event.clientX, y: event.clientY };
    suppressClick.current = false;
  }

  function pointerMove(event: PointerEvent<HTMLElement>) {
    const session = pointer.current;
    if (!session || session.pointerId !== event.pointerId) return;
    point.current = { x: event.clientX, y: event.clientY };
    if (!session.active && Math.hypot(event.clientX - session.x, event.clientY - session.y) < 6) return;
    if (!session.active) event.currentTarget.setPointerCapture(event.pointerId);
    session.active = true;
    suppressClick.current = true;
    pointDestination(event.clientX, event.clientY);
  }

  function pointerUp(event: PointerEvent<HTMLElement>) {
    const session = pointer.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const target = destinationRef.current;
    pointer.current = null;
    preview(null);
    if (session.active && target) commitMove(target);
    else if (session.active) setAnnouncement('Move cancelled. Drop inside the calendar to reschedule.');
    // The browser dispatches click immediately after pointerup; suppress only that click.
    if (session.active) window.setTimeout(() => { suppressClick.current = false; }, 0);
  }

  function commitMove(target: Destination) {
    const moved = moveActivityTo(target.activity, days[target.day], target.minute);
    preview(null);
    if (moved.startAt === target.activity.startAt) return;
    setSelected(localDateKey(days[target.day]));
    setAnnouncement('');
    void onMove(target.activity, moved.startAt);
  }

  function keyboardMove(event: KeyboardEvent<HTMLButtonElement>, activity: CalendarActivity, day: number) {
    const current = destinationRef.current;
    if (busy) return;
    if (!current) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        preview({ activity, day, minute: minuteOfDay(new Date(activity.startAt)), keyboard: true });
        setAnnouncement(`Moving ${activity.title}. Arrow keys change time and day. Enter saves. Escape cancels.`);
      }
      return;
    }
    if (!current.keyboard || current.activity.id !== activity.id) return;
    if (event.key === 'Escape') { event.preventDefault(); cancelMove(); return; }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); commitMove(current); return; }
    if (event.key === 'Tab') { cancelMove(); return; }
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = { ...current };
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      next.minute = Math.max(0, Math.min(1425, current.minute + (event.key === 'ArrowUp' ? -SNAP_MINUTES : SNAP_MINUTES)));
    } else {
      next.day = Math.max(0, Math.min(6, current.day + (event.key === 'ArrowLeft' ? -1 : 1)));
    }
    preview(next);
    const moved = moveActivityTo(activity, days[next.day], next.minute);
    setAnnouncement(`${dayName(days[next.day])}, ${time(moved.startAt)}. Enter saves; Escape cancels.`);
    // Keep the source handle visible/focused on phones; the destination is also stated above the grid.
    const scroll = scrollRef.current;
    if (scroll) {
      const top = next.minute * PIXELS_PER_MINUTE;
      if (top < scroll.scrollTop + 90) scroll.scrollTop = Math.max(0, top - 90);
      else if (top > scroll.scrollTop + scroll.clientHeight - 100) scroll.scrollTop = top - scroll.clientHeight + 120;
    }
  }

  const movedPreview = destination ? moveActivityTo(destination.activity, days[destination.day], destination.minute) : null;
  const dragMessage = destination && movedPreview
    ? `${destination.activity.title} → ${dayName(days[destination.day])}, ${time(movedPreview.startAt)} – ${time(movedPreview.endAt)}`
    : null;

  return <div className={'time-calendar' + (destination ? ' is-moving' : '')}>
    <div className="calendar-drag-help">
      <p id="calendar-move-help">Drag a card to change its time or day. Overlaps are welcome. <span>On touch screens, drag the grip; drop onto a date to change days. Times snap to 15 minutes.</span></p>
      <span className="local-time-label">Local time</span>
    </div>
    <p className="sr-only" id="calendar-keyboard-help">To move an activity with the keyboard, focus its Move button and press Space. Up and Down move 15 minutes; Left and Right change day. Enter saves; Escape cancels. You can also edit exact dates and times.</p>
    <div className={'move-announcement' + (!destination ? ' sr-only' : '')} role="status" aria-live="polite">{dragMessage || announcement}</div>
    <div className="day-picker" aria-label="Choose a day">{days.map((day, index) => <button key={localDateKey(day)} data-drop-day={index} disabled={busy} aria-pressed={selectedKey === localDateKey(day)} onClick={() => selectDay(day)}><span>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span><b>{day.getDate()}</b></button>)}</div>
    <div className="time-scroll" ref={scrollRef} tabIndex={0} aria-label="Scrollable weekly time grid">
      <div className="time-head">
        <div className="time-corner" aria-hidden="true">Time</div>
        {days.map(day => <div key={localDateKey(day)} className={'time-day-head' + (selectedKey === localDateKey(day) ? ' selected-day' : '') + (localDateKey(day) === localDateKey(new Date()) ? ' today' : '')}>
          <span>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span><b>{day.getDate()}</b>
          <button className="time-add" disabled={busy} onClick={() => onNew(day)} aria-label={`Add activity on ${dayName(day)}`} title="Add activity"><Plus size={14}/></button>
        </div>)}
      </div>
      <div className="time-body" style={{ height: 1440 * PIXELS_PER_MINUTE }}>
        <div className="time-ruler" aria-hidden="true">{Array.from({ length: 24 }, (_, hour) => <span key={hour} style={{ top: hour * 60 * PIXELS_PER_MINUTE }}>{hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : `${hour % 12} ${hour < 12 ? 'AM' : 'PM'}`}</span>)}</div>
        {days.map((day, dayIndex) => <div data-day={dayIndex} key={localDateKey(day)} className={'time-track' + (selectedKey === localDateKey(day) ? ' selected-day' : '') + ([0, 6].includes(day.getDay()) ? ' weekend' : '')}>
          {Array.from({ length: 48 }, (_, halfHour) => <div className={'time-rule' + (halfHour % 2 ? ' half-hour' : '')} style={{ top: halfHour * 30 * PIXELS_PER_MINUTE }} key={halfHour}/>)}
          {layoutDay(items, day).map(({ activity, start, visualEnd, lane, lanes, continuation }) => {
            const height = (visualEnd - start) * PIXELS_PER_MINUTE - 2;
            const compact = height < 100;
            return <article key={activity.id} data-activity-id={activity.id} className={'scheduled-card ' + activity.status + (compact ? ' compact' : '') + (lanes > 1 ? ' overlapping' : '') + (destination?.activity.id === activity.id ? ' drag-source' : '')}
              style={{ top: start * PIXELS_PER_MINUTE, height, left: `calc(${lane / lanes * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)`, '--event-color': categories[activity.category] || '#68716d' } as CSSProperties}
              onPointerDown={event => pointerDown(event, activity, continuation)} onPointerMove={pointerMove} onPointerUp={pointerUp}
              onPointerCancel={() => { if (pointer.current) cancelMove(); }} onLostPointerCapture={() => { if (pointer.current) cancelMove(); }}>
              <button className="scheduled-edit" aria-label={`Edit ${activity.title}, ${time(activity.startAt)} to ${time(activity.endAt)}, ${activity.category}, ${activity.status}${continuation ? ', continues from previous day' : ''}`} title={`${activity.title}\n${time(activity.startAt)} – ${time(activity.endAt)}\n${activity.category} · ${activity.status}`} disabled={busy}
                onClick={() => { if (!suppressClick.current && !destinationRef.current) onEdit(activity); }}>
                <span className="scheduled-time">{continuation ? 'Continues · ' : ''}{time(activity.startAt)}<span className="scheduled-end"> – {time(activity.endAt)}</span></span>
                <b>{activity.title}</b>
                {!compact && <span className="scheduled-meta"><span className="dot" style={{ background: categories[activity.category] }}/>{activity.category} · {activity.status}</span>}
              </button>
              {!continuation && <button className="drag-handle" disabled={busy} aria-label={`Move ${activity.title}`} aria-describedby="calendar-keyboard-help" aria-pressed={destination?.activity.id === activity.id} title="Drag to move; Space for keyboard controls" onKeyDown={event => keyboardMove(event, activity, dayIndex)} onClick={event => event.preventDefault()}><GripVertical size={16}/></button>}
              {!compact && <div className="calendar-outcomes"><button disabled={busy} title="Mark complete" aria-label={`Complete ${activity.title}`} aria-pressed={activity.status === 'completed'} onClick={() => onStatus(activity, activity.status === 'completed' ? 'planned' : 'completed')}><Check size={14}/></button><button disabled={busy} title="Mark skipped" aria-label={`Skip ${activity.title}`} aria-pressed={activity.status === 'skipped'} onClick={() => onStatus(activity, activity.status === 'skipped' ? 'planned' : 'skipped')}><X size={14}/></button></div>}
            </article>;
          })}
          {destination?.day === dayIndex && movedPreview && <div className="drop-preview" aria-hidden="true" style={{ top: destination.minute * PIXELS_PER_MINUTE, height: Math.max(48, Math.min(1440 - destination.minute, (Date.parse(movedPreview.endAt) - Date.parse(movedPreview.startAt)) / 60000) * PIXELS_PER_MINUTE) }}><b>{time(movedPreview.startAt)}</b><span>{destination.activity.title}</span></div>}
        </div>)}
      </div>
    </div>
  </div>;
}
