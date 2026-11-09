# Sage & Chalk theme verification — November 9, 2026

## Implementation
`web/app/theme.css` centralizes semantic page, surface, text, border, action, focus, selected-state, success, danger, weekend, drag-preview, selection, dialog and category color values. The root layout imports it before component CSS and sets `data-theme="sage-chalk"`. Existing style aliases reference these tokens, so no layout migration is needed. `web/lib/theme.ts` shares category-to-variable references across the dashboard/log, daily agenda, week calendar and insights.

Applied the approved palette: #F3F5F1 page, #FFFFFF cards/schedule/fields/dialogs, #DAE9DF selected days and navigation, #23765E actions/charts/focus, #263B32 primary text, #58675E secondary text, #DCE2D9 dividers, and #9B3E38 skipped/error accents. Selected dates have a green inset underline, and selected navigation/leaderboard/status controls retain their selected colors on hover. Semantic status backgrounds, browser text selection, scrollbars and modal overlays share the theme. Native inputs explicitly use the approved light color-scheme.

All app/component color literals were removed from `globals.css` and React components; they live in theme.css. Category dots keep their established identities. The compact stats geometry, scheduling logic, persistence and interaction contracts remain. No additional theme switcher, runtime dependency or database change was introduced. COLOR_THEME.md describes extension through root-level semantic overrides.

## Checks performed
- Final production build, lint and TypeScript validation: passed.
- Existing unit suite: **25/25 passed**.
- Existing agenda gesture/mutation regression: **36 grouped scenarios passed** at 1440, 820, 390 and 320px, including pointer/touch/keyboard reordering, proposal cancellation, failed writes, retry, Undo, editor handoff, scroll/focus continuity and retained week dragging.
- Compact-statistics regression: **five widths passed** (1440, 820, 640, 390, 320px), validating values, completion/skip updates, compact dimensions, absence of label collision/overflow, and Week-view visibility.
- Dedicated theme regression: **16 grouped scenarios passed** at 1440, 820, 390 and 320px. Agenda, Week, Activity log/chart/leaderboard, settings, activity editor and suggested-time dialog use the expected computed semantic colors. Error surfaces and text use danger tokens; Retry recovers. Category identity and selected/success states were verified. No uncaught page errors or horizontal overflow occurred.
- Runtime token propagation was tested by temporarily overriding the root action color in the isolated browser: the primary button and chart updated together. Overriding the category token updated the leaderboard dot. Overrides were then removed; no production files or saved preferences were changed by that check.
- Actual rendered contrast ratios passed 4.5:1 for card labels, values, secondary percentages, selected dates, primary button labels and error text. Representative pairs: primary text on white **11.97:1**, secondary text on white **5.97:1**, primary button label **5.49:1**, selected-day text **6.26:1**, and danger feedback **5.94:1**.
- Exact-color checks use reduced motion to avoid sampling a 150ms color transition mid-frame. The normal-motion agenda regression ran separately. At 320px the browser preferred dark mode, while the application correctly retained its explicitly chosen light native-control scheme.
- Desktop and phone screenshots of agenda and log were visually inspected; settings/editor/proposal and week screenshots were captured at all four widths. White stats cards are visibly distinct from sage selected dates. `git diff --check` passed.

Tests used installed Google Chrome driven by Playwright 1.65.0 with America/Los_Angeles timezone. Browser fixtures intercepted API calls; no stored routine entries were modified. Physical touch devices, other browser engines and screen-reader sessions were not checked for this theme-only change. This is an existing working-app color integration, so marketing-page hero, section-height and animation gates were not applied to its approved compact agenda layout.

## Evidence and rerun
`.impeccable/review/sage-chalk/` contains computed-color/contrast results, gesture/stats results and screenshots. Product/design/README documentation and the calendar brief reflect the applied scheme. The final build is running at http://localhost:3000.

```sh
npm install --prefix /tmp/daywell-browser playwright@1.65.0
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/theme.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/compact-stats.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/agenda.browser.cjs
```

Optional `BASE_URL`, `CHROME_PATH` and `CALENDAR_TEST_OUTPUT` control the target and output where supported. Browser suites remain separate from the dependency-light `npm test` unit suite.
