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
Seven-day calendar and chronological activity log; previous/next/current-week navigation; create, edit, delete; planned/completed/skipped outcomes; notes; starter routine and filling missing template slots. Week summaries count all scheduled activities, completed and skipped activities, and planned durations of completed activities. Those hours are not a timer. Template entries are individual activities, not recurrence rules. No login, sync, notifications, drag/drop, or multiple users. Preserve local-only bindings and existing database data.

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
