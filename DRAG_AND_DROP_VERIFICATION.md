# Drag scheduling and overlap — October 30, 2026

## Behavior
The calendar is now a 24-hour local-time grid. Drag vertically to change start time, horizontally to change day, keeping elapsed duration and all other fields. Times snap to 15 minutes. Chronological ordering follows the saved times. Overlapping activities are allowed; equal-width lanes keep them separately selectable. Short events have a 20-minute minimum visual footprint, also included in lane calculations so text cannot cover neighboring cards. Midnight-spanning activities have continuation segments on the next visible day within the fetched week.

On narrow screens, drag the grip; dropping onto a date in the picker changes day while retaining the original start time. Card bodies remain touch-scrolling surfaces. Keyboard: focus Move, Space to pick up, Up/Down by 15 minutes, Left/Right by day, Enter to save, Escape or Tab to cancel. The editor remains available for exact times and duration changes. Short cards expose full details and outcomes in the editor; longer cards retain quick outcome controls.

Moves save immediately with optimistic position changes. A failed save restores the old activity and shows a recovery message. Successful moves offer one-step Undo. Dragging is restricted to the displayed week; the editor can use other dates. No database/schema or API changes, third-party dependencies, or new recurrence rules were introduced.

## Executed checks
| Check | Result |
|---|---|
| Five production builds (`docker compose build web`) | All passed compilation, Next.js lint/type validation, page generation and tracing. Only the web service was recreated. |
| Seven unit scenarios (`docker compose run --rm --no-deps -e TZ=America/Los_Angeles web npm test`) | 7 passed, 0 failed. Two-way overlap; touching endpoints; chained lane reuse; three simultaneous events; minimum-height short cards; overnight clipping; duration/field preservation across midnight; DST destination time; snapping/clamping. Some scenarios contain multiple assertions. |
| Mouse drag into overlap | Temporary activity A moved later than B; both occupied half-width lanes, retaining their one-hour durations. |
| Cross-day pointer drag | A moved from Saturday 7:15 AM to Sunday 7:30 AM using the card body; saved destination matched the intended 15-minute vertical displacement. |
| Undo | Restored Saturday 7:15 AM after the cross-day move. |
| Keyboard preview/cancel | Space, Right, Down, Escape previewed Sunday 7:30 AM then cancelled without saving. |
| Keyboard commit and persistence | Space, Down, Enter saved Saturday 7:30 AM. Reload and backend read confirmed the stored 7:30–8:30 AM interval and unchanged notes/status/category. |
| Phone-width grip drag | At 390×844, dragging A's 44px grip moved 7:30 to 7:15 AM and saved. |
| Phone-width date drop | Dragged B's grip onto Sunday in the date picker. Saved Sunday 7:00–8:00 AM, preserving its original start clock time and elapsed duration across the DST weekend. Undo restored Saturday. These were mouse gestures in a phone-width viewport, not physical-touch tests. |
| Failed-save rollback and retry | Deleted only temporary A behind the stale browser view, attempted a keyboard move, received the expected failed API response. UI restored 7:15–8:15 AM and displayed the rollback message. Retry refreshed the actual stored schedule. |
| Existing editor | Clicking a short Dog walk card opened Edit activity. Closed without saving. |
| Temporary data cleanup | Removed the two specific test IDs; sorted API records were exactly equal to the captured baseline of 60 original activities, including all fields. |
| Responsive visual inspection | Two automated screenshot rounds at 1440×900, 768×1024 and 390×844; final six images (folds plus page-scroll contact sheets) opened and inspected. Live browser also checked at 1440×1000 for drag operation. Phone and tablet document widths equaled viewport widths. |
| Taste inspector | Final 0 FAIL, 3 WARN. Functional status controls allowed via `--allow icon-chips`. Warnings and decisions below. |
| Taste static lint | 0 FAIL, 1 WARN for today's inset marker being detected as a shadow; retained as a current-day indicator. |
| Impeccable detector | Ran once during implementation; output `[]`. Later changes were visual/gesture fixes, so this is not a claim of a fresh final detector run. |
| Final hygiene | `git diff --check` passed; design sidecar JSON parsed. |

## Visual warning decisions
- `unused-canvas`: the seven-column calendar fills its sheet. Empty weekend columns remain usable drop destinations; their lack of cards is real schedule data, not dead layout space.
- `heavy-borders`: draggable cards use the control-edge color to make individually selectable boundaries clear, especially in overlap lanes. No card shadows were added.
- `tiny-text`: time ranges, category/outcome metadata and axis labels use 11–12px; titles remain 12–14px depending on density. Tooltips, accessible names and the editor provide full details for truncated cards. This is a retained density tradeoff, not a full accessibility certification.

## Limits
- No physical touch device, Safari/Firefox, screen-reader or full focus-cycle audit was run. Pointer handlers support touch, but phone-width mouse checks do not prove hardware touch behavior.
- Edge auto-scroll was implemented and source-reviewed, not separately exercised as a held-at-edge test. Keyboard cancellation via Escape was verified; Escape during an active pointer drag and dropping outside the grid were not separately tested.
- Three-way overlaps, very short events, overnight continuations and DST were checked in unit scenarios; only two-way overlap was visually exercised.
- The local-time grid cannot distinguish both occurrences of an ambiguous repeated DST clock hour. The DST test uses a normal daytime destination.
- Continuations from an activity that starts before the fetched week retain the backend's existing start-based fetch limitation.
- No resize gesture: moving preserves duration. Change duration in the existing editor.
- Manual drag/overlap/recovery tests preceded the final small optimization to avoid repeated identical previews and the initial-scroll refinement. The final production build and all three visual sizes were checked after those changes.

## Documentation and source
PRODUCT.md, DESIGN.md, README.md, the calendar surface brief and .impeccable/design.json reflect scheduling support. Core logic: web/lib/calendar.ts. Calendar interactions: web/components/WeekCalendar.tsx. Persistence/Undo: web/components/Dashboard.tsx. Unit checks: web/tests/calendar.test.cjs.
