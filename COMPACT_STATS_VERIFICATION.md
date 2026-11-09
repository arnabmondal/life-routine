# Compact visible weekly stats — November 9, 2026

Restored weekly stats above the schedule, between the toolbar and date picker, replacing the hidden Week summary. The strip shows the displayed week, Scheduled, Completed plus completion percentage, Hours (planned hours of completed activities), and Skipped. It uses existing summary calculations and changes no activity or persistence behavior. Loading retains the layout with dashes; zero values remain zero. The same strip stays visible in Agenda, Week, and Activity log. Existing settings and drag/reorder functionality remain.

Measured height: **48px** at 1440px, 820px and 640px widths; **76px** at 390px and 320px widths. Desktop aligns all metrics on one line; phone has a compact week label followed by four columns. The large metric cards and collapsed summary have been removed from the rendered view. First agenda row is about 305px down on desktop and 360px on phone, keeping the schedule within the initial viewport.

## Checks performed
- Production Next.js build, lint and TypeScript validation: passed.
- Google Chrome / Playwright, America/Los_Angeles, 900px-high viewports at **1440, 820, 640, 390, and 320px**: passed.
- Six-record isolated fixtures correctly show Scheduled 6, Completed 2 / 33%, Hours 3, Skipped 1.
- Completing a one-hour planned activity changes the strip to Completed 3 / 50% and Hours 4; skipping another activity changes Skipped to 2.
- Page scroll, target entry viewport position and strip height remain unchanged through completion refresh. The strip remains visible with the same totals after switching to Week.
- No horizontal overflow, internal label/value collisions, or uncaught page errors at any tested width. Desktop and phone screenshots were visually inspected.
- No stored routine records were modified: browser tests intercept the API with fixtures.
- `git diff --check`: passed. No new unit tests were added for this presentation change; existing aggregation code was retained.

Product/design documentation and the calendar surface brief record the correction to the earlier hidden-summary decision. Historical November 6 layout measurements in TODAY_AGENDA_VERIFICATION.md describe the prior version; this report describes the current visible-stats layout.

Evidence: `.impeccable/review/compact-stats/` contains screenshots and machine-readable results. The updated web service is running at http://localhost:3000.

Re-run with the app and installed Chrome:

```sh
npm install --prefix /tmp/daywell-browser playwright@1.65.0
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/compact-stats.browser.cjs
```

Optional `BASE_URL` and `CHROME_PATH` select the app and browser. Browser tests are separate from the unit suite. Physical devices and other browser engines were not tested in this change.

## Individual-card revision
The user requested four separate cards instead of one ribbon. Each metric now has its own tonal surface, rounded corners and a visible gap. The same focused browser suite passed at 1440, 820, 640, 390 and 320px, checking values, completion/skip updates, scroll continuity and overflow. Heights measured 48.5px, 48px, 60px, 76px and 76px respectively. Desktop and phone screenshots were visually inspected. Production build/type checks and git diff whitespace checks passed. Updated evidence is in `.impeccable/review/compact-stats-cards/`.
