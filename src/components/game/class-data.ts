import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export interface PlayerClassAbility {
  name: string;
  iconName: string;
  description: string;
  cooldown: number;
  manaCost: number;
}

export interface PlayerClass {
  health: number;
  attackMin: number;
  attackMax: number;
  mana: number;
  maxMana: number;
  description: string;
  abilities: PlayerClassAbility[];
}

export const getIconByName = (name: string): LucideIcon => {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon && typeof icon === "function" ? icon : Icons.HelpCircle;
};

export const PLAYER_CLASSES: Record<string, PlayerClass> = {
  Warrior: {
    health: 1700,
    attackMin: 31, // Tier 1 melee: 31-38
    attackMax: 38,
    mana: 100,
    maxMana: 100,
    description: "Tier 1 melee fighter",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "deal 130-150 damage",
        cooldown: 5,
        manaCost: 5,
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 30 health points",
        cooldown: 3,
        manaCost: 5,
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 100%",
        cooldown: 3,
        manaCost: 20,
      },
      {
        name: "Mana Heal",
        iconName: "Heart",
        description: "Convert 15 mana to 30 health",
        cooldown: 5,
        manaCost: 0,
      },
    ],
  },
  Slayer: {
    health: 1700,
    attackMin: 31,
    attackMax: 38,
    mana: 100,
    maxMana: 100,
    description: "Tier 1 melee fighter",
    abilities: [
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 150%",
        cooldown: 10,
        manaCost: 30,
      },
      {
        name: "Rage",
        iconName: "Flame",
        description: "Increase attack by 50% deal 50 damage ",
        cooldown: 4,
        manaCost: 20,
      },
      {
        name: "Execute",
        iconName: "Sword",
        description:
          "If enemy is under 15% health: instantly kill; otherwise deal 40 damage",
        cooldown: 8,
        manaCost: 50,
      },
      {
        name: "Whirlwind",
        iconName: "Wind",
        description: "Whirlwind 125 damage to enemy, 18 self damage",
        cooldown: 5,
        manaCost: 30,
      },
    ],
  },
  Rogue: {
    health: 1700,
    attackMin: 31,
    attackMax: 38,
    mana: 100,
    maxMana: 100,
    description: "Tier 1 melee fighter",
    abilities: [
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Increase attack by 120% ",
        cooldown: 8,
        manaCost: 20,
      },

      {
        name: "Bleeding Strike",
        iconName: "Zap",
        description: "Inflict 6 bleed damage",
        cooldown: 4,
        manaCost: 20,
      },
      {
        name: "Life Steal",
        iconName: "Heart",
        description: "Deal 20 damage and steal 20 health",
        cooldown: 6,
        manaCost: 30,
      },
      {
        name: "Vampiric Strike",
        iconName: "Droplets",
        description: "Vampiric strike deal 40-80 damage with 100% healing",
        cooldown: 6,
        manaCost: 28,
      },
    ],
  },

  Archer: {
    health: 1400,
    attackMin: 21, // Tier 1 ranged: 21-28
    attackMax: 28,
    mana: 100,
    maxMana: 100,
    description: "Tier 1 ranged fighter",
    abilities: [
      {
        name: "Rapid Fire",
        iconName: "Target",
        description: "Deal 20 damage and increase attack by 30%",
        cooldown: 4,
        manaCost: 25,
      },
      {
        name: "Power Shot",
        iconName: "Target",
        description: "Deal 28 damage and increase attack by 40%",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Battle Fury",
        iconName: "Crosshair",
        description: "Increase attack by 60% ",
        cooldown: 7,
        manaCost: 35,
      },
      {
        name: "Berserker Shot",
        iconName: "Eye",
        description: "Deal 30 damage and increase attack by 45% ",
        cooldown: 6,
        manaCost: 32,
      },
    ],
  },
  Ranger: {
    health: 1400,
    attackMin: 21,
    attackMax: 28,
    mana: 100,
    maxMana: 100,
    description: "Tier 1 ranged fighter",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire three quick shots",
        cooldown: 3,
        manaCost: 20,
      },

      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 35 damage",
        cooldown: 5,
        manaCost: 35,
      },
      {
        name: "Explosive Barrage",
        iconName: "Zap",
        description: "Deal 22 damage and increase attack by 25% ",
        cooldown: 5,
        manaCost: 28,
      },
      {
        name: "Focused Strike",
        iconName: "ArrowRight",
        description: "Deal 25 damage and increase attack by 50%",
        cooldown: 4,
        manaCost: 26,
      },
    ],
  },
  Mage: {
    health: 1200,
    attackMin: 11, // Tier 1 caster: 11-18
    attackMax: 18,
    mana: 130,
    maxMana: 130,
    description: "Tier 1 caster fighter",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25,
      },
      {
        name: "Arcane Bolt",
        iconName: "Bolt",
        description: "Deal 30 damage",
        cooldown: 3,
        manaCost: 20,
      },
      {
        name: "Ice Lance",
        iconName: "Snowflake",
        description: "Deal 15-25 damage",
        cooldown: 3,
        manaCost: 20,
      },
    ],
  },

  Oracle: {
    health: 1200,
    attackMin: 11,
    attackMax: 18,
    mana: 130,
    maxMana: 130,
    description: "Tier 1 caster fighter",
    abilities: [
      {
        name: "Astral Bolt",
        iconName: "Bolt",
        description: "Deal 24-36 damage",
        cooldown: 3,
        manaCost: 25,
      },

      {
        name: "Clairvoyance",
        iconName: "Sparkles",
        description: "Increase spell damage by 50%",
        cooldown: 5,
        manaCost: 20,
      },
      {
        name: "Foresight",
        iconName: "Eye",
        description: "Increase attack by 30% ",
        cooldown: 5,
        manaCost: 20,
      },
      {
        name: "Prophetic Mark",
        iconName: "Crosshair",
        description: "permanently counterattack 50% of damage taken",
        cooldown: 4,
        manaCost: 25,
      },
    ],
  },
  Healer: {
    health: 1200,
    attackMin: 11,
    attackMax: 18,
    mana: 130,
    maxMana: 130,
    description: "Tier 1 caster fighter",
    abilities: [
      {
        name: "Holy Smite",
        iconName: "Flame",
        description: "Deal 20-40 holy damage",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25% health",
        cooldown: 3,
        manaCost: 25,
      },

      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Permanently heal 10 health every turn",
        cooldown: 6,
        manaCost: 35,
      },
      {
        name: "Blessing of Light",
        iconName: "Sparkles",
        description:
          "Increase spell damage by 200%, increase attack by 100%, and restore 10% health",
        cooldown: 5,
        manaCost: 25,
      },
    ],
  },

  Warlord: {
    health: 1970,
    attackMin: 41, // Tier 2 melee: 41-48 (31+10 to 38+10)
    attackMax: 48,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "deal 30-50 damage",
        cooldown: 2,
        manaCost: 5,
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 30 health points",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% ",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Life Steal",
        iconName: "Heart",
        description: "Deal 20 damage and steal 20 health",
        cooldown: 6,
        manaCost: 30,
      },
      {
        name: "Commanding Strike",
        iconName: "Sword",
        description: "Deal 50-80 damage,Increase attack by 200%",
        cooldown: 8,
        manaCost: 50,
      },
    ],
  },
  Berserker: {
    health: 1970,
    attackMin: 41,
    attackMax: 48,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Reckless Swing",
        iconName: "Sword",
        description: "Deal 25-40 damage but take 5 self-damage",
        cooldown: 4,
        manaCost: 30,
      },
      {
        name: "Berserker Rage",
        iconName: "Flame",
        description: "Increase attack by 150%, take 10 self-damage",
        cooldown: 8,
        manaCost: 40,
      },
      {
        name: "Execute",
        iconName: "Sword",
        description:
          "If enemy is under 25% health: instantly kill; otherwise deal 80 damage",
        cooldown: 8,
        manaCost: 45,
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 30 health points",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Blood Frenzy",
        iconName: "Flame",
        description:
          "Attack twice for 30-40 damage each, but take 15 self-damage",
        cooldown: 7,
        manaCost: 50,
      },
    ],
  },

  Paladin: {
    health: 1970,
    attackMin: 41,
    attackMax: 48,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Divine Smite",
        iconName: "Sparkles",
        description: "Deal 100-120 holy damage",
        cooldown: 4,
        manaCost: 30,
      },
      {
        name: "Lay on Hands",
        iconName: "Heart",
        description: "restore 50% health",
        cooldown: 10,
        manaCost: 40,
      },
      {
        name: "Mana Heal",
        iconName: "Heart",
        description: "Convert 10 mana to 100 health",
        cooldown: 5,
        manaCost: 0,
      },
      {
        name: "Blessing of Light",
        iconName: "Sparkles",
        description:
          "Increase spell damage by 50%, increase attack by 50%, and restore 5% health",
        cooldown: 5,
        manaCost: 25,
      },
      {
        name: "Divine Shield",
        iconName: "Shield",
        description: "Repel abilities for 4 turns",
        cooldown: 10,
        manaCost: 35,
      },
    ],
  },
  Beastguard: {
    health: 1970,
    attackMin: 41,
    attackMax: 48,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Deal 12-18 damage",
        cooldown: 4,
        manaCost: 20,
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 50 health points",
        cooldown: 5,
        manaCost: 25,
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% ",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire three quick shots",
        cooldown: 3,
        manaCost: 20,
      },
      {
        name: "Summon Wolf",
        iconName: "Dog",
        description: "Summon a wolf that deals 12 damage per turn permanently",
        cooldown: 6,
        manaCost: 40,
      },
    ],
  },
  "Death Knight": {
    health: 1970,
    attackMin: 41,
    attackMax: 48,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Bleeding Strike",
        iconName: "Zap",
        description: "Inflict 6 bleed damage",
        cooldown: 4,
        manaCost: 20,
      },
      {
        name: "Vampiric Strike",
        iconName: "Droplets",
        description: "Vampiric strike deal 40-80 damage with 100% healing",
        cooldown: 6,
        manaCost: 28,
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% ",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Whirlwind",
        iconName: "Wind",
        description: "Whirlwind 25 damage to enemy, 8 self damage",
        cooldown: 5,
        manaCost: 25,
      },
      {
        name: "Shadow Ambush",
        iconName: "Moon",
        description:
          "Become untargetable for 1 turn, then strike next turn for 60-90 damage",
        cooldown: 8,
        manaCost: 50,
      },
    ],
  },

  "Dragon Slayer": {
    health: 1970,
    attackMin: 41,
    attackMax: 48,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 100%",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Mana Heal",
        iconName: "Heart",
        description: "Convert 15 mana to 30 health",
        cooldown: 5,
        manaCost: 0,
      },
      {
        name: "Prophetic Mark",
        iconName: "Crosshair",
        description: "permanently counterattack 50% of damage taken",
        cooldown: 4,
        manaCost: 25,
      },
      {
        name: "Clairvoyance",
        iconName: "Sparkles",
        description: "Increase spell damage by 50%",
        cooldown: 5,
        manaCost: 20,
      },
      {
        name: "Judgment of Fate",
        iconName: "Sword",
        description:
          "Deal 60-90 damage. If enemy is below 40% health, deal double damage",
        cooldown: 8,
        manaCost: 50,
      },
    ],
  },
  Knight: {
    health: 1600,
    attackMin: 31, // Tier 2 ranged: 31-38 (21+10 to 28+10)
    attackMax: 38,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "deal 30-50 damage",
        cooldown: 2,
        manaCost: 5,
      },
      {
        name: "Rapid Fire",
        iconName: "Target",
        description: "Deal 50 damage and increase attack by 40%",
        cooldown: 4,
        manaCost: 25,
      },
      {
        name: "Power Shot",
        iconName: "Target",
        description: "Deal 58 damage and increase attack by 80%",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 100 health points",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Judgment of Fate",
        iconName: "Sword",
        description:
          "Deal 50-100 damage. If enemy is below 20% health, deal double damage",
        cooldown: 8,
        manaCost: 50,
      },
    ],
  },
  Shaman: {
    health: 1600,
    attackMin: 31,
    attackMax: 38,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 28-38 damage",
        cooldown: 5,
        manaCost: 35,
      },
      {
        name: "Power Shot",
        iconName: "Target",
        description: "Deal 28 damage and increase attack by 50%",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 30 health points",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Clairvoyance",
        iconName: "Sparkles",
        description: "Increase spell damage by 50%",
        cooldown: 5,
        manaCost: 20,
      },
      {
        name: "Execute",
        iconName: "Sword",
        description:
          "If enemy is under 30% health: instantly kill; otherwise deal 100 damage",
        cooldown: 8,
        manaCost: 45,
      },
    ],
  },
  Crossbowman: {
    health: 1600,
    attackMin: 31,
    attackMax: 38,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 88-138 damage",
        cooldown: 5,
        manaCost: 35,
      },
      {
        name: "Power Shot",
        iconName: "Target",
        description: "Deal 58 damage and increase attack by 50%",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 30 health points",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Clairvoyance",
        iconName: "Sparkles",
        description: "Increase spell damage by 100%",
        cooldown: 5,
        manaCost: 20,
      },
      {
        name: "Starlight Volley",
        iconName: "Sparkles",
        description:
          "Unleash a barrage of astral arrows dealing 50-70 damage 5 times",
        cooldown: 8,
        manaCost: 60,
      },
    ],
  },

  Wizard: {
    health: 1600,
    attackMin: 31,
    attackMax: 38,
    mana: 110,
    maxMana: 110,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Permanently heal 10 health every turn",
        cooldown: 6,
        manaCost: 35,
      },
      {
        name: "Holy Smite",
        iconName: "Flame",
        description: "Deal 20-40 holy damage",
        cooldown: 3,
        manaCost: 25,
      },

      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25,
      },
      {
        name: "Sacred Ward",
        iconName: "Shield",
        description: "Gain a shield that blocks 100 damage everyturn",
        cooldown: 6,
        manaCost: 40,
      },
      {
        name: "Gods's Wrath",
        iconName: "Flame",
        description:
          "Passive: When losing health, increase attack by 1% (stacks)",
        cooldown: 0,
        manaCost: 0,
      },
    ],
  },

  Warlock: {
    health: 1350, // Mid-range of 125-145
    attackMin: 21, // Tier 2 caster: 21-28 (11+10 to 18+10)
    attackMax: 28,
    mana: 140, // Mid-range of 130-150
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Shadow Bolt",
        iconName: "Bolt",
        description: "Deal 18-24 shadow damage",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Life Tap",
        iconName: "Heart",
        description: "Lose 10 health to gain 25 mana",
        cooldown: 3,
        manaCost: 0,
      },
      {
        name: "Summon Imp",
        iconName: "Flame",
        description: "Summon pet that deals 8 dmg for every turn",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Vampiric Strike",
        iconName: "Droplets",
        description: "Vampiric strike deal 40-80 damage with 100% healing",
        cooldown: 6,
        manaCost: 28,
      },
      {
        name: "Swap Stats",
        iconName: "RefreshCw",
        description: "Swap your health with opponent",
        cooldown: 8,
        manaCost: 40,
      },
    ],
  },

  Battlemage: {
    health: 1350,
    attackMin: 21,
    attackMax: 28,
    mana: 140,
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 100%",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Poison",
        iconName: "Zap",
        description: "Inflict 20 poison damage",
        cooldown: 4,
        manaCost: 20,
      },
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25,
      },
      {
        name: "Arcane Bolt",
        iconName: "Bolt",
        description: "Deal 30 damage",
        cooldown: 3,
        manaCost: 20,
      },
    ],
  },
  Enchanter: {
    health: 1350,
    attackMin: 21,
    attackMax: 28,
    mana: 140,
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Mana Heal",
        iconName: "Heart",
        description: "Convert 15 mana to 30 health",
        cooldown: 5,
        manaCost: 0,
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Increase attack by 20% ",
        cooldown: 4,
        manaCost: 20,
      },
      {
        name: "Bleeding Strike",
        iconName: "Zap",
        description: "Inflict 6 bleed damage",
        cooldown: 4,
        manaCost: 20,
      },
      {
        name: "Shadow Ambush",
        iconName: "Moon",
        description:
          "Become untargetable for 1 turn, then strike next turn for 60-90 damage",
        cooldown: 8,
        manaCost: 50,
      },
    ],
  },

  Priest: {
    health: 1350,
    attackMin: 21,
    attackMax: 28,
    mana: 140,
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Permanently heal 10 health every turn",
        cooldown: 6,
        manaCost: 35,
      },
      {
        name: "Blessing of Light",
        iconName: "Sparkles",
        description:
          "Increase spell damage by 50%, increase attack by 100%, and restore 5% health",
        cooldown: 5,
        manaCost: 25,
      },
      {
        name: "Divine Shield",
        iconName: "Shield",
        description: "Repel abilities for 4 turns",
        cooldown: 10,
        manaCost: 35,
      },
      {
        name: "Lay on Hands",
        iconName: "Heart",
        description: "restore 50% health",
        cooldown: 6,
        manaCost: 40,
      },
      {
        name: "Sacred Ward",
        iconName: "Shield",
        description: "Gain a shield that blocks 100 damage everyturn",
        cooldown: 6,
        manaCost: 40,
      },
    ],
  },
  "Elemental Warden": {
    health: 1350,
    attackMin: 21,
    attackMax: 28,
    mana: 140,
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fire Blast",
        iconName: "Flame",
        description: "Deal 25-35 fire damage and inflict 5 damage everyturn",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Water Spout",
        iconName: "Droplets",
        description: "Deal 50 water damage , heal 30 health",
        cooldown: 4,
        manaCost: 28,
      },
      {
        name: "Earth Tremor",
        iconName: "Mountain",
        description: "Deal 30-40 earth damage and increase 30% spell damage",
        cooldown: 5,
        manaCost: 35,
      },
      {
        name: "Wind Slash",
        iconName: "Wind",
        description: "Deal 15-25 wind damage and increase your attack by 30%",
        cooldown: 3,
        manaCost: 22,
      },
      {
        name: "Spirit Bolt",
        iconName: "Sparkles",
        description: "Deal 35-45 spirit damage and restore 15 mana",
        cooldown: 4,
        manaCost: 0,
      },
    ],
  },

  Lich: {
    health: 1350,
    attackMin: 21,
    attackMax: 28,
    mana: 140,
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Shadow Bolt",
        iconName: "Bolt",
        description: "Deal 18-24 shadow damage",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Life Tap",
        iconName: "Heart",
        description: "Lose 10 health to gain 25 mana",
        cooldown: 3,
        manaCost: 0,
      },
      {
        name: "Curse of Agony",
        iconName: "Skull",
        description: "8 damage per turn for 1 turn",
        cooldown: 5,
        manaCost: 30,
      },
      {
        name: "Shadow Ambush",
        iconName: "Moon",
        description:
          "Become untargetable for 1 turn, then strike next turn for 60-90 damage",
        cooldown: 8,
        manaCost: 50,
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Increase attack by 20% ",
        cooldown: 4,
        manaCost: 20,
      },
    ],
  },

  Druid: {
    health: 1350,
    attackMin: 21,
    attackMax: 28,
    mana: 140,
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Summon Wolf",
        iconName: "Dog",
        description: "Summon a wolf that deals 12 damage per turn permanently",
        cooldown: 6,
        manaCost: 40,
      },
      {
        name: "Wolf Howl",
        iconName: "Triangle",
        description: "Empower your wolf: it deals 100% more damage every turn",
        cooldown: 8,
        manaCost: 55,
      },
      {
        name: "Fear Howl",
        iconName: "Skull",
        description: "Become untargetable for 3 turns (stealth mode)",
        cooldown: 8,
        manaCost: 50,
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25,
      },
      {
        name: "Sacred Ward",
        iconName: "Shield",
        description: "Gain a shield that blocks 100 damage everyturn",
        cooldown: 6,
        manaCost: 40,
      },
    ],
  },
  Necromancer: {
    health: 1350,
    attackMin: 21,
    attackMax: 28,
    mana: 140,
    maxMana: 140,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Life Tap",
        iconName: "Heart",
        description: "Lose 20 health to gain 100 mana",
        cooldown: 5,
        manaCost: 1,
      },
      {
        name: "Summon Skeleton",
        iconName: "Skull",
        description:
          "Summon a skeleton that deals 25 damage per turn for 5 turns (stacks)",
        cooldown: 3,
        manaCost: 30,
      },
      {
        name: "Summon Zombie",
        iconName: "Zap",
        description:
          "Summon a zombie that deals 28 damage per turn for 5 turns (stacks)",
        cooldown: 3,
        manaCost: 30,
      },
      {
        name: "Summon Wraith",
        iconName: "Moon",
        description:
          "Summon a wraith that deals 30 damage per turn for 5 turns (stacks)",
        cooldown: 3,
        manaCost: 30,
      },
      {
        name: "Necromancy Mastery",
        iconName: "Sparkles",
        description: "All summoned creatures deal 150% more damage everyturn",
        cooldown: 10,
        manaCost: 60,
      },
    ],
  },
  Witcher: {
  health: 2200,
  attackMin: 51,
  attackMax: 58,
  mana: 150,
  maxMana: 150,
  description: "Tier 3 melee — monster-slaying swordsman using alchemy and signs.",
  abilities: [
    // Active
    { name: "Igni Sign", iconName: "Flame", description: "Deal 70–100 fire damage", cooldown: 5, manaCost: 45 },
    {
      name: "Rally",
      iconName: "Heart",
      description: "Restore 200 health points",
      cooldown: 3,
      manaCost: 5,
    },   
    {  name: "Blood Frenzy",
      iconName: "Flame",
      description:
        "Attack twice for 100-150 damage each, but take 15 self-damage",
      cooldown: 3,
      manaCost: 50,},
    // Passive
    { name: "Mutagens", iconName: "Beaker", description: "Passive: Increase attack by 100% while above 50% health.", cooldown: 0, manaCost: 0 },
    { name: "Monster Killer", iconName: "BookOpen", description: "Passive: Increase spell damage by 100% while under 50% health.", cooldown: 0, manaCost: 0 },
    { name: "Alchemy Mastery", iconName: "FlaskRound", description: "Passive: All healing received is 100% stronger while under 50% health.", cooldown: 0, manaCost: 0 }
  ]
},
TaurenChieftain: {
  health: 2400,
  attackMin: 52,
  attackMax: 58,
  mana: 150,
  maxMana: 150,
  description: "Tier 3 melee — war leader calling upon ancestral spirits.",
  abilities: [
    // Active
    {
      name: "Shield Bash",
      iconName: "Shield",
      description: "deal 330-350 damage",
      cooldown: 5,
      manaCost: 5,
    },    {
      name: "Prophetic Mark",
      iconName: "Crosshair",
      description: "permanently counterattack 50% of damage taken",
      cooldown: 20,
      manaCost: 100,
    },    
    {
      name: "Rage",
      iconName: "Flame",
      description: "Increase attack by 10% deal 150 damage",
      cooldown: 8,
      manaCost: 50,
    },    // Passive
    { name: "Totemic Strength", iconName: "Megaphone", description: "Passive: Regenerate 20 health everyturn", cooldown: 0, manaCost: 0 },
    { name: "Spirit Endurance", iconName: "Heart", description: "Passive: Reincarnation ", cooldown: 100, manaCost: 0 },
    {
      name: "Gods's Wrath",
      iconName: "Flame",
      description:
        "Passive: When losing health, increase attack by 1% (stacks)",
      cooldown: 0,
      manaCost: 0,
    },  ]
},
Invoker: {
  health: 1700,
  attackMin: 31,
  attackMax: 38,
  mana: 170,
  maxMana: 170,
  description: "Tier 3 caster — master of fire, frost, and lightning.",
  abilities: [
    // Active
    { name: "Fireball", iconName: "Flame", description: "Deal 70–100 fire damage.", cooldown: 1, manaCost: 30 },
    { name: "Summon Infernal", iconName: "Skull", description: "Summon an Infernal that deals 100 damage per turn for 10 turns.", cooldown: 20, manaCost: 150 },
    {
      name: "Sacred Ward",
      iconName: "Shield",
      description: "Gain a shield that blocks 200 damage everyturn",
      cooldown: 30,
      manaCost: 100,
    },
    // Passive
    { name: "Elemental Mastery", iconName: "Sparkles", description: "Passive: Spell immunity.", cooldown: 0, manaCost: 0 },
    { name: "Mana Overflow", iconName: "BatteryCharging", description: "Passive: Gain +20 mana at the start of your turn.", cooldown: 0, manaCost: 0 },
    { name: "Elemental Harmony", iconName: "Atom", description: "Passive: Every turn gain 5% attack and 10% spell damage (stacks)", cooldown: 0, manaCost: 0 }
  ]
},
Archmage: {
  health: 1800,
  attackMin: 33,
  attackMax: 40,
  mana: 180,
  maxMana: 180,
  description: "Tier 3 caster — supreme master of all schools of magic.",
  abilities: [
    // Active
    { name: "Meteor", iconName: "Flame", description: "Deal 80–110 fire damage", cooldown: 3, manaCost: 50 },
    { name: "Blizzard", iconName: "Snowflake", description: "Deal 70–95 frost damage and slow (−30% attack) for 2 turns.", cooldown: 3, manaCost: 50 },
    { name: "Worldbreaker", iconName: "Skull", description: "Deal 150–200 arcane damage.", cooldown: 3, manaCost: 50 },
    // Passive
    { name: "Mana Overflow", iconName: "BatteryCharging", description: "Passive: Gain +20 mana at the start of your turn.", cooldown: 0, manaCost: 0 },
    { name: "Mage Lore", iconName: "BookOpen", description: "Passive: Increase spell damage by 100% while under 100% health,Increase spell damage by 200% while under 50% health and Increase spell damage by 500% while under 10% health", cooldown: 0, manaCost: 0 },
    { name: "Temporal Mastery", iconName: "Hourglass", description: "Passive:Every turn Gain a shield that blocks 200 damage everyturn (stacks)", cooldown: 0, manaCost: 0 }
  ]
},
Godslayer: {
  health: 2600,
  attackMin: 61, attackMax: 68,
  mana: 190, maxMana: 190,
  description: "Tier 4 melee — demigod built to duel divinities.",
  abilities: [
    // === 1 ACTIVE (super-strong) ===
    { 
      name: "Divine Execution", 
      iconName: "Skull", 
      description: "If enemy is under 30% health: instantly kill; otherwise deal 400 damage.", 
      cooldown: 1, 
      manaCost: 10 
    },

    { 
      name: "Executioner's Zeal", 
      iconName: "Flame", 
      description: "Passive: Each basic attack reduces Divine Execution’s cooldown by 1.", 
      cooldown: 0, manaCost: 0 
    },
    { 
      name: "Oath of Finality", 
      iconName: "Heart", 
      description: "Passive: When you drop below 100% HP,spell damage is increased by 30%.", 
      cooldown: 0, manaCost: 0 
    },
    { 
      name: "Relentless Verdict", 
      iconName: "Sword", 
      description: "Passive: If Divine Execution fails to kill, your next attack deals 500% damage.", 
      cooldown: 0, manaCost: 0 
    },
    { 
      name: "Godbreaker’s Might", 
      iconName: "Star", 
      description: "Passive: Each enemy ability used against you increases Divine Execution’s damage by 50 (stacks).", 
      cooldown: 0, manaCost: 0 
    },
    {
      name: "Gods's Wrath",
      iconName: "Flame",
      description:
        "Passive: When losing health, increase attack by 10% (stacks)",
      cooldown: 0,
      manaCost: 0,
    },
  ]
},


"Archon": {
  health: 2000,
  attackMin: 41, attackMax: 48,
  mana: 200, maxMana: 200,
  description: "Tier 4 caster — radiant demigod of order.",
  abilities: [
    // === 1 ACTIVE (super-strong) ===
    { 
      name: "Apotheosis", 
      iconName: "Crown", 
      description: "Ultimate: Deal 160–200 radiant damage, dispel 1 positive effect, and gain +25% damage & +25% damage reduction for 2 turns.", 
      cooldown: 9, 
      manaCost: 90 
    },

    // === 5 PASSIVES ===
    { 
      name: "Perfect Form", 
      iconName: "Shield", 
      description: "Passive: The first harmful effect on you each turn has its duration reduced by 1.", 
      cooldown: 0, manaCost: 0 
    },
    { 
      name: "Decree", 
      iconName: "ScrollText", 
      description: "Passive: Your dispels remove 1 additional positive effect.", 
      cooldown: 0, manaCost: 0 
    },
    { 
      name: "Seraphic Flow", 
      iconName: "Wand2", 
      description: "Passive: While above 60% mana, your spell damage is increased by 10%.", 
      cooldown: 0, manaCost: 0 
    },
    { 
      name: "Aegis of Order", 
      iconName: "ShieldCheck", 
      description: "Passive: The first hit you take each turn is reduced by 30 damage and you gain 10 mana.", 
      cooldown: 0, manaCost: 0 
    },
    { 
      name: "Judicial Pressure", 
      iconName: "Gavel", 
      description: "Passive: Enemy abilities cost +5 mana.", 
      cooldown: 0, manaCost: 0 
    }
  ]
}

};
