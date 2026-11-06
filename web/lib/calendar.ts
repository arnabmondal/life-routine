export type CalendarActivity = {
  id: string;
  title: string;
  category: string;
  startAt: string;
  endAt: string;
  status: 'planned' | 'completed' | 'skipped';
  notes: string;
};

export const MINUTES_PER_DAY = 1440;
export const PIXELS_PER_MINUTE = 2.4;
export const SNAP_MINUTES = 15;
export const MIN_CARD_MINUTES = 20;

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function snapMinute(minute: number): number {
  return Math.max(0, Math.min(MINUTES_PER_DAY - SNAP_MINUTES, Math.round(minute / SNAP_MINUTES) * SNAP_MINUTES));
}

// Use local wall-clock time for the destination; preserve elapsed duration, including overnight activities.
export function moveActivityTo(activity: CalendarActivity, day: Date, minute: number): CalendarActivity {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute);
  const duration = Date.parse(activity.endAt) - Date.parse(activity.startAt);
  return { ...activity, startAt: start.toISOString(), endAt: new Date(start.getTime() + duration).toISOString() };
}

export type PositionedActivity = {
  activity: CalendarActivity;
  start: number;
  end: number;
  visualEnd: number;
  lane: number;
  lanes: number;
  continuation: boolean;
};

// Events that touch at their endpoints do not overlap. Minimum card height also participates
// in lane allocation, so short adjacent activities cannot cover one another's text.
export function layoutDay(activities: CalendarActivity[], day: Date, windowStart = 0, windowEnd = MINUTES_PER_DAY): PositionedActivity[] {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  const segments: PositionedActivity[] = activities.flatMap(activity => {
    const startAt = new Date(activity.startAt);
    const endAt = new Date(activity.endAt);
    if (endAt <= dayStart || startAt >= dayEnd) return [];
    const actualStart = startAt < dayStart ? 0 : minuteOfDay(startAt);
    const actualEnd = endAt >= dayEnd ? MINUTES_PER_DAY : minuteOfDay(endAt);
    if (actualEnd <= windowStart || actualStart >= windowEnd) return [];
    const start = Math.max(windowStart, actualStart);
    const end = Math.min(windowEnd, actualEnd);
    return [{ activity, start, end, visualEnd: Math.min(windowEnd, Math.max(end, start + MIN_CARD_MINUTES)), lane: 0, lanes: 1, continuation: startAt < dayStart }];
  }).sort((a, b) => a.start - b.start || b.end - a.end || a.activity.id.localeCompare(b.activity.id));

  let group: PositionedActivity[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;
  const finishGroup = () => { for (const event of group) event.lanes = laneEnds.length; };
  for (const event of segments) {
    if (event.start >= groupEnd) {
      finishGroup();
      group = [];
      laneEnds = [];
      groupEnd = -1;
    }
    const freeLane = laneEnds.findIndex(end => end <= event.start);
    event.lane = freeLane === -1 ? laneEnds.length : freeLane;
    laneEnds[event.lane] = event.visualEnd;
    group.push(event);
    groupEnd = Math.max(groupEnd, event.visualEnd);
  }
  finishGroup();
  return segments;
}
