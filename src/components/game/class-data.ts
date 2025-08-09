import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

// Define the player class type structure
export interface PlayerClassAbility {
  name: string;
  iconName: string; // Name of the icon from lucide-react
  description: string;
  cooldown: number;
  manaCost: number;
}

export interface PlayerClass {
  health: number;
  attackMin: number;
  attackMax: number;
  description: string;
  abilities: PlayerClassAbility[];
}

// Helper function to get icon component by name
export const getIconByName = (name: string): LucideIcon => {
  const icon = (Icons as any)[name];
  return icon && typeof icon === 'function' ? icon : Icons.HelpCircle;
};

// All player classes defined in one place
export const PLAYER_CLASSES: Record<string, PlayerClass> = {
  // ⚔️ Melee & Warrior Classes
  Knight: {
    health: 120,
    attackMin: 10,
    attackMax: 15,
    description: "Heavily armored warrior with balanced stats",
    abilities: [
      {
        name: "Shield Wall",
        iconName: "Shield",
        description: "Deal 15-25 damage",
        cooldown: 4,
        manaCost: 15
      },
      {
        name: "Heavy Strike",
        iconName: "Sword",
        description: "Deal 25-35 damage",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      }
    ]
  },
  Barbarian: {
    health: 110,
    attackMin: 15,
    attackMax: 22,
    description: "High-damage brute with reckless strikes",
    abilities: [
      {
        name: "Rage",
        iconName: "Flame",
        description: "Deal 30-40 damage and take 5 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Whirlwind",
        iconName: "Sword",
        description: "Deal 25-35 damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Deal 8-18 damage",
        cooldown: 5,
        manaCost: 20
      }
    ]
  },
  Paladin: {
    health: 130,
    attackMin: 8,
    attackMax: 14,
    description: "Holy warrior with healing and protection",
    abilities: [
      {
        name: "Divine Smite",
        iconName: "Sparkles",
        description: "Call down holy power for 15-25 damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Lay on Hands",
        iconName: "Heart",
        description: "Heal yourself for 25 health",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Divine Shield",
        iconName: "Shield",
        description: "Heal 30 health",
        cooldown: 5,
        manaCost: 35
      }
    ]
  },
  Sellsword: {
    health: 105,
    attackMin: 12,
    attackMax: 18,
    description: "Mercenary warrior skilled in all weapon types",
    abilities: [
      {
        name: "Weapon Mastery",
        iconName: "Sword",
        description: "Deal 20-30 damage",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Parry",
        iconName: "Shield",
        description: "Deal 15-25 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "War Cry",
        iconName: "Skull",
        description: "Deal 10-20 damage",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  Warlord: {
    health: 135,
    attackMin: 14,
    attackMax: 19,
    description: "Commanding presence with devastating power",
    abilities: [
      {
        name: "Command Strike",
        iconName: "Sword",
        description: "Deal 15-25 damage and heal 10 health",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Battle Tactics",
        iconName: "Target",
        description: "Deal 22-32 damage",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rally Troops",
        iconName: "Heart",
        description: "Heal 20 health and heal 10 health",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Gladiator: {
    health: 115,
    attackMin: 13,
    attackMax: 20,
    description: "Arena fighter trained for spectacle and survival",
    abilities: [
      {
        name: "Crowd Pleaser",
        iconName: "Sword",
        description: "Flashy attack dealing 20-30 damage with style",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Net Throw",
        iconName: "Target",
        description: "Deal 8-18 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Second Wind",
        iconName: "Heart",
        description: "Heal 15 health",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Blademaster: {
    health: 100,
    attackMin: 16,
    attackMax: 24,
    description: "Master of blade techniques with deadly precision",
    abilities: [
      {
        name: "Blade Flurry",
        iconName: "Sword",
        description: "Deal 30-40 damage",
        cooldown: 4,
        manaCost: 35
      },
      {
        name: "Perfect Stance",
        iconName: "Shield",
        description: "Heal 25 health",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Vital Strike",
        iconName: "Target",
        description: "Attack a weak point for 25-35 damage",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Spearman: {
    health: 110,
    attackMin: 12,
    attackMax: 16,
    description: "Reach advantage with defensive capabilities",
    abilities: [
      {
        name: "Thrust",
        iconName: "Sword",
        description: "Piercing attack dealing 15-25 damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Phalanx",
        iconName: "Shield",
        description: "Heal 20 health",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Spear Wall",
        iconName: "Target",
        description: "Heal 30 health",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  Duelist: {
    health: 95,
    attackMin: 12,
    attackMax: 16,
    description: "Fast and precise swordsman with high dodge",
    abilities: [
      {
        name: "Riposte",
        iconName: "Sword",
        description: "Deal 28-38 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Feint",
        iconName: "Zap",
        description: "Deal 18-28 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Precise Strike",
        iconName: "Target",
        description: "Deal 20-30 damage with high accuracy",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  
  // 🏹 Ranged Classes
  Archer: {
    health: 95,
    attackMin: 8,
    attackMax: 12,
    description: "Ranged fighter with precision attacks",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Deal 20-30 damage",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Poison Arrow",
        iconName: "Droplet",
        description: "Deal 15-25 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Evasion",
        iconName: "Zap",
        description: "Deal 18-28 damage",
        cooldown: 4,
        manaCost: 15
      }
    ]
  },
  Crossbowman: {
    health: 90,
    attackMin: 10,
    attackMax: 16,
    description: "Heavy hitting ranged fighter with slower reload",
    abilities: [
      {
        name: "Heavy Bolt",
        iconName: "Target",
        description: "Fire a powerful bolt dealing 20-30 damage",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Piercing Shot",
        iconName: "Sword",
        description: "Deal 18-28 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Rapid Reload",
        iconName: "Zap",
        description: "Deal 12-22 damage",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Falconer: {
    health: 85,
    attackMin: 7,
    attackMax: 14,
    description: "Hunter with trained falcon companion",
    abilities: [
      {
        name: "Falcon Strike",
        iconName: "Bird",
        description: "Send falcon to attack for 15-20 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Hunting Tactics",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Nature's Eye",
        iconName: "Leaf",
        description: "Deal 22-32 damage",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  Marksman: {
    health: 80,
    attackMin: 12,
    attackMax: 20,
    description: "Expert sniper with deadly accuracy",
    abilities: [
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Carefully aimed attack dealing 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Crippling Shot",
        iconName: "Droplet",
        description: "Deal 12-22 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Deal 18-28 damage",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  
  // 🧙 Magic-Based Classes
  Mage: {
    health: 85,
    attackMin: 5,
    attackMax: 8,
    description: "Versatile caster with powerful spells",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Launch a fireball dealing 20-30 damage",
        cooldown: 3,
        manaCost: 30
      },
      {
        name: "Arcane Shield",
        iconName: "Shield",
        description: "Heal 20 health",
        cooldown: 5,
        manaCost: 40
      },
      {
        name: "Healing Potion",
        iconName: "Heart",
        description: "Restore 20 health points",
        cooldown: 4,
        manaCost: 35
      }
    ]
  },
  Necromancer: {
    health: 90,
    attackMin: 6,
    attackMax: 10,
    description: "Dark magic user who controls the undead",
    abilities: [
      {
        name: "Soul Drain",
        iconName: "Skull",
        description: "Deal 10-15 damage and heal for the same amount",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Summon Skeleton",
        iconName: "Skull",
        description: "Deal 12-22 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Curse",
        iconName: "Sparkles",
        description: "Deal 10-20 damage",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  Druid: {
    health: 100,
    attackMin: 7,
    attackMax: 11,
    description: "Nature magic user with healing and control",
    abilities: [
      {
        name: "Entangling Roots",
        iconName: "Leaf",
        description: "Deal 10-20 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 25 health",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Wild Shape",
        iconName: "Bird",
        description: "Deal 15-25 damage",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  Sorcerer: {
    health: 75,
    attackMin: 8,
    attackMax: 12,
    description: "High-damage glass cannon with explosive magic",
    abilities: [
      {
        name: "Mana Explosion",
        iconName: "Sparkles",
        description: "Deal 30-40 damage but lose 10 health",
        cooldown: 4,
        manaCost: 45
      },
      {
        name: "Arcane Missiles",
        iconName: "Sparkles",
        description: "Deal 20-30 damage",
        cooldown: 3,
        manaCost: 30
      },
      {
        name: "Mana Shield",
        iconName: "Shield",
        description: "Heal 25 health",
        cooldown: 5,
        manaCost: 35
      }
    ]
  },
  Cleric: {
    health: 105,
    attackMin: 6,
    attackMax: 10,
    description: "Divine spellcaster focused on healing and support",
    abilities: [
      {
        name: "Divine Healing",
        iconName: "Heart",
        description: "Restore 30 health points",
        cooldown: 4,
        manaCost: 35
      },
      {
        name: "Holy Smite",
        iconName: "Sparkles",
        description: "Deal 15-25 damage with pure light energy",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Blessed Armor",
        iconName: "Shield",
        description: "Heal 35 health",
        cooldown: 5,
        manaCost: 40
      }
    ]
  },
  Warlock: {
    health: 85,
    attackMin: 9,
    attackMax: 14,
    description: "Wields dark magic with demonic pacts",
    abilities: [
      {
        name: "Shadow Bolt",
        iconName: "Bolt",
        description: "Fire a bolt of shadow energy for 18-24 damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Life Tap",
        iconName: "Heart",
        description: "Sacrifice 10 health to gain 25 mana",
        cooldown: 3,
        manaCost: 0
      },
      {
        name: "Summon Imp",
        iconName: "Flame",
        description: "Deal 15-25 damage",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  
  // 🛡 Hybrid Classes
  Battlemage: {
    health: 95,
    attackMin: 9,
    attackMax: 13,
    description: "Wields sword and spells for versatility",
    abilities: [
      {
        name: "Spell Blade",
        iconName: "Sword",
        description: "Attack with sword imbued with magic for 15-25 damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Deal 35-45 damage",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Arcane Armor",
        iconName: "Shield",
        description: "Heal 30 health",
        cooldown: 5,
        manaCost: 35
      }
    ]
  },
  Templar: {
    health: 120,
    attackMin: 10,
    attackMax: 14,
    description: "Holy knight with divine magic and martial skill",
    abilities: [
      {
        name: "Holy Strike",
        iconName: "Sword",
        description: "Deal 15-25 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Sacred Barrier",
        iconName: "Shield",
        description: "Heal 40 health",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Righteous Fury",
        iconName: "Flame",
        description: "Deal 20-30 damage",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Alchemist: {
    health: 90,
    attackMin: 7,
    attackMax: 12,
    description: "Master of potions and magical concoctions",
    abilities: [
      {
        name: "Poison Brew",
        iconName: "Droplet",
        description: "Throw toxic concoction dealing 8-13 damage + poison for 3 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Healing Elixir",
        iconName: "Heart",
        description: "Drink powerful elixir restoring 20-30 health",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Smoke Bomb",
        iconName: "Bomb",
        description: "Deal 20-30 damage",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  Assassin: {
    health: 90,
    attackMin: 12,
    attackMax: 18,
    description: "Deadly striker with high damage potential",
    abilities: [
      {
        name: "Backstab",
        iconName: "Sword",
        description: "Deal 20-25 damage from the shadows",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Poison Blade",
        iconName: "Droplet",
        description: "Apply a deadly poison that deals 7 damage for 3 turns",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Smoke Bomb",
        iconName: "Bomb",
        description: "Deal 18-28 damage",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  Berserker: {
    health: 100,
    attackMin: 14,
    attackMax: 24,
    description: "Frenzied warrior who gains power from rage",
    abilities: [
      {
        name: "Reckless Strike",
        iconName: "Sword",
        description: "Powerful attack dealing 25-40 damage but taking 5 self damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Battle Roar",
        iconName: "Skull",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Bloodlust",
        iconName: "Droplet",
        description: "Deal 10-20 damage and heal 10 health",
        cooldown: 5,
        manaCost: 35
      }
    ]
  },
  SoulfireWarlock: {
    health: 80,
    attackMin: 11,
    attackMax: 16,
    description: "Master of soul flames that consume life for power",
    abilities: [
      {
        name: "Soul Incineration",
        iconName: "Flame",
        description: "Channel soul flames for 20-30 damage, costs 10 health",
        cooldown: 4,
        manaCost: 35
      },
      {
        name: "Life Exchange",
        iconName: "Heart",
        description: "Convert 15 health to 35 mana or vice versa",
        cooldown: 3,
        manaCost: 0
      },
      {
        name: "Eternal Flames",
        iconName: "Sparkles",
        description: "Deal 15-25 damage",
        cooldown: 5,
        manaCost: 40
      }
    ]
  },
  
  // 🗡️ Assassin & Rogue Classes
  Shadowblade: {
    health: 85,
    attackMin: 14,
    attackMax: 20,
    description: "Elite assassin who strikes from the shadows",
    abilities: [
      {
        name: "Shadow Step",
        iconName: "Zap",
        description: "Teleport behind enemy for 25-35 damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Death Mark",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Vanish",
        iconName: "Eye",
        description: "Deal 22-32 damage",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Thief: {
    health: 90,
    attackMin: 10,
    attackMax: 15,
    description: "Sneaky rogue who steals and disables",
    abilities: [
      {
        name: "Pickpocket",
        iconName: "Hand",
        description: "Steal 15 mana from opponent",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Disable Trap",
        iconName: "Shield",
        description: "Remove all negative effects from self",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Smoke Screen",
        iconName: "Bomb",
        description: "Deal 15-25 damage",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  Ninja: {
    health: 80,
    attackMin: 12,
    attackMax: 18,
    description: "Silent killer with deadly precision",
    abilities: [
      {
        name: "Shuriken Storm",
        iconName: "Target",
        description: "Throw 4 shurikens for 6-8 damage each",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Stealth",
        iconName: "Eye",
        description: "Deal 20-30 damage",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Assassinate",
        iconName: "Sword",
        description: "Critical strike for 30-40 damage if target below 50% health",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Rogue: {
    health: 95,
    attackMin: 11,
    attackMax: 16,
    description: "Versatile scoundrel with dirty tricks",
    abilities: [
      {
        name: "Cheap Shot",
        iconName: "Sword",
        description: "Deal 15-20 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Dirty Fighting",
        iconName: "Target",
        description: "Deal 10-20 damage",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Escape Artist",
        iconName: "Zap",
        description: "Heal 20 health and remove negative effects",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  
  // 🛡️ Tank & Guardian Classes
  Guardian: {
    health: 140,
    attackMin: 8,
    attackMax: 12,
    description: "Immovable protector with massive defense",
    abilities: [
      {
        name: "Guardian's Shield",
        iconName: "Shield",
        description: "Heal 40 health",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Taunt",
        iconName: "Skull",
        description: "Deal 8-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Last Stand",
        iconName: "Heart",
        description: "When below 25% health, deal 50-60 damage",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Sentinel: {
    health: 130,
    attackMin: 9,
    attackMax: 13,
    description: "Vigilant defender with counter-attacks",
    abilities: [
      {
        name: "Counter Strike",
        iconName: "Sword",
        description: "Deal 28-38 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Defensive Stance",
        iconName: "Shield",
        description: "Heal 30 health",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Protect Ally",
        iconName: "Heart",
        description: "Heal 15 health and heal 25 health",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Ironclad: {
    health: 150,
    attackMin: 7,
    attackMax: 11,
    description: "Heavily armored warrior with massive health",
    abilities: [
      {
        name: "Iron Will",
        iconName: "Shield",
        description: "Heal 50 health",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Heavy Armor",
        iconName: "Shield",
        description: "Heal 35 health",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Unbreakable",
        iconName: "Heart",
        description: "Heal 25 health and clear all negative effects",
        cooldown: 7,
        manaCost: 45
      }
    ]
  },

 
};