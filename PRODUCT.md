# Daywell
<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
A single person planning a balanced personal week. The user confirmed the private focus on school transport, dog walks, health, career, learning, and family time.

## Product Purpose
Plan commitments and record what happened without treating a missed activity as failure.

## Operating Context
Self-hosted, local application. Monday-based weeks; dates and entry times follow the browser's local timezone. Next.js frontend and API bridge, Node gRPC backend, PostgreSQL persistence, Docker Compose.

## Capabilities and Constraints
Today-first daily agenda, seven-day calendar, and chronological activity log; previous/next/current-week navigation; create, edit, delete; planned/completed/skipped outcomes; notes; starter routine and filling missing template slots. Week summaries count all scheduled activities, completed and skipped activities, and planned durations of completed activities. Those hours are not a timer. Template entries are individual activities, not recurrence rules. Drag activities within the displayed week to change their start date/time in 15-minute increments while keeping elapsed duration. Keyboard moves use Space, arrows, Enter, and Escape; the editor supports precise times. Overlapping activities are allowed and occupy separate lanes. Week-grid moves save immediately, roll back on failure, and offer a one-step Undo. Agenda reorders propose a time change for review before saving; the same rollback and Undo apply. No login, sync, notifications, or multiple users. Preserve local-only bindings and existing database data.

## Brand Commitments
Keep Daywell, its personal routine identity, green accent, existing five life-area colors, supportive voice, and Arial/Helvetica UI stack. The redesign may replace presentation while preserving product behavior.

## Evidence on Hand
README.md; web/components/Dashboard.tsx; backend template and schema; existing activities served by the local API. Do not invent progress, personal events, or measured time.

## Product Principles
- Show commitments before motivational messaging.
- Keep outcomes explicit and reversible.
- Preserve room for unplanned time.
- Make phone planning usable without a sideways calendar.

## Accessibility & Inclusion
Keyboard-operable controls, named inputs and actions, visible focus, native modal focus management, readable contrast, reduced-motion support. No product-specific assistive needs were supplied.

## Activity trends and consistency
Activity log includes a daily completion graph for four or eight weeks ending with the displayed calendar week, alongside a top-five consistency leaderboard. Counts follow scheduled local dates, not completion timestamps. Future dates are left blank and excluded from completion totals. Leaderboard groups by normalized title and category, ranks distinct completed days first, then completed-day/eligible-scheduled-day rate, then completion count and name. Multiple sessions on one day count as one consistent day. Later planned slots today do not penalize the rate. Selecting a leaderboard entry filters only the graph; the weekly activity log remains below. Historical data is fetched read-only from the existing activities API and refreshed after edits.

### Calendar editing continuity
Same-week saves, completion/skip actions, and retries refresh data in place: keep the time grid mounted, its scroll offsets, and the selected mobile day. Preserve the saved server result if a subsequent refresh fails. Return editor/outcome focus without scrolling; failed editor saves retain the draft and dialog. Feedback follows the schedule so messages do not displace the working entry. Initial week loads and explicit week/day navigation retain their intentional positioning behavior.

### Calendar planning hours
Calendar settings, beside New activity, configure one same-day local-time window in 15-minute increments. Default: 6:00 AM–10:00 PM; a full day is available using 12:00 AM through the end-of-day midnight option. The range persists in this browser across reloads. This is a view preference: activities outside the window remain saved, included in weekly summaries and available in the activity log. Boundary-crossing entries are clipped visually; editing precise times remains unrestricted. New-entry defaults and week-grid drag destinations respect the visible window. Agenda reorders may suggest outside-hours placement when the chosen order cannot fit; that is explicitly warned before confirmation. Future calendar-view settings belong in the same dialog.

### Today-first agenda and reordering
The default landing view is today’s chronological agenda, with Agenda, Week, and Activity log one tap away. Compact top navigation, the day/date, New activity, settings and a seven-day picker precede the schedule. Weekly metrics remain visible in a compact strip above the schedule, without a greeting or large metric cards. The strip shows the displayed week’s scheduled, completed, completion percentage, planned hours of completed activities, and skipped counts. Day arrows navigate dates, crossing week boundaries when needed; Week/log arrows navigate weeks. New activities default to the selected day. `?view=week` and `?view=log` preserve direct access to those views.

Mouse and touch users reorder agenda rows by their grips; keyboard users pick up with Space/Enter, choose a position with Up/Down, and press Enter to review. Escape/Tab cancel. Dropping proposes a start/end time that makes the requested order chronological, preserves elapsed duration, and leaves every neighbor unchanged. Suggestions prefer adjacent gaps and local quarter-hours when possible, with exact-minute suggestions for very tight gaps. Conflicts and outside-hours placement are explicitly disclosed. Equal-time neighbor groups with no possible chronological insertion require a different position or exact editing. No write occurs until Apply time change or a subsequent editor save. Cancel/Close/Escape keep existing times/order. Failed saves keep the review open, restore the original activity, and allow retry. One-step Undo restores the previous time. The agenda does not introduce a separate manual-order field that could disagree with the calendar.

### Individual compact stats cards
The visible top statistics use four separate white cards with subtle borders with gaps between Scheduled, Completed/percentage, Hours, and Skipped. The week label remains explicit. Cards retain the compact footprint and four-column phone layout; they do not restore the previous large dashboard cards.

### Shared application theme
Approved Sage & Chalk Light and Dark apply consistently to Agenda, Week, Activity log/insights and dialogs: pale sage page, individual white stats cards, sage selected states, forest green actions/focus, and distinct success/error colors. Existing life-area colors remain small category identifiers. All views share semantic CSS tokens; layout and scheduling behavior are unchanged.

### Theme is an explicit user constraint
All UI and UX updates must remain within the established Sage & Chalk palette and semantic role hierarchy. Only an explicit request to change the theme authorizes a different theme. Contrast fixes must retain approved light surfaces, dark labels, white cards and forest-green actions/focus.

### User settings and theme preference
A top-right person icon opens User settings. Appearance offers the explicitly approved Light and Dark themes; selection applies immediately and persists in this browser. The saved preference applies before the page renders and synchronizes between tabs. Missing/invalid data uses Light. If browser storage is blocked, the choice works for the current visit with a visible persistence message. The menu is extensible for future user-specific settings; no account/authentication is implied. Calendar planning hours remain separate under the calendar settings gear. Other palette or visual-role changes still require an explicit request.
