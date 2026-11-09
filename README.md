# Daywell — local personal routine tracker

A self-hosted today-first agenda and weekly calendar for **planned vs. completed activities**, using Next.js, a separate Node.js gRPC backend, and PostgreSQL. All three services run in Docker.

## Prerequisites

- macOS with Docker Desktop installed and running
- Docker Compose v2 (`docker compose version`)

## Start

```bash
cd life-routine
docker compose up --build -d
```

Open **http://localhost:3000** for today. Use **Week** (or `?view=week`) for the calendar and **Activity log** (or `?view=log`) for insights. The first build may take a few minutes. Click **Load my weekly routine** to populate the current week. Agenda arrows navigate days; Week and Activity log arrows navigate weeks and **Fill missing routine slots** to seed those weeks. The template is intentionally editable.

## Stop / restart

```bash
docker compose down       # preserves PostgreSQL data
docker compose up -d      # restarts
```

To watch logs: `docker compose logs -f`. To reset all stored data **irreversibly**: `docker compose down -v`.

## Services

| Service | Port | Role |
| --- | --- | --- |
| web | 127.0.0.1:3000 | Next.js UI and server API routes |
| backend | internal 50051 | gRPC service, not exposed on host |
| db | 127.0.0.1:5433 | PostgreSQL 16, persistent named volume |

Browser → Next.js `/api/*` → gRPC (`proto/routine.proto`) → PostgreSQL. Browsers do not speak native gRPC; the Next.js server acts as a bridge. All services share a private Docker Compose network.

## Included

- Today-first agenda, seven-day time-grid calendar, and activity log
- Drag agenda grips to reorder; review suggested times, overlaps, and planning-hours warnings before saving
- Agenda keyboard reordering: Space, Up/Down, Enter to review; Escape/Tab to cancel
- Calendar settings choose visible planning hours; weekly progress stays visible in a compact top strip
- Four/eight-week daily completion trends and top-five consistency leaderboard
- In Week view, drag cards to change time/day in 15-minute increments; touch users drag the grip
- In Week view, keyboard scheduling: focus a Move grip, press Space, use arrows, Enter to save or Escape to cancel
- Overlapping activities appear side by side; moves keep duration and offer Undo
- Add, edit, delete activities
- Mark planned, completed, or skipped; record completion timestamp
- Weekly counts, completion percentage, and completed activity hours
- Personalized Monday–Friday starter template with school transport, dog walks, fitness, career, AI learning, and family time
- Persistent PostgreSQL storage
- Local time display in your Mac's browser

## Notes and limitations

- Single-user local MVP, **no authentication**. Only bind to localhost.
- Seeded events are individual records, not automatic recurring rules. Use **Fill missing routine slots** each new week.
- Marking an event complete records the *planned duration* as completed time; this is not a timer or independently measured actual duration.
- No external Google/Apple Calendar sync, push notifications, multi-user accounts in this version.
- Week-based tracking; no timezone conversion beyond the local browser timezone for entry/display. Docker backend uses America/Los_Angeles.

## Troubleshooting

- `docker compose ps` to inspect container health.
- `docker compose logs backend` if the API errors.
- If port 3000 or 5433 is occupied, change the **host-side** port in `docker-compose.yml`.
- Database schema initialization happens only when the volume is first created. For future schema changes use proper migrations.
