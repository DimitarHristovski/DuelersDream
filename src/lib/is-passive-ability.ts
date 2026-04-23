/** True if the ability is not meant to be activated from the skill bar (real-time). */
export function isPassiveAbility(ability: {
  cooldown: number;
  manaCost: number;
  name: string;
}): boolean {
  if (ability.name === "Spirit Endurance") return true;
  return ability.cooldown === 0 && ability.manaCost === 0;
}
