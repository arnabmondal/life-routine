# Approved Dark mode and User settings — November 9, 2026

## Delivered
The user approved the dark preview and explicitly requested a top-right person-icon User settings menu, with Light/Dark switching and room for future user-specific settings.

- Added `[data-theme="sage-chalk-dark"]` to the shared theme file with the exact approved preview palette. Light definitions and category identities are unchanged. Both modes share existing semantic aliases, layouts, controls and behavior.
- Added a 44px UserRound person button at the far right of the global header. The anchored User settings panel has an Appearance section and native Light/Dark radios; it is a nonmodal settings dialog, not a simulated ARIA command menu. Escape/Close restores trigger focus without scrolling; outside click or Tab out dismisses without stealing focus. Additional user-specific sections can be added separately.
- Calendar settings remain under their existing gear beside New activity. The header retains its height; at 320px, My calendar visually shortens to Calendar while preserving its full accessible name.
- Added validated browser-local preferences in `web/lib/user-settings.ts`, using `daywell.user-settings.v1`. Save preserves future fields. Missing/invalid data defaults to Light independently of OS mode. Choices apply immediately without navigation, activity requests, or calendar remounts; other tabs synchronize through storage events.
- A validated inline head bootstrap applies saved Dark before body rendering, independent of React hydration. Root hydration-warning suppression is limited to the expected theme attribute. If storage is unavailable, switching still works for the visit and the panel reports that the preference could not be saved.
- Updated project instructions and design/product/theme documentation to record the explicitly approved second theme. Other unrequested palette/role changes remain prohibited. No System option, authentication, database change or new runtime dependency was added.

## Executed checks
Final Next.js production build, lint and TypeScript validation passed. `git diff --check` passed.

### Unit suite
**29/29 passed**, including four new user-preference checks: strict mode validation/malformed recovery; persistence with future fields preserved; blocked-storage live application; and pre-render bootstrap behavior without hydration.

### User settings browser suite
**25 grouped checks passed** in installed Google Chrome / Playwright 1.65.0, America/Los_Angeles, at **1440×900, 820×900, 390×900 and 320×900**:

- Person icon, top-right placement, 44px target, named dialog, exactly two native Light/Dark choices, correct selected-radio focus, independent calendar settings and absence of horizontal overflow.
- Default Light even when the OS prefers dark. Dark updates the expected root theme/body colors without activity requests or agenda remount; preserves future preference fields; survives reload; Escape restores focus.
- Cross-tab changes work in both directions, outside click closes, keyboard Enter opens, native radio arrow keys switch, and Escape closes. No hydration errors or page errors were observed.
- Switching Light/Dark in Week keeps the same grid element, internal scroll offset and page position. Closing the overlay allows the separate themed calendar settings dialog to open normally.
- Activity log/chart and User settings use the approved dark colors. Rendered stats text, action labels, menu help and selected-option text all exceed 4.5:1. The exact ratios are in the result JSON.
- When `Storage.prototype.setItem` throws, Dark still applies with a visible session-only message. Reload restores the last successfully saved mode.
- With all client JavaScript bundles blocked, a saved Dark preference still applies through the inline head script and produces the correct dark body background before React hydration. This checks bootstrap independence; it is not a frame-by-frame filmstrip measurement.

### Existing behavior and theme regressions
- **36 grouped agenda scenarios passed with a saved Dark preference actually asserted active**: mouse and synthesized-touch reordering, time review, cancellation, keyboard reordering, injected 503 rollback/retry, Undo, exact-time editor handoff, status/note save scroll/focus continuity, pointer cancellation, retained week-view touch dragging, settings and day navigation.
- **16 grouped Light-theme scenarios passed** at the same four widths, checking original approved colors, text contrast, views/dialogs/errors, charts, category identity, and runtime semantic-variable propagation.
- Desktop and phone Light/Dark menus, agenda and week screenshots were visually inspected. Dark log screenshots were captured. No stored routine entries or production preferences were modified by tests: API fixtures and isolated browser contexts were used.

Evidence: `.impeccable/review/user-settings-dark-mode/` contains screenshots and machine-readable results. The final build is running at http://localhost:3000. Use the person icon → User settings → Appearance to choose a mode.

## Re-run
With the app and installed Chrome:

```sh
npm install --prefix /tmp/daywell-browser playwright@1.65.0
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/user-settings.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules TEST_THEME=dark node web/tests/agenda.browser.cjs
NODE_PATH=/tmp/daywell-browser/node_modules node web/tests/theme.browser.cjs
```

Optional `BASE_URL`, `CHROME_PATH`, and `CALENDAR_TEST_OUTPUT` control target/browser/output where supported. Existing unit checks use `npm test`. Browser exact-color checks use reduced motion; the dark gesture regression uses normal motion and Chrome synthesized touch. Physical touch hardware, other browser engines, and screen-reader sessions were not tested.
