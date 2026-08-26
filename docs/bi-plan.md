# BI Layer — Written Plan

Not built as a real BI tool for this project (per the brief, section 2/6).
This is the plan for what the KPI cockpit would need once the 4 systems are
fully live and/or migrated.

## Required KPIs (tagged by source system)

| KPI | Definition | Primary source(s) |
|---|---|---|
| Total order value | Sum of `net_value` across orders in range | GCP (canonical), backfilled by Cognos/Fabric pre-migration |
| On-time % | `ON_TIME` orders ÷ total orders | GCP, Fabric (`sla_met`), Cognos (`status`) |
| Missed deliveries | Count of `status = MISSED` | GCP, Fabric (`event_type = FAILED`), Cognos |
| Revenue at risk | Sum of `net_value` where `status = MISSED` | Same as above |
| Territory trend / YoY growth | Month-over-month and year-over-year value and on-time % by territory | **Tableau only** — this is the one KPI the row-level sources can't produce; Tableau's monthly aggregates are the only source with historical trend built in |
| DC-level SLA performance | On-time % grouped by `dc_id` | Fabric, GCP (Cognos has no DC granularity — a known gap, see `docs/architecture.md`) |

## Interim strategy while migration runs

While all 4 systems are live simultaneously:

- Order-level KPIs (total value, on-time %, missed count, revenue at risk)
  come from the **federation endpoint's deduped output** — same source of
  truth as the vendor portal, so the cockpit and the portal never disagree.
- Trend/YoY KPIs come from **Tableau directly**, since it's the only system
  with monthly historical aggregates. This is the one place the BI layer
  reads a source system that isn't Cognos/Fabric/GCP order data.
- Any KPI that depends on DC granularity is understood to under-report for
  Cognos-sourced orders until those stores' data is migrated — the cockpit
  should show this as a footnote, not silently average it away.

## Migration prioritization logic

Priority for migrating a given store/DC off legacy systems and onto GCP,
highest first:

1. **Highest order volume + worst on-time %** — the stores where stale
   nightly-batch data (Cognos) most actively hides a real service problem
   from operators today.
2. **Stores already dual-reporting through Fabric** — lower migration risk,
   since real-time event data already exists and GCP just needs to become
   the system of record instead of a mirror.
3. **Everything else**, by volume, descending.

This mirrors the dedup priority in the federation layer (GCP > Fabric >
Tableau > Cognos): migration priority should retire the lowest-priority,
least-trusted source first.

## Exit criteria

**MVP** (what this build represents):
- Federation endpoint returns one deduped, canonical-shape feed.
- Every order-level KPI is computable from that feed.
- Trend KPIs read from Tableau as a known, documented exception.

**Full migration**:
- Cognos and Fabric routes return zero rows (or are decommissioned) because
  100% of order volume originates in GCP.
- `data_freshness` on every record is `real-time` — the field itself
  becomes redundant and can be dropped.
- Tableau is retired once GCP's own aggregation covers trend/YoY reporting
  natively; until then it remains the sole source for those KPIs.
