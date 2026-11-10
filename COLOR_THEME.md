# Daywell color theme — Sage & Chalk

The root layout defaults to `data-theme="sage-chalk"`; saved Dark uses `data-theme="sage-chalk-dark"` on `<html>`. `web/app/theme.css` is the single source of application color values. It loads before `globals.css`; component layout, spacing and interaction rules remain in `globals.css`. No new runtime dependency is needed. The browser-local user preference is applied by a synchronous head script before body rendering.

## Light semantic roles

| Token | Value | Role |
| --- | --- | --- |
| `--color-page` | #F3F5F1 | Page ground |
| `--color-surface` | #FFFFFF | Stats cards, schedule, inputs and dialogs |
| `--color-tonal` | #E9EDE6 | Quiet control groups and loading placeholders |
| `--color-selected` | #DAE9DF | Selected day, navigation and leaderboard state |
| `--color-selected-text` | #195C49 | Text on selected sage |
| `--color-action` | #23765E | Primary actions, links, charts and active indicators |
| `--color-action-hover` | #195C49 | Primary action hover |
| `--color-action-text` | #FFFFFF | Primary button labels |
| `--color-focus` | action reference | Keyboard focus rings |
| `--color-text` | #263B32 | Primary text |
| `--color-text-muted` | #58675E | Secondary text, dates and metadata |
| `--color-border` | #DCE2D9 | Card edges and structure |
| `--color-control-border` | #ABB9AF | Input/control edges |
| `--color-success` | #195C49 | Positive outcome text |
| `--color-success-surface` | #F0F7F2 | Completed activities and success feedback |
| `--color-danger` | #9B3E38 | Skipped outcome, errors and deletion |
| `--color-danger-surface` | #FBEFEC | Error/negative feedback surface |

The same file includes semantic weekend, subtle-rule, drag-preview, text-selection, dialog-shadow and backdrop values. Compatibility aliases (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--control`, `--green`, `--green-hover`, `--negative`) reference the semantic tokens, so existing component styles consume the same theme. Never introduce new hex colors in `globals.css` or a component.

In Light, stats are individual white cards with a subtle border; Dark uses the approved green-charcoal surface. The selected day uses sage, strong green text and a green inset underline. Selection remains visibly selected on hover. This separates information surfaces from selection, without increasing card size or changing scheduling behavior.

## Category identity

`web/lib/theme.ts` exports category-to-CSS-variable references for Agenda, Week, Activity log and insights. The actual Health, Family, Career, Learning and Personal values live in `theme.css`. Existing category colors, including Learning’s violet, are retained as small identity dots under the established product/brand contract; they are not new theme grounds or action colors.

## Theme changes require explicit authorization

The user has locked the established Sage & Chalk theme. Do not change the palette, typography, or role hierarchy during routine UX, contrast, or accessibility work. A token’s presence in the palette does not authorize reusing it in a different role: dark ink must not become a dark header band. New components must use the existing light surface/selection/action roles. Only an explicit user request to change the theme authorizes a different theme or palette.

Keep color values in theme.css, inline category references in theme.ts, and verify text and necessary UI boundaries separately from decorative surface separation. If a required change cannot fit the established theme, explain the concrete conflict before changing it. Root-level theme overrides remain an implementation mechanism, not permission to introduce a different appearance.

Light declares `color-scheme: light`; Dark declares `color-scheme: dark`. The explicit saved choice controls native inputs and scrollbars independently of the operating system. System is explicitly approved and resolves to the existing Light or Dark palette using prefers-color-scheme; it follows changes live. Explicit Light/Dark override the device.

## Week calendar contrast hierarchy
The header uses the approved tonal sage (#E9EDE6) with dark text (#263B32), forest-green today emphasis and focus, and selected-sage hover. The time grid stays pale sage; cards remain white with a clear boundary referencing the existing muted text token (#58675E). No new colors or dark surfaces are introduced. Light header/card fills are deliberately subtle; readable labels and strong edges provide separation. See ESTABLISHED_THEME_RESTORATION.md for the measured checks.

## Approved dark theme and User settings
The user approved the rendered Sage & Chalk dark preview and requested a top-right person icon with a User settings menu. The menu contains an Appearance section with Light/Dark/System radio options, and can accommodate future user-specific sections. Calendar planning hours stay in the separate calendar gear beside New activity.

| Dark role | Value |
| --- | --- |
| Page | #121916 |
| Cards, dialogs and inputs | #1B2520 |
| Header/control tonal surface | #27352C |
| Primary text | #E6EEE8 |
| Secondary text | #A7B8AC |
| Borders | #3E5145 |
| Control/card boundary | #6E8978 |
| Actions and focus | #7AD4AE |
| Action hover | #9DE5C3 |
| Action label | #10241A |
| Selection | #304C3C |
| Selected text | #B3E7CB |
| Success text/surface | #A5DFBC / #20382C |
| Danger text/surface | #F3A59C / #382523 |

All values exactly match the approved preview; category identities are inherited unchanged. The complete palette is in the dark selector in theme.css, using the existing semantic roles and compatibility aliases.

Preferences live under `daywell.user-settings.v1` as `{ "theme": "light" | "dark" | "system" }`. `web/lib/user-settings.ts` owns validation, storage, root-theme application and the inline head bootstrap. Saving preserves unrelated future fields. The head script validates saved data and applies the root theme before body rendering, avoiding a light-mode flash on reload. `suppressHydrationWarning` is limited to the root attribute changed by that pre-render initialization. Invalid/missing data defaults to Light. No login, database user model or new dependency is introduced.

The menu is a named nonmodal settings dialog with native radio controls, Escape/close-button focus restoration, outside-click/Tab dismissal and 44px targets. Changes apply immediately without navigation, activity requests or calendar remounts. Storage failure still applies the choice for the visit and reports that it could not be saved. Other tabs synchronize through the storage event; clearing the preference resets to Light.

System appearance preference: follow the device/browser `prefers-color-scheme` setting and its live changes using the two approved palettes. Persist the choice as `system`, separately from the resolved palette. Apply before paint, synchronize across tabs, and preserve calendar state. Explicit Light/Dark ignore OS changes; missing/invalid preferences still default to Light.
