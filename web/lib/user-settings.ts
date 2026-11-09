export type ThemeMode = 'light' | 'dark';
export const USER_SETTINGS_KEY = 'daywell.user-settings.v1';
export const THEME_NAMES: Record<ThemeMode, string> = { light: 'sage-chalk', dark: 'sage-chalk-dark' };
export function isThemeMode(value: unknown): value is ThemeMode { return value === 'light' || value === 'dark'; }
export function storedTheme(value: string | null): ThemeMode {
  try { const settings = JSON.parse(value || 'null'); return isThemeMode(settings?.theme) ? settings.theme : 'light'; }
  catch { return 'light'; }
}
export function applyTheme(mode: ThemeMode): void { document.documentElement.dataset.theme = THEME_NAMES[mode]; }
export function saveTheme(mode: ThemeMode): boolean {
  let previous: Record<string, unknown> = {};
  try {
    const value = JSON.parse(localStorage.getItem(USER_SETTINGS_KEY) || 'null');
    if (value && typeof value === 'object' && !Array.isArray(value)) previous = value;
  } catch { /* A malformed/unavailable preference does not prevent a live theme change. */ }
  let saved = true;
  try { localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify({ ...previous, theme: mode })); }
  catch { saved = false; }
  applyTheme(mode);
  return saved;
}
// Parser-blocking head script applies the saved mode before body paint, independently
// of hydration. Only validated literals become a theme name; no stored HTML is injected.
export const THEME_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(USER_SETTINGS_KEY)})||'null');document.documentElement.dataset.theme=s&&s.theme==='dark'?${JSON.stringify(THEME_NAMES.dark)}:${JSON.stringify(THEME_NAMES.light)}}catch(e){document.documentElement.dataset.theme=${JSON.stringify(THEME_NAMES.light)}}})();`;
