// Money is handled in integer cents to avoid floating-point rounding in assertions.

// "$29.99" or "Item total: $39.98" -> 2999 / 3998
export function parseCents(text: string): number {
  const match = text.match(/\$(\d+)\.(\d{2})/);
  if (!match) throw new Error(`No dollar amount found in "${text}"`);
  return Number(match[1]) * 100 + Number(match[2]);
}

// Tax rounded half-up to the cent, as displayed by the site (3198 * 8% = 319.84 -> 320).
export function taxCents(subtotalCents: number, ratePercent: number): number {
  return Math.round((subtotalCents * ratePercent) / 100);
}
