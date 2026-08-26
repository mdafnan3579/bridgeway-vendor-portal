# Bridgeway Distribution — Vendor Portal & Delivery Cockpit

> This assignment brief, adapted for a beginner-friendly, all-JavaScript build.
> Use this file as the instructions for Claude Code. Build it step by step, in the order below.

## 1. The scenario (context only — read, don't build literally)

Bridgeway Distribution is a wholesale distributor. Their order/delivery data lives in
**4 disconnected systems** being migrated to one cloud platform. We need a **Vendor Portal**:
a web app where a store operator sees their orders, deliveries, and KPIs — sourced live from
all 4 systems while migration is still in progress.

Three layers, all required:
- **Front end** — the portal itself
- **Back end** — a federation API that merges the 4 sources into one clean response
- **BI layer** — KPI cockpit (for this build: written plan only, not a real BI tool)

## 2. Tech stack for this build

- **Front end:** Next.js + Tailwind CSS (JavaScript, use `import`/`export`, not `require`)
- **Back end:** Node.js + Express (JavaScript, use `import`/`export` via ES modules, not `require`)
- **BI layer:** Not built — covered in `docs/bi-plan.md` as a written plan
- **Note:** The original spec asks for Java/Spring Boot for the back end. This build
  substitutes Node/Express for speed and stack consistency. This is a stated assumption,
  not a misunderstanding of the brief.

## 3. The four mock data sources

Build these as 4 separate Express routes returning hardcoded JSON arrays (5-10 rows each
is enough). Match these exact schemas:

### System 1 — Cognos (`GET /api/cognos/v1/orders`)
Legacy, nightly batch, uses 2-letter region codes.
```
order_id (int), order_date (date), store_num (string), region_code (string, 2-char),
sku_id (string), cases_ordered (int), total_value (decimal),
scheduled_date (date), actual_date (date, nullable), status (ON_TIME | LATE | MISSED)
```

### System 2 — Tableau (`GET /api/tableau/v2/territory-kpis`)
Monthly aggregates only — no row-level order data.
```
period_month (date), territory (string), total_orders (int), total_value (decimal),
on_time_pct (decimal), missed_count (int), missed_revenue_impact (decimal),
yoy_growth_pct (decimal)
```

### System 3 — Fabric (`GET /api/fabric/v1/order-events`)
Near-real-time event stream.
```
transaction_id (string, uuid), transaction_ts (ISO datetime), store_id (string),
dc_id (string), sku_id (string), cases_ordered (int), net_value (decimal),
sla_met (bool), event_type (DISPATCHED | DELIVERED | FAILED)
```

### System 4 — GCP/BigQuery (`GET /api/gcp/v1/unified-orders`)
Canonical schema — the migration target format.
```
record_id (string, uuid), source_system (COGNOS | TABLEAU | FABRIC | GCP),
order_date (date), store_id (string), territory (string), dc_id (string),
sku_id (string), cases_ordered (int), net_value (decimal),
status (ON_TIME | LATE | MISSED), sla_met (bool)
```

## 4. The federation endpoint — the core of the project

Build `GET /api/orders` in Express. It should:

1. **Call all 4 mock endpoints** (internally, e.g. via fetch to your own routes, or by
   importing the mock data functions directly — simplest is fine for a beginner build).
2. **Normalize Cognos records** into the canonical shape using this exact region-code map:

   | Cognos code | Territory | States |
   |---|---|---|
   | SE | Southeast | FL, GA, AL, SC, NC, TN |
   | MW | Midwest | IL, OH, MI, IN, WI, MN |
   | NE | Northeast | NY, NJ, PA, MA, CT, RI |
   | SW | Southwest | TX, AZ, NM, NV, OK |
   | WC | West Coast | CA, OR, WA, ID |
   | MC | Mountain Central | CO, UT, KS, MO, IA, NE |

3. **Deduplicate by `order_id`** across sources when the same order appears in multiple
   systems. Priority order: **GCP wins, then Fabric, then Tableau, then Cognos.**
4. **Add a `data_freshness` field** to each record — e.g. `"real-time"` for
   Fabric/GCP, `"monthly"` for Tableau, `"nightly-batch"` for Cognos.
5. **Return one clean unified JSON array** in the canonical schema (same shape as System 4).

## 5. Front end — Next.js pages

Build one main dashboard page that:

1. **Fetches from `/api/orders`** (your federation endpoint, never the 4 source APIs directly).
2. **KPI summary bar at top**: total order value, on-time %, missed deliveries, revenue at risk.
3. **Orders table**: order id, store, territory, status, delivery date, and a small badge
   showing which source system the record came from.
4. **Filters**: date range, territory, and distribution center (DC) — combined into a single
   filter bar, not a sequential two-step dropdown.
5. **Loading states**: show a skeleton or spinner while `/api/orders` is loading. If you want
   to go further, show a "data freshness" note near the Cognos-sourced rows (e.g. "as of
   last night's batch").
6. **One UX improvement**, called out in a code comment or in `docs/approach.md`: identify
   one thing that would frustrate an operator (e.g. slow Cognos data blocking the whole page)
   and how you solved it (e.g. render fast sources immediately, stream in slow ones).

## 6. Written docs (create these as markdown files in a `docs/` folder)

- `docs/approach.md` — how you sequenced the build and why (a few paragraphs)
- `docs/ai-usage.md` — what you used AI for vs. your own decisions
- `docs/architecture.md` — federation design, normalization, dedup rule, testing approach
  (unit tests on mapping/dedup logic, integration test on the fan-out, contract tests for
  schema drift), and deployment/rollback plan (conceptual — e.g. GitHub Actions → Vercel/
  Cloud Run → rollback via redeploying previous build)
- `docs/bi-plan.md` — required KPIs (each tagged with source system), interim strategy while
  migration runs, migration prioritization logic, and exit criteria for MVP vs full migration
- `docs/security-rbac.md` — 3 roles (internal analyst, DC ops — own DC only, vendor — own
  store only) and specifically *where* each restriction is enforced (e.g. a filter applied
  in the Express federation layer based on the logged-in user's `storeId`)

## 7. Suggested build order for Claude Code

1. Scaffold Next.js + Express project structure
2. Build the 4 mock data routes with hardcoded JSON
3. Build the federation endpoint (mapping → dedup → freshness flag)
4. Build the Next.js dashboard (table + KPIs + filters)
5. Add loading/async states
6. Write the 5 docs in `docs/`
7. Final pass: README with setup instructions