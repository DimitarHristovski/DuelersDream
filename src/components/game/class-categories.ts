/**
 * Classes grouped by combat style only (no power tiers — balance lives in class-data).
 */
import { PLAYER_CLASSES } from './class-data';

export const CLASS_ROLES = {
  Melee: [
    'Warrior',
    'Slayer',
    'Rogue',
    'Warlord',
    'Berserker',
    'Paladin',
    'Knight',
    'Death Knight',
    'Dragon Slayer',
    'Witcher',
    'TaurenChieftain',
    'Godslayer',
  ],
  Ranged: ['Archer', 'Ranger', 'Beastguard', 'Shaman', 'Crossbowman', 'Druid'],
  Caster: [
    'Mage',
    'Oracle',
    'Healer',
    'Wizard',
    'Warlock',
    'Battlemage',
    'Enchanter',
    'Priest',
    'Elemental Warden',
    'Lich',
    'Necromancer',
    'Invoker',
    'Archmage',
    'Archon',
  ],
} as const;

export type RoleKey = keyof typeof CLASS_ROLES;

/** Flat list for search / “All fighters” grid order */
export const ALL_CLASSES_ORDERED: readonly string[] = [
  ...CLASS_ROLES.Melee,
  ...CLASS_ROLES.Ranged,
  ...CLASS_ROLES.Caster,
];

/** Random AI class for vs-AI duels; excludes the player's class when possible. */
export function pickRandomAiClass(exclude: keyof typeof PLAYER_CLASSES): keyof typeof PLAYER_CLASSES {
  const pool = ALL_CLASSES_ORDERED.filter(
    (name): name is keyof typeof PLAYER_CLASSES =>
      name in PLAYER_CLASSES && name !== exclude
  );
  if (pool.length === 0) return exclude;
  return pool[Math.floor(Math.random() * pool.length)];
}
