# Activity log insights — October 30, 2026

## Delivered
Activity log now contains a two-thirds completion-trend graph and one-third top-five consistency leaderboard. Measured desktop columns at 1440px: 758.664px / 379.336px. At 950px and below, the regions stack. Existing weekly records, edit controls and status actions remain below. Activity log can be opened or refreshed at `http://localhost:3000/?view=log`.

The graph offers four or eight weeks ending with the selected calendar week. Daily counts use completed records grouped by scheduled local date; upcoming dates remain blank. Select a leaderboard row to filter the graph, or Show all activities to clear it. Exact day values are available through the pointer readout, native keyboard-operable slider and expandable daily table.

Consistency groups by normalized title and category. It ranks distinct days with at least one completed record, then the fraction of eligible scheduled days with a completion, then total completions and name. Repeated sessions on one day count as one active day. Later planned slots today and future dates do not penalize the rate. The weekly list is independent of the graph's selected activity/time range.

## Checks executed
- Two Docker production builds passed Next.js compilation, framework lint/type checks, page generation and tracing. Recreated only web.
- `docker compose run --rm --no-deps -e TZ=America/Los_Angeles web npm test`: 12 passed, 0 failed. Five new trend tests cover total reconciliation, duplicate sessions, due/future dates, ranking/ties, activity grouping and filtering, empty/range bounds, and local dates across DST. Seven calendar scheduling regressions also passed.
- Browser checked at 1440×1000 for initial interaction and 1440×900, 768×1024, 390×844 for final rendered inspection.
- Live records: 20 completions across five active days. Dog walk filters to five completions across four days; Dog walk and School drop-off lead at four days each. These are real records, not demonstration values.
- Clicked Dog walk in the leaderboard, confirmed filtered graph caption; Show all restored total scope. Selection also worked at phone width.
- Expanded daily data: 28 rows for four weeks and 56 for eight. Changed period selector; graph retained the correct 20-record total.
- Slider ArrowLeft changed the accessible day readout to Thursday, October 29, with zero completed Dog walks.
- Previous-week navigation displayed both honest empty-history states; Today restored the current history.
- Phone/tablet document scroll width equaled viewport width (390/768), with stacked panels. No clipped labels or overlapping graph controls observed in the final screenshots.
- Direct Activity log URL and reload both retained the Activity log view.
- Taste inspector against `/?view=log`: 0 FAIL, 1 WARN for the proportion of 11–12px metadata. This is retained for secondary labels/axis ticks; primary labels are larger. Opened and visually reviewed all nine generated fold/contact-sheet images, including leaderboard and weekly rows below the fold.
- Taste static lint: 0 FAIL, one date-padding warning (valid local date-key formatting). Impeccable detector output `[]`.
- `git diff --check` passed. PRODUCT.md, DESIGN.md, README.md, calendar surface brief and design sidecar updated.

## Limitations
No activity records were modified during these checks; data access was read-only. No physical touch device, Safari/Firefox or screen-reader audit ran. History-fetch failure/retry and slow loading were implemented and source-reviewed but not induced in the live app. Completion-status mutation refresh was source-reviewed; existing personal records were not toggled to test it. The four/eight-week trend deliberately shows zero logged completions on past dates without records; it does not infer what happened outside the app. Scheduled-date grouping does not use the timestamp at which a record was marked complete. This was an extension of the established design, with no new direction draw or separate finish-review agent in this turn.
