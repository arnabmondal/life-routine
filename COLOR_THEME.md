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

## Theme changes require explicit authorization

The user has locked the established Sage & Chalk theme. Do not change the palette, typography, or role hierarchy during routine UX, contrast, or accessibility work. A token’s presence in the palette does not authorize reusing it in a different role: dark ink must not become a dark header band. New components must use the existing light surface/selection/action roles. Only an explicit user request to change the theme authorizes a different theme or palette.

Keep color values in theme.css, inline category references in theme.ts, and verify text and necessary UI boundaries separately from decorative surface separation. If a required change cannot fit the established theme, explain the concrete conflict before changing it. Root-level theme overrides remain an implementation mechanism, not permission to introduce a different appearance.

Sage & Chalk explicitly declares `color-scheme: light`, so native fields remain consistent even when the operating system prefers dark mode. The approved scheme is applied directly; changing themes at runtime can be added separately if requested.

## Week calendar contrast hierarchy
The header uses the approved tonal sage (#E9EDE6) with dark text (#263B32), forest-green today emphasis and focus, and selected-sage hover. The time grid stays pale sage; cards remain white with a clear boundary referencing the existing muted text token (#58675E). No new colors or dark surfaces are introduced. Light header/card fills are deliberately subtle; readable labels and strong edges provide separation. See ESTABLISHED_THEME_RESTORATION.md for the measured checks.
