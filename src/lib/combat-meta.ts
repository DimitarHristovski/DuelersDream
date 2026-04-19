import type { PlayerClass } from '@/components/game/class-data';

/** Rough baseline rating for UI (not a tier — all classes are tuned to compete). */
export function computePowerScore(c: PlayerClass): number {
  const atk = (c.attackMin + c.attackMax) / 2;
  return Math.round(c.health * 0.12 + atk * 2.2 + c.maxMana * 0.35);
}
