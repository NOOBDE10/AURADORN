/** Formats an amount in Pakistani rupees, e.g. 2499 → "Rs 2,499". */
export function formatPrice(amount: number): string {
  return `Rs ${Math.round(amount || 0).toLocaleString('en-PK')}`;
}
