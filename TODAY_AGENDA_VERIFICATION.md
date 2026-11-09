# Today-first agenda with draggable reordering — November 6, 2026

## Result and behavior
Implemented the user-selected option B. Today’s agenda is the default; Week and Activity log remain one tap away. The greeting, vertical sidebar, and large progress cards no longer precede the schedule. Horizontal navigation, date/actions, view tabs and the seven-date picker lead directly to chronological rows. Weekly metrics live in a collapsed Week summary after the schedule. Settings stay adjacent to New activity. The existing palette, font family, life-area colors, API, and database schema remain.

Each agenda row retains edit, complete/skip, and a mouse/touch drag grip. Keyboard: Space or Enter picks up, Up/Down chooses position, Enter reviews the suggestion, Escape/Tab cancels. A green insertion rule previews the position. Held pointers near viewport edges scroll a long agenda. Pointer cancellation, actual capture loss, window blur, and day/window changes clear active drags. Secondary pointers do not replace the active session. Touch capture transfer from SVG to the containing grip must not cancel a valid drag; this was found in browser testing and corrected in agenda and week views.

Agenda order remains chronological. Dropping into a different position proposes a new start/end time, keeps duration, and leaves all neighbors unchanged. Suggestions prefer nearby gaps and quarter-hour times; tight gaps can use exact-minute suggestions. Overlaps and outside-hours placement are explicitly disclosed. If identical neighbor starts leave no chronological insertion, Apply is unavailable and the user can choose another position or edit exact times. No API write happens before Apply time change or an explicit editor save. Cancel/Close/Escape keep the original order. Edit exact times opens the existing editor with the suggested draft. A failed save rolls back the optimistic update, keeps the proposal/error open and restores dialog focus; retry and one-step Undo are available. Week-grid moves retain immediate-save/Undo behavior.

## Space recovered, measured with the real routine

| Viewport | Previous first grid position | New first agenda row | Full rows visible initially |
| --- | --- | --- | --- |
| 1280×800 | 629.6px | 247.3px | 7 |
| 390×844 | 812.8px | 276.4px | 5 |
| 820×900 | — | 243.3px | 8 |
| 320×844 | — | 276.4px | 5 |

The schedule begins about 382px earlier on desktop and 536px earlier on phone. Counts and names in live screenshots come from stored activities, without invented content. The final 320px layout keeps the Today shortcut visible, with no horizontal overflow. Grip and outcome targets measured at least 44px. Today navigation from another date was checked on the final 320px build.

## Executed checks
- Final production Next.js build, lint and TypeScript checks: passed.
- **25/25 unit tests passed**, including eight reorder-proposal cases: earlier/later insertion, unchanged-position no-op, exact duration/neighbor preservation, tight-gap conflict reporting, equal-time blocking, outside-hours placement, overnight end, and DST-date elapsed duration.
- **36 grouped agenda browser scenarios passed** in installed Google Chrome through Playwright 1.65.0, America/Los_Angeles, at **1440×900, 820×900, 390×900 and 320×900**. Fixtures intercept the API and never write to the stored routine.
- At every width: today-first layout and collapsed summary; mouse reorder with zero writes before confirmation; confirmed times/order/metadata; synthesized touch reorder and Cancel; keyboard reorder; injected 503 rollback with proposal/focus retention; retry; Undo; overlap warning; Escape; exact-time editor handoff; complete/skip/note-save scroll, entry-position and focus continuity; active pointer cancellation and subsequent keyboard pickup; retained week-view touch drag; settings access; day navigation, empty-day state and correct new-entry date. No uncaught page errors or horizontal overflow.
- An additional **long-agenda phone gesture check passed**: hold a pointer at the bottom edge, verify page scrolling continues, press Escape, verify no proposal/write, then pick up again successfully.
- Existing planning-hours browser suite: **32/32 grouped checks passed** across the same four widths. Existing full-day week-calendar continuity suite: **22/22 scenarios passed** at desktop/phone widths. These suites explicitly open `?view=week` now that the default is Agenda.
- **Real API/database smoke checks passed at 1440px and 390px**: create two uniquely named temporary entries; drag one before the other; read back the unchanged original time while the review is open; confirm; read back the changed chronological time and preserved 15-minute duration/notes; Undo and read back the original start; delete both entries in cleanup. Existing routine entries were not changed.
- Desktop, tablet, phone and narrow-phone screenshots were visually inspected with fixture and real schedule content. Calendar settings and activity editor still use the established native dialog pattern. `git diff --check` passed.

## Evidence and rerun
`.impeccable/review/today-agenda/` contains fixture/live screenshots, proposal previews, layout measurements, and machine-readable results. `PRODUCT.md`, `DESIGN.md`, README and the calendar surface brief record the behavior contract and approved direction. No database migration or new runtime dependency was added. The final build is running at http://localhost:3000.

With the app and installed Chrome available:

```sh
npm install --prefix /tmp/daywell-browser playwright@1.65.0
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/agenda.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/agenda-autoscroll.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/calendar-settings.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/calendar-continuity.browser.cjs
```

Browser suites remain separate from the dependency-light `npm test` unit suite. `CHROME_PATH` optionally selects a Chrome executable; `BASE_URL` selects the app URL (week-grid regressions should point to `?view=week`); `CALENDAR_TEST_OUTPUT` changes screenshot output where supported.

Not tested: physical touch hardware, Safari/Firefox, screen-reader sessions, multi-user concurrency, or arbitrary browser reload/back-forward scroll restoration. Synthesized touch checks use Chrome DevTools input, not just a narrow mouse viewport. Long-agenda auto-scroll was exercised with mouse pointer input. Tight identical-start insertion is deliberately blocked rather than silently moving neighboring events.
