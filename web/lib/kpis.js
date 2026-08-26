export function computeKpis(orders) {
  const totalValue = orders.reduce((sum, o) => sum + o.net_value, 0);
  const onTimeCount = orders.filter((o) => o.status === "ON_TIME").length;
  const missed = orders.filter((o) => o.status === "MISSED");
  const revenueAtRisk = missed.reduce((sum, o) => sum + o.net_value, 0);

  return {
    totalValue,
    onTimePct: orders.length ? (onTimeCount / orders.length) * 100 : 0,
    missedCount: missed.length,
    revenueAtRisk,
  };
}
