import type { CalendarActivity } from './calendar';

export type InsightDay = { key: string; date: Date; completed: number; scheduled: number; future: boolean };
export type ConsistentActivity = {
  key: string; title: string; category: string; completed: number;
  activeDays: number; scheduledDays: number; rate: number;
};
const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const activityKey = (activity: Pick<CalendarActivity,'title'|'category'>) => JSON.stringify([activity.category,activity.title.trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US')]);

export function buildInsights(items: CalendarActivity[], from: Date, to: Date, now: Date, selectedKey: string | null = null) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days: InsightDay[] = [];
  for (let date = new Date(from); date < to; date.setDate(date.getDate()+1)) {
    days.push({ key: dayKey(date), date: new Date(date), completed: 0, scheduled: 0, future: date > today });
  }
  const bins = new Map(days.map(day => [day.key,day]));
  const groups = new Map<string,{ title: string; category: string; completed: number; active: Set<string>; eligible: Set<string> }>();
  // Every displayed total and rank comes from the same records and local-date bins.
  for (const item of items) {
    const start = new Date(item.startAt);
    if (start < from || start >= to || !Number.isFinite(start.getTime())) continue;
    const key = activityKey(item);
    const bin = bins.get(dayKey(start));
    if (!bin) continue;
    if (!selectedKey || selectedKey === key) {
      bin.scheduled++;
      if (!bin.future && item.status === 'completed') bin.completed++;
    }
    if (bin.future) continue;
    let group = groups.get(key);
    if (!group) {
      group = { title: item.title.trim().replace(/\s+/g,' '), category: item.category, completed: 0, active: new Set(), eligible: new Set() };
      groups.set(key,group);
    }
    // Later slots today are not missed opportunities. Explicit completed status counts immediately.
    if (start <= now || item.status === 'completed') group.eligible.add(bin.key);
    if (item.status === 'completed') {
      group.completed++;
      group.active.add(bin.key);
    }
  }
  const leaderboard: ConsistentActivity[] = [...groups.entries()].filter(([,group]) => group.active.size > 0).map(([key,group]) => ({
    key, title: group.title, category: group.category, completed: group.completed,
    activeDays: group.active.size, scheduledDays: group.eligible.size,
    rate: group.active.size / group.eligible.size,
  })).sort((a,b) => b.activeDays-a.activeDays || b.rate-a.rate || b.completed-a.completed || a.title.localeCompare(b.title) || a.key.localeCompare(b.key));
  return { days, leaderboard, total: days.reduce((sum,day) => sum+day.completed,0), activeDays: days.filter(day => day.completed>0).length };
}
