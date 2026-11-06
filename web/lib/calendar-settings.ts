export type PlanningWindow = { start: number; end: number };
export const DEFAULT_PLANNING_WINDOW: PlanningWindow = { start: 360, end: 1320 };
export const CALENDAR_SETTINGS_KEY = 'daywell.calendar-settings.v1';

export function isPlanningWindow(value: unknown): value is PlanningWindow {
  if (!value || typeof value !== 'object') return false;
  const { start, end } = value as PlanningWindow;
  return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end <= 1440
    && start < end && start % 15 === 0 && end % 15 === 0;
}

export function planningTimeLabel(minute: number): string {
  if (minute === 1440) return '12:00 AM (end of day)';
  const hour = Math.floor(minute / 60);
  return `${hour % 12 || 12}:${String(minute % 60).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
