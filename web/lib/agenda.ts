import type { CalendarActivity } from './calendar';
import type { PlanningWindow } from './calendar-settings';

export type ReorderProposal = {
  activity: CalendarActivity;
  startAt: string;
  endAt: string;
  conflicts: string[];
  outsideHours: boolean;
  blocked: boolean;
};

// Agenda order is chronological, not a second ordering field that can disagree with the calendar.
// Suggest a time between the adjacent starts. Prefer the previous activity's end or a gap before
// the next activity; never change other activities to manufacture space.
export function suggestReorder(activity: CalendarActivity, ordered: CalendarActivity[], index: number,
  day: Date, hours: PlanningWindow, allItems: CalendarActivity[]): ReorderProposal | null {
  const oldIndex = ordered.findIndex(item => item.id === activity.id);
  const remaining = ordered.filter(item => item.id !== activity.id);
  const position = Math.max(0, Math.min(remaining.length, index));
  if (oldIndex < 0 || position === oldIndex) return null;
  const previous = remaining[position - 1];
  const next = remaining[position];
  const midnight = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const nextMidnight = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  const windowStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, hours.start).getTime();
  const windowEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, hours.end).getTime();
  const duration = Date.parse(activity.endAt) - Date.parse(activity.startAt);
  const lower = previous ? Date.parse(previous.startAt) + 60000 : midnight.getTime();
  const upper = next ? Date.parse(next.startAt) - 60000 : nextMidnight.getTime() - 60000;
  if (lower > upper) return { activity, startAt: activity.startAt, endAt: activity.endAt,
    conflicts: [], outsideHours: false, blocked: true };
  let preferred = previous ? Date.parse(previous.endAt) : Date.parse(next.startAt) - duration;
  // Prefer the visible planning window if a chronological placement exists there.
  const visibleLower = Math.max(lower, windowStart);
  const visibleUpper = Math.min(upper, windowEnd - duration);
  const min = visibleLower <= visibleUpper ? visibleLower : lower;
  const max = visibleLower <= visibleUpper ? visibleUpper : upper;
  preferred = Math.max(min, Math.min(max, preferred));
  // Snap on the local wall clock. Very tight gaps may need exact-minute placement.
  const rounded = new Date(preferred);
  rounded.setMinutes(Math.round(rounded.getMinutes() / 15) * 15, 0, 0);
  const floor = new Date(max);
  floor.setMinutes(Math.floor(floor.getMinutes() / 15) * 15, 0, 0);
  const ceil = new Date(min);
  ceil.setMinutes(Math.ceil(ceil.getMinutes() / 15) * 15, 0, 0);
  const candidates = [rounded.getTime(), floor.getTime(), ceil.getTime()]
    .filter(value => value >= min && value <= max).sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
  const start = candidates[0] ?? preferred;
  const end = start + duration;
  return { activity, startAt: new Date(start).toISOString(), endAt: new Date(end).toISOString(),
    conflicts: allItems.filter(item => item.id !== activity.id && Date.parse(item.startAt) < end
      && Date.parse(item.endAt) > start).map(item => item.title),
    outsideHours: start < windowStart || end > windowEnd, blocked: false };
}
