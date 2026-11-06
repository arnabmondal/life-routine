# Calendar editing continuity — November 5, 2026

## Root cause
`Dashboard.load()` previously set `loading=true` and cleared `items` after every mutation. Its conditional loading branch removed `WeekCalendar` from the tree. On remount the calendar lost its scroll offsets and selected mobile day, and its week-initialization effect scrolled to the earliest activity again. The effect's `[weekKey]` dependency could not protect state across an unmount.

Mutation handlers do not navigate or refresh the router. Activity keys are stable IDs and day keys are stable local dates; changing keys was unnecessary. Additional browser checks exposed focus loss from disabled controls and page-end scroll clamping when retry removed an error message.

## Changes
- Only initial/new-week loads replace the schedule with a loading skeleton. Same-week refreshes keep existing records and the mounted grid while the request runs; request-version guards still reject stale responses.
- Apply the server's returned activity before refreshing. A successful write followed by a failed read retains the saved result and allows retry. Failed writes leave calendar records unchanged; failed editor saves retain the dialog and draft.
- Remember the calendar/editor opener, restore focus with `preventScroll`, and avoid overriding focus the user deliberately moved elsewhere. Resolve a replacement card by activity ID if a time/day edit relocates its DOM node. If the card is outside the selected mobile day/visible week, focus the grid without changing its day or scroll position. Failed saves retain focus inside the dialog. Retry returns focus to the prior entry control.
- Feedback follows the schedule and retains its largest displayed height for the mounted session. Showing or removing an error therefore neither displaces the grid nor shortens the page underneath the user near its end.
- Existing Taste direction (“A Quiet Weekly Rhythm”), colors, fonts, responsive day picker, scheduling calculations, and native dialog remain. PRODUCT.md and DESIGN.md record the continuity contract. No design-guidance conflict arose.

## Executed checks
Production Next.js build, lint/type validation: passed. Existing Node tests: **12/12 passed** (calendar layout, overlap, snapping, movement, DST, and insights). `git diff --check`: passed.

Installed Google Chrome, headless, driven by Playwright 1.65.0; viewport sizes **1440×900** and **390×900**, America/Los_Angeles timezone. The phone check emulates the viewport; it is not a physical touch-device test.

The committed `web/tests/calendar-continuity.browser.cjs` uses isolated API fixtures and delayed requests (120ms). It does not write to the database. At **both widths**, these checks passed:

| Check | Result |
| --- | --- |
| Quick Complete, followed by data refresh | Saved status rendered; same grid node, offsets, entry position, day, and control focus |
| Quick Skip, followed by data refresh | Same preservation checks; skipped status rendered |
| Edit notes and save | Dialog closes; focus returns to editor opener; viewport unchanged |
| Failed Skip and failed Complete writes (503) | Existing status retained; error shown; viewport and originating focus retained |
| Failed editor write (503), then Cancel | Unsaved draft and open dialog retained; focus remains inside dialog; cancel returns to entry without scrolling |
| Save completed and skipped outcomes from editor | Both statuses rendered; opener focus and viewport retained |
| Successful completion write followed by failed refresh (503) | Saved completed result retained; error shown; viewport and entry focus retained |
| Retry after failed refresh, from page end | No page-height clamping; same offsets/entry position; focus returns to entry |
| Change entry to next day in editor | Correct day relocation; same grid, scroll offsets, and selected day; desktop entry focus restored; phone falls back to grid when moved entry is hidden |
| Responsive render and runtime | No horizontal page overflow or uncaught page errors; desktop and phone screenshots visually inspected |

There are **22 recorded fixture scenarios** across the two widths. For actions that keep the event at the same scheduled time/day, the maximum measured change in grid scroll, page scroll, and event viewport top was **0px**. Grid scroll remained 2462px throughout these checks. Explicit scrolling to reach Retry was measured before the retry, rather than counted as a mutation-induced change. Changing a day intentionally relocates the event; on mobile its former selected-day segment disappears while the viewport remains stationary.

A separate browser smoke check used the **real local API and database** at both widths: create a uniquely named temporary Wednesday 18:00–19:00 entry; click Complete; click Skip; edit notes; verify refresh and read-back of persisted notes/status; delete the temporary entry in cleanup. **All six mutation checks passed**, with unchanged grid/page/entry offsets and restored focus. Existing routine entries were not edited.

Evidence: `.impeccable/review/calendar-continuity/results.json`, `live-results.json`, `1440.png`, and `390.png`. The final local web service is running the updated production build at http://localhost:3000.

## Re-run fixture regression
From the project root with the app running and Chrome installed:

```sh
npm install --prefix /tmp/daywell-browser playwright@1.65.0
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/calendar-continuity.browser.cjs
```

`BASE_URL` optionally changes the app URL; `CHROME_PATH` selects an installed browser executable; `CALENDAR_TEST_OUTPUT` changes the screenshot directory. Default output is the OS temporary directory under `daywell-calendar-continuity`. The browser test intentionally has a `.browser.cjs` suffix so the existing dependency-light `npm test` unit suite does not require Playwright.

Not tested: physical touch hardware, Safari/Firefox, assistive-technology sessions, and complete browser reload/back-forward restoration. Intentional week/day navigation retains its existing positioning behavior; this fix targets mutations and same-week refreshes.
