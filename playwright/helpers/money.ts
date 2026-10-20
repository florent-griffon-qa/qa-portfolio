// Money is handled in integer cents to avoid floating-point rounding in assertions.

// "$29.99" or "Item total: $39.98" -> 2999 / 3998
export function parseCents(text: string): number {
  const match = text.match(/\$(\d+)\.(\d{2})/);
  if (!match) throw new Error(`No dollar amount found in "${text}"`);
  return Number(match[1]) * 100 + Number(match[2]);
}

// Tax rounded to the nearest cent, as the site displays it (example: 319.84 cents -> 320).
// The rate comes from playwright/test-data/<env>.json (taxRatePercent).
export function taxCents(subtotalCents: number, ratePercent: number): number {
  return Math.round((subtotalCents * ratePercent) / 100);
}
