export type ThemeMode = 'light' | 'dark' | 'system';
export const USER_SETTINGS_KEY = 'daywell.user-settings.v1';
export const THEME_NAMES: Record<'light' | 'dark', string> = { light: 'sage-chalk', dark: 'sage-chalk-dark' };
export function isThemeMode(value: unknown): value is ThemeMode { return value === 'light' || value === 'dark' || value === 'system'; }
export function storedTheme(value: string | null): ThemeMode {
  try { const settings = JSON.parse(value || 'null'); return isThemeMode(settings?.theme) ? settings.theme : 'light'; }
  catch { return 'light'; }
}
export function applyTheme(mode: ThemeMode): void {
  const resolved = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = THEME_NAMES[resolved];
}
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
export const THEME_INIT_SCRIPT = `(function(){var mode='light';try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(USER_SETTINGS_KEY)})||'null');if(s&&(s.theme==='light'||s.theme==='dark'||s.theme==='system'))mode=s.theme}catch(e){}document.documentElement.dataset.themeMode=mode;var dark=mode==='dark'||(mode==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?${JSON.stringify(THEME_NAMES.dark)}:${JSON.stringify(THEME_NAMES.light)}})();`;
