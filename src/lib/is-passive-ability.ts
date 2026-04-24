import type { Ability } from '@/components/game/abilities';

/** True if the ability is not meant to be activated from the skill bar (real-time). */
export function isPassiveAbility(ability: Ability): boolean {
  if (ability.name === "Spirit Endurance") return true;
  const mana = ability.manaCost ?? 0;
  return ability.cooldown === 0 && mana === 0;
}
