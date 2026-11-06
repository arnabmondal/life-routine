# Calendar and activity log
Mode: Operate. Route: /. Primary target: web/components/Dashboard.tsx.

## Direction contract
THESIS: Daywell's repeated school runs, dog walks, and protected focus blocks form a weekly rhythm. The schedule remains the main working surface.
OWN-WORLD: Taste editorial-greeting, seed 750623983. Pale sage ground, white schedule, tonal summary cells, regular-weight figures, retained green and life-area identity colors; no decorative imagery.
STORY: See the whole week's commitments, choose a day, record its outcome, or add a commitment. Counts derive from stored records.
FIRST VIEWPORT: Quiet Daywell navigation, a 30px personal heading, four compact summaries, then a seven-column calendar with date navigation and New activity. On tablet/phone the day picker reveals one readable daily schedule.
FORM: Taste open-plane editorial home translated to a calendar; the 7-day sheet spans the full 12-column content grid. Signature interaction: choose a date to read that day's routine on narrow screens. No entrance motion; status feedback is immediate and reduced motion is supported. Impeccable concept roll replaced by the user's explicit Taste-led direction. seed: none (unavailable).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Conflicts resolved
Taste's ≤2% accent budget and single-hue preference yield to existing five life-area colors, confined to small identity dots. Impeccable's direction-selection workflow yields to the user's Taste-led brief. App usability takes precedence over Taste's marketing-page image/motion floors. Existing UI font stack is retained with --keep palette,type; no new fonts are dealt.

## Scheduling extension — October 30, 2026
The calendar now places cards on a 24-hour local time grid. Dragging changes chronological order by changing the start time/day, preserving duration. Overlaps occupy separate equal-width lanes. Pointer moves snap to 15 minutes; touch grips can drop onto the date picker to retain time and change day. Keyboard pickup/arrows/commit/cancel, automatic save, rollback, and one-step Undo accompany the gesture. The original palette, navigation, summaries, editor, activity log, and template behavior remain.

## Activity log extension
Activity log adds a two-thirds completion-trend graph and one-third consistency leaderboard, stacked below 950px. The time scope is four/eight weeks ending with the selected week. Selecting a ranked activity filters the chart, while the weekly records stay below. Distinct completed days drive rank; repeated sessions do not inflate consistent-day counts. Query `?view=log` opens Activity log directly and preserves that view on refresh.

## Planning-hours extension
The original full-day grid is now configurable through Calendar settings beside New activity. Its default is 6:00 AM–10:00 PM. The native settings dialog groups Planning hours as its first extensible section. The preference is local to this browser, changes visible grid geometry only, and leaves stored activities and summaries intact. Boundary segments clip into the visible window; hidden records remain accessible through Activity log. Ordinary mutation scroll/focus continuity remains required.
