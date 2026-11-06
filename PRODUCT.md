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
Seven-day calendar and chronological activity log; previous/next/current-week navigation; create, edit, delete; planned/completed/skipped outcomes; notes; starter routine and filling missing template slots. Week summaries count all scheduled activities, completed and skipped activities, and planned durations of completed activities. Those hours are not a timer. Template entries are individual activities, not recurrence rules. Drag activities within the displayed week to change their start date/time in 15-minute increments while keeping elapsed duration. Keyboard moves use Space, arrows, Enter, and Escape; the editor supports precise times. Overlapping activities are allowed and occupy separate lanes. Moves save immediately, roll back on failure, and offer a one-step Undo. No login, sync, notifications, or multiple users. Preserve local-only bindings and existing database data.

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
Calendar settings, beside New activity, configure one same-day local-time window in 15-minute increments. Default: 6:00 AM–10:00 PM; a full day is available using 12:00 AM through the end-of-day midnight option. The range persists in this browser across reloads. This is a view preference: activities outside the window remain saved, included in weekly summaries and available in the activity log. Boundary-crossing entries are clipped visually; editing precise times remains unrestricted. New-entry defaults and drag destinations respect the visible window. Future calendar-view settings belong in the same dialog.
