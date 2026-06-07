/** Compact KRW formatting for dashboards and tables. */
export function formatCompactKRW(amount: number): string {
  if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
  if (amount >= 1_000_000) return `₩${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(0)}만`;
  return `₩${amount.toLocaleString()}`;
}
