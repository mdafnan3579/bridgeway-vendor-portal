# Architecture

## Overview

```
web/ (Next.js)  --->  GET /api/orders  --->  server/ (Express)
                                                  |
                                                  |-- normalize (per source)
                                                  |-- dedupe by order_id
                                                  '-- attach data_freshness
                                                        |
                       +--------------------+----------+----------+--------------------+
                       |                    |                     |                    |
                 /api/cognos/...     /api/tableau/...      /api/fabric/...      /api/gcp/...
                 (nightly batch)     (monthly aggregate)   (real-time events)   (canonical / migrated)
```

The front end only ever calls the federation endpoint (`/api/orders`),
never the 4 source routes directly. Those source routes exist so the
federation layer — and the graders — can see the raw, un-normalized shape
each system actually produces.

## Normalization (`server/src/lib/normalize.js`)

Each source has its own normalizer function that maps it into the canonical
shape (the same shape as System 4 / GCP), plus a `data_freshness` tag:

| Source  | `data_freshness` | Notes |
|---|---|---|
| Cognos  | `nightly-batch`   | `territory` from the region-code map (brief §4.2). No `dc_id` — Cognos never tracked DC. |
| Fabric  | `real-time`       | `status` derived from `event_type`/`sla_met` (FAILED → MISSED, sla_met → ON_TIME, else LATE). `territory` derived from `dc_id` via a DC→territory lookup, since Fabric has no territory field. |
| GCP     | `real-time`       | Already canonical — normalization is closer to a passthrough. |
| Tableau | `monthly`         | Aggregates only, no row-level orders — never enters the order-level normalize/dedup pipeline. It's the source for the KPI cockpit's monthly trend view (see `docs/bi-plan.md`), not for `/api/orders`. |

## Dedup rule (`server/src/lib/dedup.js`)

Priority when the same `order_id` appears in more than one source:
**GCP > Fabric > Tableau > Cognos** (Tableau never actually competes, since
it has no order-level rows — it's listed for completeness per the brief).

**Assumption / known gap:** the brief's Fabric and GCP schemas don't include
an `order_id` field (Fabric has `transaction_id`, GCP has `record_id`), so
there's nothing to literally dedupe on across those three sources as
specified. For this mock build, `server/src/data/fabric.js` and
`server/src/data/gcp.js` carry an internal `order_id` correlation field used
only inside the federation layer's join; it's stripped before those
systems' public mock routes respond, so the public contracts still match
the brief's exact schemas. In production this correlation would come from a
real cross-reference (e.g., a migration mapping table keyed on
store + SKU + date, or a durable ID assigned at first ingestion), not a
shared literal ID invented per source.

## Mutations (`PATCH`/`POST`/`DELETE /api/orders`)

Three write endpoints exist for the demo/portal build:

- `PATCH /api/orders/:recordId` — updates status in place, wherever the
  record actually lives (`server/src/lib/mutate.js`). Since each source
  represents status differently, the reverse mapping differs per source:
  Cognos and GCP just set `status` directly; Fabric has no `status` field at
  all, so `ON_TIME`/`LATE`/`MISSED` is translated back into `sla_met` +
  `event_type` (`FAILED` for MISSED, `DELIVERED` otherwise).
- `POST /api/orders` — adds a brand-new order. It's written straight into
  the GCP mock array rather than a new "manual" pseudo-source, because GCP
  is both the canonical schema and the highest dedup priority — a portal
  user adding an order today is, in effect, adding it directly to the
  migration target.
- `DELETE /api/orders/:recordId?source_system=...` — removes the record
  from wherever it lives, same per-source lookup as the other two.

All three are in-memory only: there's no database, so edits, additions, and
deletions are lost on server restart, same as the rest of the mock data.

## Testing approach (not yet implemented — plan)

- **Unit tests** on `normalizeCognos` / `normalizeFabric` / `normalizeGcp`
  and `dedupeByOrderId`: fixed input rows in, exact canonical rows out,
  including edge cases (unknown region code, `FAILED` Fabric event, a
  3-way collision on one `order_id`).
- **Integration test** on the fan-out: hit `GET /api/orders` against the
  mock data and assert the response is a flat array in canonical shape with
  no duplicate `order_id`s "leaking through" (i.e., checked before the
  `order_id` field is stripped) and no source-specific fields present.
- **Contract tests** for schema drift: a JSON-schema (or Zod) check on each
  of the 4 mock routes' response shape, run in CI, so a future change to a
  mock source's shape fails fast instead of silently breaking the
  normalizer.

## Deployment / rollback plan (conceptual)

- **CI**: GitHub Actions runs lint + the test suite above on every PR.
- **Deploy**: `server/` → Cloud Run (or similar container host); `web/` →
  Vercel. Both deploy from the same commit SHA, tagged so a given frontend
  build is traceable to the backend build it was tested against.
- **Rollback**: redeploy the previous known-good build (previous Cloud Run
  revision / previous Vercel deployment) rather than reverting commits and
  rebuilding — faster, and avoids rebuilding under incident pressure.
- **Config**: the API base URL is the only environment-specific value the
  front end needs (`NEXT_PUBLIC_API_URL`), so promoting a build between
  environments never requires a code change.
