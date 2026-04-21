/**
 * Combines peak hit damage with cadence: shorter cooldown increases pressure
 * for the same damage (sqrt dampens extreme CDs). Use when tuning mana vs
 * damage vs cooldown — higher score → expect higher mana cost, all else equal.
 */
export function abilityPressureScore(
  maxDamage: number,
  cooldownSeconds: number
): number {
  const cd = Math.max(1, cooldownSeconds);
  return maxDamage / Math.sqrt(cd);
}
