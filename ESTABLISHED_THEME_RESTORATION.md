# Established theme restored — November 9, 2026

The user explicitly rejected the dark-header departure and requires all UX to remain within the established Sage & Chalk theme unless they explicitly ask for a theme change.

## Restored appearance and durable constraint
- Week header: approved light tonal sage #E9EDE6, dark ink #263B32 labels, forest-green today emphasis and focus.
- Cards: white, with a clear neutral boundary referencing the existing muted-ink color #58675E. No new color values were introduced; the unapproved #75877C value was removed.
- Hover: approved selected-sage surface with dark readable text. Grid, compact stats, category dots, dimensions and interactions stay within the existing light design system.
- AGENTS.md records the explicit theme lock for future work. COLOR_THEME.md, DESIGN.md, PRODUCT.md and the calendar surface brief now require express user authorization for theme/palette/typography/role-hierarchy changes. Generic contrast, polish or accessibility requests are not that authorization.
- Rejected dark-header documentation was replaced in active design instructions. WEEK_CONTRAST_VERIFICATION.md is explicitly marked superseded and must not be reapplied.
- Browser regressions assert the exact approved light header and white card colors, so a dark treatment cannot pass merely because its contrast ratio is high.

## Checks performed
Production Next.js build, lint and TypeScript validation passed. `git diff --check` passed.

Chrome/Playwright, America/Los_Angeles, **1440×900, 820×900, 390×900 and 320×900**:

- Restored header and white card colors asserted explicitly at every width.
- Header/card text at least 4.5:1, card boundaries at least 3:1 against card fill, weekday grid, weekend grid and completed fill.
- Header Add icon, hover state and a keyboard-generated solid focus outline checked for contrast; no horizontal overflow or page errors.
- Light-sage header/white-card fill separation is deliberately subtle (about 1.18:1), as required by this palette. Decorative surface separation is not a text contrast criterion; dark labels and clear edges establish the hierarchy.
- Shared-theme regression: **16 grouped scenarios passed** across the four widths, covering Agenda, Week, log/chart/leaderboard, settings, activity editor, reorder review, error/retry, category colors and semantic-token propagation.
- Desktop and phone week screenshots visually inspected. Browser data used isolated API fixtures; existing routine entries were not changed.

Evidence: `.impeccable/review/theme-restoration/contrast.json`, `views.json` and screenshots. Existing behavior code was not modified, so the scheduling unit suite was not rerun for this color-role correction. Physical devices and other engines were not tested.

Re-run:

```sh
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/week-contrast.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/theme.browser.cjs
```

The restored build is running at http://localhost:3000/?view=week.
