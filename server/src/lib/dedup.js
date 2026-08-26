// Priority order per the brief (section 4, step 3): GCP wins, then Fabric,
// then Tableau, then Cognos. Tableau is monthly aggregates with no
// order_id-level rows, so it never actually supplies a candidate here —
// it's kept in the priority list for completeness/documentation.
const SOURCE_PRIORITY = { GCP: 0, FABRIC: 1, TABLEAU: 2, COGNOS: 3 };

export function dedupeByOrderId(normalizedRows) {
  const bestByOrderId = new Map();

  for (const row of normalizedRows) {
    const key = row.order_id;
    const existing = bestByOrderId.get(key);
    if (!existing || SOURCE_PRIORITY[row.source_system] < SOURCE_PRIORITY[existing.source_system]) {
      bestByOrderId.set(key, row);
    }
  }

  // order_id is an internal join key only, not part of the canonical schema.
  return Array.from(bestByOrderId.values()).map(({ order_id, ...canonical }) => canonical);
}
