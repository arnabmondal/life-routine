# Calendar planning hours — November 5, 2026

## Delivered behavior
A Calendar settings gear follows New activity. Its native modal uses the existing Daywell dialog, fields, focus outlines, green actions, and responsive spacing. Planning hours is the first independent section; future calendar-view settings can be added in the same component.

Default hours are 6:00 AM–10:00 PM. Start/end choices use 15-minute increments, including an explicit end-of-day midnight choice. End must follow start within the same day. Save validates and persists the preference under `daywell.calendar-settings.v1` in this browser. Cancel, Close, and Escape discard drafts. Reset changes the draft to the default hours. Storage failures retain the dialog/draft and show an actionable error; malformed stored data falls back safely.

Grid dimensions, ticks, event placement, overlap allocation, previews, pointer dragging and keyboard movement use the selected bounds. Entries crossing a boundary are clipped to the visible portion; wholly hidden entries have a count and link to Activity log. Preferences never mutate stored activity records or weekly-summary totals. New activity defaults to a time inside the planning window; exact editor times remain unrestricted. Settings changes intentionally reposition the grid to the earliest visible commitment; ordinary activity mutations still preserve scroll/focus.

## Executed checks and results
- Production build, lint and TypeScript validation: passed.
- Unit suite: **17/17 passed**, including five new checks covering range validation, midnight labels, clipping, overlap lanes, and overnight continuation inside a quarter-hour window.
- Chrome via Playwright 1.65.0, America/Los_Angeles, **1440×900, 820×900, 390×900, and 320×900**: **32 grouped browser checks passed**. Tests intercepted API calls with isolated fixtures; existing database records were not edited.
- Default range is 06:00–22:00, with a 2304px time body at 144px/hour. A 05:00–07:00 fixture clips to 06:00–07:00; 21:30–23:00 clips at 22:00; a 23:00 fixture is hidden and counted.
- Cancel and Escape discard edited hours and restore focus to the gear. Invalid 20:00–08:00 is rejected. Saving 08:15–20:45 renders a 1800px time body, places 09:00 at 108px, and writes no activities. Reload retains the chosen values.
- A 10:30–11:15 planning window gives a new-entry draft of 10:30–11:15.
- Complete, Skip and note-save actions within the cropped default grid keep the same mounted grid, page/grid scroll offsets, entry position and control focus at every tested width.
- Keyboard movement saves 09:00→09:15; pointer grip movement of 36px saves 09:15→09:30, verifying the cropped-grid coordinate origin.
- Blocked browser storage keeps settings open and does not apply the draft. Reversed persisted bounds fall back to defaults. No uncaught page errors, horizontal page overflow or internal dialog width overflow occurred.
- Prior full-day calendar continuity regression: **22/22 scenarios passed** at desktop and phone widths, including failed writes, failed refreshes, retry, and moving entries between days. That suite now explicitly selects a full-day window; the settings suite separately checks mutation continuity within cropped hours.
- Desktop, tablet and phone screenshots were visually inspected, including the 320px two-row action bar. Native modal backdrops cover the viewport; full-page screenshots can show undimmed content outside that viewport.
- `git diff --check`: passed.

Evidence: `.impeccable/review/calendar-settings/` contains screenshots and machine-readable results. Product, design, and calendar surface documentation reflect the configurable hours. The updated web service is running at http://localhost:3000.

## Re-run
With the app running and installed Chrome:

```sh
npm install --prefix /tmp/daywell-browser playwright@1.65.0
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/calendar-settings.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/calendar-continuity.browser.cjs
```

Optional environment variables: `BASE_URL`, `CHROME_PATH`, and `CALENDAR_TEST_OUTPUT`. Browser checks are separate from the dependency-light unit suite (`npm test`). Viewport checks used desktop Chrome with mouse/keyboard input; physical touch devices, Safari/Firefox, and screen-reader sessions were not tested. The preference is local to this browser, not synchronized across devices.
