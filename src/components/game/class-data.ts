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
  return (Icons as Record<string, LucideIcon>)[name] || Icons.HelpCircle;
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
        description: "Reduces incoming damage by 50% until your next turn",
        cooldown: 4,
        manaCost: 15
      },
      {
        name: "Heavy Strike",
        iconName: "Sword",
        description: "Your next attack deals 50% more damage",
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
        description: "Increase attack by 70% but reduce defense by 30%",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Whirlwind",
        iconName: "Sword",
        description: "Attack twice for 80% of normal damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 40% for one turn",
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
        description: "Reduce damage taken by 75% until your next turn",
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
        description: "Switch combat style for +40% damage on next attack",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Parry",
        iconName: "Shield",
        description: "Block next attack and counter for 10-15 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "War Cry",
        iconName: "Skull",
        description: "Intimidate opponent, reducing their attack by 25%",
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
        description: "Deal 15-25 damage and gain +20% damage next turn",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Battle Tactics",
        iconName: "Target",
        description: "Study opponent, gaining 70% chance to dodge next attack",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rally Troops",
        iconName: "Heart",
        description: "Restore 20 health and gain +10 attack for next turn",
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
        description: "Immobilize opponent, causing them to miss next turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Second Wind",
        iconName: "Heart",
        description: "Regain 15 health and clear all negative effects",
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
        description: "Strike three times for 8-12 damage each",
        cooldown: 4,
        manaCost: 35
      },
      {
        name: "Perfect Stance",
        iconName: "Shield",
        description: "Enter defensive stance, reducing damage by 40% for 2 turns",
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
        description: "Form defensive position, reducing damage by 60% for 1 turn",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Spear Wall",
        iconName: "Target",
        description: "Counter next attack with 100% of your damage",
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
        description: "Counter the next attack with 150% of your damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Feint",
        iconName: "Zap",
        description: "80% chance to dodge next attack and counter",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Precise Strike",
        iconName: "Target",
        description: "Guaranteed critical hit for double damage",
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
        description: "Fire two quick shots in succession",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Poison Arrow",
        iconName: "Droplet",
        description: "Poison target for 5 damage over 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Evasion",
        iconName: "Zap",
        description: "50% chance to dodge the next attack",
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
        description: "Penetrating bolt that ignores 50% of enemy shield",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Rapid Reload",
        iconName: "Zap",
        description: "Reduce all ability cooldowns by 1 turn",
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
        description: "Mark target, increasing damage by 50% for next turn",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Nature's Eye",
        iconName: "Leaf",
        description: "Scout opponent's weakness, 80% chance to dodge next attack",
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
        description: "Wound target, reducing their attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Hide from sight, gaining 90% evasion for next attack",
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
        description: "Completely blocks the next incoming attack",
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
        description: "Summon a skeleton that attacks for 8 damage over 3 turns",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Curse",
        iconName: "Sparkles",
        description: "Reduce target's attack by 30% until your next turn",
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
        description: "Immobilize the enemy, causing them to skip their next turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 health per turn for 3 turns",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Wild Shape",
        iconName: "Bird",
        description: "Increase attack damage by 30% until your next turn",
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
        description: "Fire 3 missiles for 7-10 damage each",
        cooldown: 3,
        manaCost: 30
      },
      {
        name: "Mana Shield",
        iconName: "Shield",
        description: "Convert 50% of next damage taken to mana drain instead",
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
        description: "Reduce damage taken by 65% for 2 turns",
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
        description: "Summon a demon that attacks for 8 damage for 3 turns",
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
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Arcane Armor",
        iconName: "Shield",
        description: "Create magical armor reducing damage by 60% for 2 turns",
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
        description: "Divine weapon attack for 15 damage with chance to stun",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Sacred Barrier",
        iconName: "Shield",
        description: "Divine protection reducing damage by 75% for 1 turn",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Righteous Fury",
        iconName: "Flame",
        description: "Channel divine wrath, increasing damage by 40% for 3 turns",
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
        description: "Create smoke screen giving 70% evasion for 2 turns",
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
        description: "Vanish from sight, 75% chance to evade next attack",
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
        description: "Intimidating roar increasing damage by 50% for 2 turns",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Bloodlust",
        iconName: "Droplet",
        description: "Deal 10-20 damage and gain regeneration for 2 turns",
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
        description: "Set enemy ablaze for 8 damage per turn for 3 turns",
        cooldown: 5,
        manaCost: 40
      }
    ]
  }
};