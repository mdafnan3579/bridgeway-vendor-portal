# Bridgeway Distribution — Vendor Portal & Delivery Cockpit

A Vendor Portal that federates 4 mock legacy/cloud order systems (Cognos,
Tableau, Fabric, GCP) into one clean feed. See `PROJECT_BRIEF.md` for the
full spec and `docs/` for the written design docs.

## Structure

```
server/   Express federation API (the 4 mock sources + /api/orders)
web/      Next.js dashboard (Tailwind CSS)
docs/     approach, ai-usage, architecture, bi-plan, security-rbac
```

## Setup

Requires Node 20+.

### 1. Backend

```
cd server
npm install
npm run dev
```

Runs on `http://localhost:4000`. Routes:

- `GET /api/cognos/v1/orders`
- `GET /api/tableau/v2/territory-kpis`
- `GET /api/fabric/v1/order-events`
- `GET /api/gcp/v1/unified-orders`
- `GET /api/orders` — the federation endpoint (supports `?territory=`,
  `?dc_id=`, `?start_date=`, `?end_date=`, `?status=` query params)
- `PATCH /api/orders/:recordId` — update an order's status. Body:
  `{ "source_system": "GCP" | "FABRIC" | "COGNOS", "status": "ON_TIME" | "LATE" | "MISSED" }`
- `POST /api/orders` — manually add a new order (written into the GCP mock
  source — see `docs/architecture.md`). Body: `{ storeId, territory, dcId,
  skuId, casesOrdered, netValue, status, orderDate }`
- `DELETE /api/orders/:recordId?source_system=...` — remove an order.

All mock data is in-memory only — edits, additions, and deletions reset when
the backend restarts.

### 2. Frontend

```
cd web
npm install
npm run dev
```

Runs on `http://localhost:3000`. Reads the API base URL from
`web/.env.local` (`NEXT_PUBLIC_API_URL`, defaults to
`http://localhost:4000`).

Start the backend first, then the frontend, so the dashboard has data to
fetch on first load.

Dashboard features: KPI bar, a combined filter bar (date range, territory,
DC, status, plus a client-side store/SKU search), two charts (delivery
status breakdown and order value by territory), a sortable orders table
with inline status editing and delete, a form to manually add an order, and
a light/dark theme toggle (persisted per-browser).

## Notes

- The front end only ever calls `/api/orders`, never the 4 source routes
  directly (see `docs/architecture.md`).
- Stack substitution (Node/Express instead of Java/Spring Boot) is a stated
  assumption from the brief, not an oversight.
- The BI layer is a written plan only (`docs/bi-plan.md`), not a built tool.
