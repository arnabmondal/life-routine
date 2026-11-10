'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Monitor, Moon, Sun, UserRound, X } from 'lucide-react';
import { applyTheme, saveTheme, storedTheme, isThemeMode, ThemeMode, USER_SETTINGS_KEY } from '../lib/user-settings';

export default function UserSettings() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [message, setMessage] = useState('Your choice is remembered in this browser.');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const current = document.documentElement.dataset.themeMode;
    setTheme(isThemeMode(current) ? current : 'light');
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = () => {
      if (document.documentElement.dataset.themeMode === 'system') applyTheme('system');
    };
    media.addEventListener('change', followSystem);
    followSystem();
    const sync = (event: StorageEvent) => {
      if (event.key !== USER_SETTINGS_KEY && event.key !== null) return;
      const next = storedTheme(event.newValue);
      applyTheme(next); setTheme(next);
      setMessage('Theme updated from another tab.');
    };
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('storage', sync); media.removeEventListener('change', followSystem); };
  }, []);
  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLInputElement>('input:checked')?.focus({ preventScroll: true });
    const outside = (event: globalThis.PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  function choose(next: ThemeMode) {
    const saved = saveTheme(next);
    setTheme(next);
    setMessage(saved ? (next === 'system' ? 'Following your device’s appearance. Preference saved.' : `${next === 'dark' ? 'Dark' : 'Light'} theme saved.`) : 'Theme changed for this visit. Your browser could not save the preference.');
  }
  return <div className="user-settings" ref={root} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) close();
  }}>
    <button ref={trigger} className="square user-settings-button" type="button" aria-label="User settings" title="User settings" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(current => !current)}><UserRound size={20} aria-hidden="true"/></button>
    {open && <div className="user-settings-panel" ref={panel} id={id} role="dialog" aria-labelledby={`${id}-title`}>
      <div className="user-settings-heading"><h2 id={`${id}-title`}>User settings</h2><button className="icon-btn" type="button" aria-label="Close user settings" onClick={() => close(true)}><X size={18} aria-hidden="true"/></button></div>
      <section className="user-settings-section" aria-labelledby={`${id}-appearance`}>
        <h3 id={`${id}-appearance`}>Appearance</h3>
        <fieldset className="theme-options"><legend className="sr-only">Color theme</legend>
          <label className={theme === 'light' ? 'theme-option selected' : 'theme-option'}><input type="radio" name={`${id}-theme`} value="light" checked={theme === 'light'} onChange={() => choose('light')}/><Sun size={17} aria-hidden="true"/><span>Light</span></label>
          <label className={theme === 'dark' ? 'theme-option selected' : 'theme-option'}><input type="radio" name={`${id}-theme`} value="dark" checked={theme === 'dark'} onChange={() => choose('dark')}/><Moon size={17} aria-hidden="true"/><span>Dark</span></label>
          <label className={`theme-option theme-option-system${theme === 'system' ? ' selected' : ''}`}><input type="radio" name={`${id}-theme`} value="system" checked={theme === 'system'} onChange={() => choose('system')}/><Monitor size={17} aria-hidden="true"/><span>System</span></label>
        </fieldset>
        <p className="user-settings-status" role="status">{message}</p>
      </section>
    </div>}
  </div>;
}
