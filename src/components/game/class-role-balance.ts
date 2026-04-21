import { CLASS_ROLES, type RoleKey } from './class-categories';
import type { PlayerClass } from './class-data';

export function getClassRoleKey(className: string): RoleKey {
  const n = String(className);
  if ((CLASS_ROLES.Melee as readonly string[]).includes(n)) return 'Melee';
  if ((CLASS_ROLES.Ranged as readonly string[]).includes(n)) return 'Ranged';
  return 'Caster';
}

/** Base stat multipliers: melee tanky + hard-hitting, casters mana + spell tilt, ranged middle. */
const ROLE_STAT_MULT: Record<RoleKey, { hp: number; mana: number; atk: number }> = {
  Melee: { hp: 1.12, mana: 0.86, atk: 1.1 },
  Ranged: { hp: 1.04, mana: 1.08, atk: 1.05 },
  Caster: { hp: 0.9, mana: 1.26, atk: 0.92 },
};

const ri = (x: number) => Math.max(1, Math.round(x));

/**
 * Returns a copy of the class with HP / mana pool / attack scaled by combat role.
 * Ability text is unchanged; ability damage is scaled at execution time in BattleArena.
 */
export function getBalancedPlayerClass(className: string, raw: PlayerClass): PlayerClass {
  const m = ROLE_STAT_MULT[getClassRoleKey(className)];
  const manaPool = ri(raw.maxMana * m.mana);
  return {
    ...raw,
    health: ri(raw.health * m.hp),
    mana: manaPool,
    maxMana: manaPool,
    attackMin: ri(raw.attackMin * m.atk),
    attackMax: ri(raw.attackMax * m.atk),
    abilities: raw.abilities.map((a) => ({ ...a })),
  };
}

/** Heuristic: elemental / spell-flavored lines get spell multiplier, else physical. */
function isSpellHeavyDescription(description: string): boolean {
  return /\b(fire|frost|ice|snow|flame|shadow|arcane|holy|water|wind|spirit|lightning|thunder|spell|bolt|curse|hex|elemental|arcane|magical|mana surge|meteor|blizzard|nova|wrath)\b/i.test(
    description
  );
}

/**
 * Multiplier applied to outgoing ability damage (after parsed amount).
 * Melee favors weapon-style damage; casters favor spell-ish text; ranged between.
 */
export function getRoleAbilityDamageMultiplier(className: string, abilityDescription: string): number {
  const role = getClassRoleKey(className);
  const spell = isSpellHeavyDescription(abilityDescription);
  if (role === 'Melee') return spell ? 0.96 : 1.08;
  if (role === 'Ranged') return spell ? 1.07 : 1.05;
  return spell ? 1.12 : 0.94;
}
