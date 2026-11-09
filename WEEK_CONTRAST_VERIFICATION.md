# Week-view contrast — November 9, 2026

**Superseded: the user rejected this dark-header treatment. Do not reapply it. Current theme and verification: COLOR_THEME.md and ESTABLISHED_THEME_RESTORATION.md.**

## Findings and fix
Before: week headings and planned activity cards were both white (**1:1 surface contrast**). Header/card text already passed text contrast checks, but the visual hierarchy was weak. Card borders (#ABB9AF) were only **2.04:1** against white cards; weekday tracks inherited the same white container.

After: shared semantic tokens give the header deep forest #263B32 with white labels and light-sage today/focus emphasis. The weekday grid uses page sage #F3F5F1, weekends tonal sage #E9EDE6, and planned/skipped cards remain white. Completed cards keep their success wash. Card borders are #75877C, including completed cards. Hover/focus still uses the action color on cards. Header Add controls get white icons, deep-green hover and a light-sage inset keyboard focus ring. No grid heights, coordinates, scrolling logic, or activity data changed.

## Rendered measurements
- Header vs planned card: **1.00 → 11.97:1**. This is a surface-separation measurement, distinct from WCAG text checks.
- Header labels: **11.97:1**; today date on dark header: **9.52:1**.
- Card title: **11.97:1**; card time: **5.97:1**.
- Card border against white card: **2.04 → 3.81:1**.
- Card border against weekday grid: **3.47:1**; weekend grid: **3.21:1**; completed-card fill: **3.50:1**.
- Header Add icon, hover state and keyboard focus were independently asserted at ≥3:1 (hover glyph ≥4.5:1). Actual keyboard Tab/Shift+Tab verified a solid visible focus outline.

## Checks actually run
- Before/after computed-style and contrast measurements in installed Chrome / Playwright, America/Los_Angeles, at **1440×900, 820×900, 390×900, and 320×900**: passed after the update.
- Body/header text assertions use ≥4.5:1; card boundaries and focus use ≥3:1. No claim of a complete WCAG audit is made.
- Desktop and phone before/after screenshots captured; updated desktop and phone screenshots visually inspected. No horizontal overflow or uncaught page errors at any width.
- Existing calendar continuity regression: **22/22 scenarios passed**, covering completion, skip, editor saves/outcomes, failed writes, failed refreshes, retry, and day changes with preserved scroll/focus.
- Production Next.js build, lint and TypeScript checks: passed. `git diff --check`: passed.
- All browser data was isolated through API fixtures; existing routine entries were not modified.

The new week-specific colors live in `web/app/theme.css`; component rules consume them in `globals.css`. The prior theme browser assertion now expects the dark week header. Evidence is in `.impeccable/review/week-contrast/`. The updated build is running at http://localhost:3000/?view=week.

Re-run with Playwright available and Chrome installed:

```sh
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/week-contrast.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/calendar-continuity.browser.cjs
```

`CONTRAST_PHASE=before` captures without enforcing the improved contrast, for baseline inspection. Optional `BASE_URL`, `CHROME_PATH`, and `CALENDAR_TEST_OUTPUT` select target/browser/output. Exact-color checks use reduced motion to avoid measuring an in-progress hover transition. Physical devices, other browser engines, and a full-page accessibility audit were not tested in this change.
