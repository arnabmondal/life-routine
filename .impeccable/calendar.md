# Calendar and activity log
Mode: Operate. Route: /. Primary target: web/components/Dashboard.tsx.

## Direction contract
THESIS: Daywell's repeated school runs, dog walks, and protected focus blocks form a weekly rhythm. The schedule remains the main working surface.
OWN-WORLD: Taste editorial-greeting, seed 750623983. Pale sage ground, white schedule, tonal summary cells, regular-weight figures, retained green and life-area identity colors; no decorative imagery.
STORY: Open today’s commitments, record an outcome, reorder with a reviewed time suggestion, or switch to the week for broader planning. Counts derive from stored records.
FIRST VIEWPORT: Compact horizontal Daywell navigation, today/date/actions, Agenda/Week/Activity log tabs, a seven-date picker, and chronological agenda rows. Weekly metrics remain visible in a compact white stats cards above the date picker.
FORM: Approved option B, Today agenda, retains the pale sage/white/green world and existing Arial stack. Today is the primary working surface. Calendar settings and New activity remain adjacent; Week is one tap away. Agenda rows support pointer/touch grips and keyboard reordering with a suggested-time review before saving. The week grid retains direct drag-to-time behavior. No entrance motion; status feedback is immediate and reduced motion is supported.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Conflicts resolved
Taste's ≤2% accent budget and single-hue preference yield to existing five life-area colors, confined to small identity dots. Impeccable's direction-selection workflow yields to the user's Taste-led brief. App usability takes precedence over Taste's marketing-page image/motion floors. Existing UI font stack is retained with --keep palette,type; no new fonts are dealt.

## Scheduling extension — October 30, 2026
The calendar now places cards on a 24-hour local time grid. Dragging changes chronological order by changing the start time/day, preserving duration. Overlaps occupy separate equal-width lanes. Pointer moves snap to 15 minutes; touch grips can drop onto the date picker to retain time and change day. Keyboard pickup/arrows/commit/cancel, automatic save, rollback, and one-step Undo accompany the gesture. The original palette, navigation, summaries, editor, activity log, and template behavior remain.

## Activity log extension
Activity log adds a two-thirds completion-trend graph and one-third consistency leaderboard, stacked below 950px. The time scope is four/eight weeks ending with the selected week. Selecting a ranked activity filters the chart, while the weekly records stay below. Distinct completed days drive rank; repeated sessions do not inflate consistent-day counts. Query `?view=log` opens Activity log directly and preserves that view on refresh.

## Planning-hours extension
The original full-day grid is now configurable through Calendar settings beside New activity. Its default is 6:00 AM–10:00 PM. The native settings dialog groups Planning hours as its first extensible section. The preference is local to this browser, changes visible grid geometry only, and leaves stored activities and summaries intact. Boundary segments clip into the visible window; hidden records remain accessible through Activity log. Ordinary mutation scroll/focus continuity remains required.

## Today-first extension — November 6, 2026
The user selected the compact Today agenda (option B), explicitly retaining draggable reordering and requesting suggested time changes when necessary. No separate ordering field: confirmed start times keep agenda and calendar chronological. Dialog review preserves duration and all neighbor times; conflicts/outside-hours placement are disclosed. Current-week metrics use a compact strip before the schedule, per the November 9 correction. Existing Week view, log insights, planning hours, editor, seeding, status outcomes, rollback, Undo, and scroll/focus continuity remain.

## Visible statistics correction — November 9, 2026
Preserve all weekly metrics above the working schedule in a compact strip: 48px desktop, about 76px phone. Do not hide the stats or restore large cards. Keep the displayed week explicit and use the existing record-derived summary.

### Individual compact stats cards
The visible top statistics use four separate white cards with subtle borders with gaps between Scheduled, Completed/percentage, Hours, and Skipped. The week label remains explicit. Cards retain the compact footprint and four-column phone layout; they do not restore the previous large dashboard cards.

## Shared Sage & Chalk theme
The approved scheme is implemented through web/app/theme.css with data-theme="sage-chalk" on the root layout. White cards differ from Selected Sage dates; Forest Green is the action/focus/chart hue. Semantic success/error tokens cover feedback, while category dots preserve existing identity. Theme values are centralized; no marketing-page geometry, typography replacement, or animation was added to this working app.

## Established-theme boundary
The user rejected dark week headers. Keep light tonal-sage week headings with dark labels, green emphasis/focus and white cards with clear neutral edges. All UX must stay within Sage & Chalk unless the user explicitly asks for a theme change. Generic contrast/polish tasks do not authorize palette or role-hierarchy changes. See AGENTS.md and COLOR_THEME.md.

## Explicitly approved Dark theme and User settings
The user approved the dark-mode preview and requested implementation with a person-icon User settings menu at the top right. Both approved palettes now belong to the established design system: Light keeps white/sage/forest roles; Dark uses green-charcoal/soft-white/mint roles from COLOR_THEME.md. Offer Light, Dark and System (follow device appearance). Keep calendar settings separate, header height compact, and theme changes free of activity mutations/refetch/remounts. Persist in the browser, apply before paint and keep keyboard/outside dismissal accessible. This approval does not authorize additional themes or arbitrary role changes.

System appearance preference: follow the device/browser `prefers-color-scheme` setting and its live changes using the two approved palettes. Persist the choice as `system`, separately from the resolved palette. Apply before paint, synchronize across tabs, and preserve calendar state. Explicit Light/Dark ignore OS changes; missing/invalid preferences still default to Light.
