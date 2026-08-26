// Region-code map required by the brief (section 4, step 2).
export const COGNOS_REGION_MAP = {
  SE: { territory: "Southeast", states: ["FL", "GA", "AL", "SC", "NC", "TN"] },
  MW: { territory: "Midwest", states: ["IL", "OH", "MI", "IN", "WI", "MN"] },
  NE: { territory: "Northeast", states: ["NY", "NJ", "PA", "MA", "CT", "RI"] },
  SW: { territory: "Southwest", states: ["TX", "AZ", "NM", "NV", "OK"] },
  WC: { territory: "West Coast", states: ["CA", "OR", "WA", "ID"] },
  MC: { territory: "Mountain Central", states: ["CO", "UT", "KS", "MO", "IA", "NE"] },
};

// Cognos has no DC field at all, and Fabric has a DC but no territory field.
// Assumption: each DC serves exactly one territory, so a DC-to-territory
// lookup lets Fabric rows carry a territory. This is a stated simplification
// for the mock build — see docs/architecture.md.
export const DC_TERRITORY_MAP = {
  "DC-ATL": "Southeast",
  "DC-CHI": "Midwest",
  "DC-NYC": "Northeast",
  "DC-HOU": "Southwest",
  "DC-LAX": "West Coast",
  "DC-DEN": "Mountain Central",
};

export function normalizeCognos(row) {
  const region = COGNOS_REGION_MAP[row.region_code];
  return {
    order_id: row.order_id,
    record_id: `cognos-${row.order_id}`,
    source_system: "COGNOS",
    order_date: row.order_date,
    store_id: row.store_num,
    territory: region ? region.territory : null,
    dc_id: null,
    sku_id: row.sku_id,
    cases_ordered: row.cases_ordered,
    net_value: row.total_value,
    status: row.status,
    sla_met: row.status === "ON_TIME",
    data_freshness: "nightly-batch",
  };
}

export function normalizeFabric(row) {
  const status =
    row.event_type === "FAILED" ? "MISSED" : row.sla_met ? "ON_TIME" : "LATE";
  return {
    order_id: row.order_id,
    record_id: row.transaction_id,
    source_system: "FABRIC",
    order_date: row.transaction_ts.slice(0, 10),
    store_id: row.store_id,
    territory: DC_TERRITORY_MAP[row.dc_id] ?? null,
    dc_id: row.dc_id,
    sku_id: row.sku_id,
    cases_ordered: row.cases_ordered,
    net_value: row.net_value,
    status,
    sla_met: row.sla_met,
    data_freshness: "real-time",
  };
}

export function normalizeGcp(row) {
  return {
    order_id: row.order_id,
    record_id: row.record_id,
    source_system: "GCP",
    order_date: row.order_date,
    store_id: row.store_id,
    territory: row.territory,
    dc_id: row.dc_id,
    sku_id: row.sku_id,
    cases_ordered: row.cases_ordered,
    net_value: row.net_value,
    status: row.status,
    sla_met: row.sla_met,
    data_freshness: "real-time",
  };
}
