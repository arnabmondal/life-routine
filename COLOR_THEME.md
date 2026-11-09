# Daywell color theme — Sage & Chalk

The root layout applies `data-theme="sage-chalk"` to `<html>`. `web/app/theme.css` is the single source of application color values. It loads before `globals.css`; component layout, spacing and interaction rules remain in `globals.css`. No runtime dependency, new storage value, or flash-producing client-side initialization is needed.

## Semantic roles

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

Stats are individual white cards with a subtle border. The selected day uses sage, strong green text and a green inset underline. Selection remains visibly selected on hover. This separates information surfaces from selection, without increasing card size or changing scheduling behavior.

## Category identity

`web/lib/theme.ts` exports category-to-CSS-variable references for Agenda, Week, Activity log and insights. The actual Health, Family, Career, Learning and Personal values live in `theme.css`. Existing category colors, including Learning’s violet, are retained as small identity dots under the established product/brand contract; they are not new theme grounds or action colors.

## Extending the theme

1. Add semantic overrides in `theme.css` under `html[data-theme="another-name"]`.
2. Apply the name to the root `<html>` element. Keep overrides on the root so inherited compatibility aliases resolve against the same values.
3. Add tokens by role, not by page or a literal color name; use CSS references for inline category styling.
4. Check cards, selection, charts, inputs, dialogs, success/error feedback, focus, and reduced-motion/hover states at desktop and phone widths.
5. Verify text pairs are at least 4.5:1 and visible focus is at least 3:1. Category dots supplement written category names.

Sage & Chalk explicitly declares `color-scheme: light`, so native fields remain consistent even when the operating system prefers dark mode. The approved scheme is applied directly; changing themes at runtime can be added separately if requested.
