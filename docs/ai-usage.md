# AI Usage

This project was built with Claude Code. Roughly:

## What AI did

- Scaffolded the Express project structure and the Next.js app
  (`create-next-app`, then hand-edited).
- Wrote the mock data for all 4 source systems, the normalization functions,
  the dedup logic, and the federation route.
- Wrote all of the React components (KPI bar, filter bar, orders table,
  source badge) and the dashboard page.
- Wrote this set of docs.
- Ran the servers and drove the dashboard in a real browser (not just unit
  tests) to confirm the federation call, filter round-trip, and freshness
  labels actually worked end to end before calling any step done.

## Decisions made by a human, not inferred by AI

- The tech-stack substitution (Node/Express instead of Spring Boot) and the
  choice to keep the BI layer as a written plan only — both dictated by the
  brief itself, not a judgment call made mid-build.
- The dedup join-key assumption (adding a synthetic `order_id` to
  Fabric/GCP mock rows, stripped from their public responses) — this is a
  gap in the brief's schemas (Fabric/GCP have no order_id) that needed an
  explicit, documented choice rather than a silent one.
- The DC-to-territory mapping used to backfill territory on Fabric rows —
  a simplification, not something derivable from the brief's data alone.
- The specific UX improvement chosen (keep stale table data visible during
  filter-triggered refetches, rather than literally streaming per-source
  data) — the brief's own example (streaming slow sources) doesn't fit the
  constraint that the front end only ever calls `/api/orders`, so an
  alternative had to be picked that fits the actual architecture.

## What to double check

This is a mock/demo build: all data is hardcoded, there's no auth yet (see
`docs/security-rbac.md` for where RBAC would plug in), and the "testing
approach" in `docs/architecture.md` is a plan, not an implemented test
suite.
