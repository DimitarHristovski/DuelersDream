import type { Player } from '@/components/game/abilities';
import { isPassiveAbility } from '@/lib/is-passive-ability';

function passiveRows(p: Player) {
  return p.abilities.filter((a) => isPassiveAbility(a));
}

/** Phrases that mark HP heal amount for each PASSIVE_BURST (real-time; legacy “every turn” still matches). */
const HP_BURST_TAIL =
  /(?:every\s*turn|everyturn|each\s+passive\s+pulse|each\s+ward\s+pulse)/i;

/** Max HP healed every PASSIVE_BURST (from “Regenerate N health …” + burst tail). */
export function passiveHpBurstHeal(p: Player): number {
  let best = 0;
  for (const a of passiveRows(p)) {
    const m = a.description.match(
      new RegExp(`regenerate\\s+(\\d+)\\s+health\\s+${HP_BURST_TAIL.source}\\.?`, "i")
    );
    if (m) best = Math.max(best, parseInt(m[1], 10));
  }
  return best;
}

const MANA_BURST =
  /gain\s+\+?(\d+)\s+mana\s+(?:at\s+the\s+start\s+of\s+your\s+turn|each\s+passive\s+pulse|each\s+ward\s+pulse)\.?/i;

/** Total mana granted every burst (legacy “start of your turn” or real-time pulse wording). */
export function passiveManaBurstGain(p: Player): number {
  let sum = 0;
  for (const a of passiveRows(p)) {
    const m = a.description.match(MANA_BURST);
    if (m) sum += parseInt(m[1], 10);
  }
  return sum;
}

const HARMONY =
  /(?:every\s+turn|each\s+passive\s+pulse)\s+gain\s+(\d+)%\s+attack\s+and\s+(\d+)%\s+spell\s+damage/i;

/** Elemental Harmony–style stacking (attack + spell %) per burst. */
export function passiveHarmonyGains(p: Player): { attack: number; spell: number } | null {
  for (const a of passiveRows(p)) {
    const m = a.description.match(HARMONY);
    if (m) {
      return { attack: parseInt(m[1], 10), spell: parseInt(m[2], 10) };
    }
  }
  return null;
}

const SHIELD_BURST =
  /blocks?\s+(\d+)\s+damage\s+(?:every\s*turn|everyturn|each\s+passive\s+pulse|each\s+ward\s+pulse)\.?/i;

/** Shield refresh amount per burst. */
export function passiveShieldBurstGain(p: Player): number {
  let best = 0;
  for (const a of passiveRows(p)) {
    const m = a.description.match(SHIELD_BURST);
    if (m) best = Math.max(best, parseInt(m[1], 10));
  }
  return best;
}

/** Conditional attack % while above health threshold (Mutagens-style). */
export function passiveConditionalAttackBoost(
  p: Player
): { boost: number; threshold: number } | null {
  for (const a of passiveRows(p)) {
    const boostM = a.description.match(/increase\s+attack\s+by\s+(\d+)%/i);
    const thrM = a.description.match(/above\s+(\d+)%\s*health/i);
    if (boostM && thrM) {
      return { boost: parseInt(boostM[1], 10), threshold: parseInt(thrM[1], 10) };
    }
  }
  return null;
}

/** Spell damage while below health threshold (Monster Lore / Killer–style). */
export function passiveSpellDamageWhileLow(
  p: Player
): { boost: number; threshold: number } | null {
  for (const a of passiveRows(p)) {
    const boostM = a.description.match(/increase\s+spell\s+damage\s+by\s+(\d+)%/i);
    const thrM = a.description.match(/under\s+(\d+)%\s*health/i);
    if (boostM && thrM) {
      return { boost: parseInt(boostM[1], 10), threshold: parseInt(thrM[1], 10) };
    }
  }
  return null;
}

/** Spell damage while mana is high (arcane reservoir). */
export function passiveSpellDamageWhileHighMana(
  p: Player
): { boost: number; threshold: number } | null {
  for (const a of passiveRows(p)) {
    const boostM = a.description.match(/increase\s+spell\s+damage\s+by\s+(\d+)%/i);
    const thrM = a.description.match(/above\s+(\d+)%\s*mana/i);
    if (boostM && thrM) {
      return { boost: parseInt(boostM[1], 10), threshold: parseInt(thrM[1], 10) };
    }
  }
  return null;
}

/** Spell damage while health is high (sanctified / focused caster). */
export function passiveSpellDamageWhileHighHealth(
  p: Player
): { boost: number; threshold: number } | null {
  for (const a of passiveRows(p)) {
    const boostM = a.description.match(/increase\s+spell\s+damage\s+by\s+(\d+)%/i);
    const thrM = a.description.match(/above\s+(\d+)%\s*health/i);
    if (boostM && thrM) {
      return { boost: parseInt(boostM[1], 10), threshold: parseInt(thrM[1], 10) };
    }
  }
  return null;
}

/** Fraction (e.g. 0.12) of spell damage added from all conditional spell passives. */
export function passiveBonusSpellDamageFraction(p: Player): number {
  const hpPct = p.maxHealth > 0 ? (p.health / p.maxHealth) * 100 : 0;
  const manaPct = p.maxMana > 0 ? (p.mana / p.maxMana) * 100 : 0;
  let f = 0;
  const low = passiveSpellDamageWhileLow(p);
  if (low && hpPct < low.threshold) f += low.boost / 100;
  const hiMana = passiveSpellDamageWhileHighMana(p);
  if (hiMana && manaPct > hiMana.threshold) f += hiMana.boost / 100;
  const hiHp = passiveSpellDamageWhileHighHealth(p);
  if (hiHp && hpPct > hiHp.threshold) f += hiHp.boost / 100;
  return f;
}

/** Attack while below health (berserk / desperation). */
export function passiveAttackWhileLowHp(
  p: Player
): { boost: number; threshold: number } | null {
  for (const a of passiveRows(p)) {
    const boostM = a.description.match(/increase\s+attack\s+by\s+(\d+)%/i);
    const thrM = a.description.match(/under\s+(\d+)%\s*health/i);
    if (boostM && thrM) {
      return { boost: parseInt(boostM[1], 10), threshold: parseInt(thrM[1], 10) };
    }
  }
  return null;
}

/** Damage reduction while healthy (bulwark). Uses max % among matching passives when condition holds. */
export function passiveDamageReductionWhileHealthy(
  p: Player
): { percent: number; threshold: number } | null {
  let best: { percent: number; threshold: number } | null = null;
  for (const a of passiveRows(p)) {
    const m = a.description.match(
      /reduce\s+damage\s+taken\s+by\s+(\d+)%\s+while\s+above\s+(\d+)%\s*health/i
    );
    if (m) {
      const percent = parseInt(m[1], 10);
      const threshold = parseInt(m[2], 10);
      if (!best || percent > best.percent) best = { percent, threshold };
    }
  }
  return best;
}

/** Fraction 0..0.45 of damage ignored when above threshold health. */
export function passiveDamageReductionWhileHealthyFraction(p: Player): number {
  const row = passiveDamageReductionWhileHealthy(p);
  if (!row) return 0;
  const hpPct = p.maxHealth > 0 ? (p.health / p.maxHealth) * 100 : 0;
  if (hpPct <= row.threshold) return 0;
  return Math.min(0.45, row.percent / 100);
}

/** Reflect % from passives (attacks + abilities); separate from ability-granted counterAttack. */
export function passiveReflectPercentFromAttacks(p: Player): number {
  let best = 0;
  for (const a of passiveRows(p)) {
    const m = a.description.match(
      /reflect\s+(\d+)%\s+of\s+damage\s+taken\s+from\s+attacks/i
    );
    if (m) best = Math.max(best, parseInt(m[1], 10));
  }
  return Math.min(35, best);
}

/** Evasion % refreshed each passive pulse (wind / foresight). */
export function passiveEvasionPercentPerPulse(p: Player): number {
  let best = 0;
  for (const a of passiveRows(p)) {
    const m = a.description.match(/gain\s+(\d+)%\s+evasion\s+each\s+passive\s+pulse/i);
    if (m) best = Math.max(best, parseInt(m[1], 10));
  }
  return Math.min(40, best);
}

/** Lifesteal on basic attacks only, as percent of damage dealt. */
export function passiveLifestealBasicPercent(p: Player): number {
  let best = 0;
  for (const a of passiveRows(p)) {
    const m = a.description.match(
      /heal\s+for\s+(\d+)%\s+of\s+damage\s+dealt\s+with\s+basic\s+attacks/i
    );
    if (m) best = Math.max(best, parseInt(m[1], 10));
  }
  return Math.min(30, best);
}

/** Cooldown trim on each passive surge (seconds). Capped total per tick. */
export function passiveCooldownTrimSecondsPerPulse(p: Player): number {
  let sum = 0;
  for (const a of passiveRows(p)) {
    const m = a.description.match(
      /reduce\s+all\s+ability\s+cooldowns\s+by\s+(\d+)\s+seconds?\s+each\s+passive\s+pulse/i
    );
    if (m) sum += parseInt(m[1], 10);
  }
  return Math.min(2, sum);
}
