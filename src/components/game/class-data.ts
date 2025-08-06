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
        description: "Mark target for 50% increased damage for 2 turns",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Vanish",
        iconName: "Eye",
        description: "Become invisible, 90% chance to dodge next attack",
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
        description: "Create smoke that gives 80% evasion for 2 turns",
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
        description: "Become invisible, guaranteed dodge next attack",
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
        description: "Deal 15-20 damage and stun for 1 turn",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Dirty Fighting",
        iconName: "Target",
        description: "Reduce opponent's attack by 35% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Escape Artist",
        iconName: "Zap",
        description: "Remove all negative effects and gain 50% evasion",
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
        description: "Reduce damage by 80% for 2 turns",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Taunt",
        iconName: "Skull",
        description: "Force opponent to attack you next turn",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Last Stand",
        iconName: "Heart",
        description: "When below 25% health, gain 100% damage boost",
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
        description: "Block next attack and counter for 20-25 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Defensive Stance",
        iconName: "Shield",
        description: "Reduce damage by 60% and gain 30% attack boost for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Protect Ally",
        iconName: "Heart",
        description: "Take damage for ally and heal 15 health",
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
        description: "Become immune to all damage for 1 turn",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Heavy Armor",
        iconName: "Shield",
        description: "Reduce damage by 70% for 3 turns",
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
  
  // 🏹 Archer & Hunter Classes
  Ranger: {
    health: 100,
    attackMin: 9,
    attackMax: 14,
    description: "Wilderness expert with animal companions",
    abilities: [
      {
        name: "Call Wolf",
        iconName: "Bird",
        description: "Summon wolf that attacks for 10 damage for 3 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Tracking Shot",
        iconName: "Target",
        description: "Deal 18-25 damage and mark target for 30% increased damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Survival Instincts",
        iconName: "Leaf",
        description: "Gain 60% evasion and 20% attack boost for 2 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Sniper: {
    health: 85,
    attackMin: 15,
    attackMax: 25,
    description: "Long-range specialist with deadly accuracy",
    abilities: [
      {
        name: "Precision Shot",
        iconName: "Target",
        description: "Deal 30-40 damage with perfect accuracy",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Overwatch",
        iconName: "Eye",
        description: "Increase attack by 100% for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Kill Shot",
        iconName: "Target",
        description: "Deal 40-50 damage if target below 30% health",
        cooldown: 6,
        manaCost: 45
      }
    ]
  },
  Beastmaster: {
    health: 110,
    attackMin: 8,
    attackMax: 12,
    description: "Commander of wild beasts and creatures",
    abilities: [
      {
        name: "Summon Bear",
        iconName: "Bird",
        description: "Summon bear that attacks for 15 damage for 3 turns",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Pack Tactics",
        iconName: "Target",
        description: "Increase attack by 50% for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Wild Command",
        iconName: "Skull",
        description: "Intimidate opponent, reducing their attack by 40%",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  
  // 🧙 Elemental & Specialized Magic Classes
  Pyromancer: {
    health: 80,
    attackMin: 8,
    attackMax: 12,
    description: "Master of fire magic with explosive power",
    abilities: [
      {
        name: "Inferno",
        iconName: "Flame",
        description: "Deal 25-35 damage and burn for 5 damage per turn",
        cooldown: 4,
        manaCost: 35
      },
      {
        name: "Fire Shield",
        iconName: "Shield",
        description: "Create fire barrier that deals 10 damage to attackers",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Meteor Strike",
        iconName: "Sparkles",
        description: "Call down meteor for 35-45 damage",
        cooldown: 6,
        manaCost: 45
      }
    ]
  },
  Cryomancer: {
    health: 85,
    attackMin: 7,
    attackMax: 11,
    description: "Ice magic user who freezes and slows enemies",
    abilities: [
      {
        name: "Frost Bolt",
        iconName: "Sparkles",
        description: "Deal 15-20 damage and freeze for 1 turn",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Ice Armor",
        iconName: "Shield",
        description: "Create ice armor reducing damage by 65% for 2 turns",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Blizzard",
        iconName: "Sparkles",
        description: "Deal 20-30 damage and slow opponent for 2 turns",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Stormcaller: {
    health: 90,
    attackMin: 9,
    attackMax: 14,
    description: "Lightning wielder with chain attacks",
    abilities: [
      {
        name: "Lightning Bolt",
        iconName: "Zap",
        description: "Deal 20-25 damage with 30% chance to chain",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Thunder Clap",
        iconName: "Zap",
        description: "Stun opponent for 1 turn and deal 15 damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Storm Surge",
        iconName: "Sparkles",
        description: "Increase attack by 100% for 2 turns",
        cooldown: 5,
        manaCost: 35
      }
    ]
  },
  Earthshaker: {
    health: 120,
    attackMin: 10,
    attackMax: 15,
    description: "Master of earth and stone magic",
    abilities: [
      {
        name: "Earthquake",
        iconName: "Sparkles",
        description: "Deal 25-35 damage and reduce opponent's evasion",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Stone Skin",
        iconName: "Shield",
        description: "Transform skin to stone, reducing damage by 75%",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Rock Throw",
        iconName: "Target",
        description: "Hurl massive rock for 30-40 damage",
        cooldown: 4,
        manaCost: 30
      }
    ]
  },
  
  // 🎭 Support & Utility Classes
  Bard: {
    health: 95,
    attackMin: 6,
    attackMax: 10,
    description: "Musical performer who buffs allies and debuffs enemies",
    abilities: [
      {
        name: "Inspire",
        iconName: "Heart",
        description: "Heal 20 health and increase attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Lullaby",
        iconName: "Eye",
        description: "Put opponent to sleep for 1 turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Battle Song",
        iconName: "Sparkles",
        description: "Increase attack by 25% for 2 turns",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Enchanter: {
    health: 85,
    attackMin: 5,
    attackMax: 8,
    description: "Master of magical enhancements and illusions",
    abilities: [
      {
        name: "Charm",
        iconName: "Eye",
        description: "Control opponent's next action",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Magic Weapon",
        iconName: "Sword",
        description: "Enchant weapon for 50% increased attack for 2 turns",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Mirror Image",
        iconName: "Eye",
        description: "Create illusion that takes next attack for you",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Illusionist: {
    health: 80,
    attackMin: 4,
    attackMax: 7,
    description: "Master of deception and mind games",
    abilities: [
      {
        name: "Phantom Strike",
        iconName: "Sword",
        description: "Create phantom that attacks for 15-20 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Confuse",
        iconName: "Eye",
        description: "Confuse opponent, 50% chance they attack themselves",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Invisibility",
        iconName: "Eye",
        description: "Become invisible, guaranteed dodge for 2 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  
  // ⚔️ Weapon Specialist Classes
  Axemaster: {
    health: 110,
    attackMin: 14,
    attackMax: 20,
    description: "Brutal warrior who wields massive axes",
    abilities: [
      {
        name: "Cleave",
        iconName: "Sword",
        description: "Deal 25-35 damage and bleed for 5 damage per turn",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Berserker Rage",
        iconName: "Flame",
        description: "Increase damage by 80% but take 10 damage per turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Executioner",
        iconName: "Sword",
        description: "Deal 40-50 damage if target below 40% health",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Hammerlord: {
    health: 125,
    attackMin: 12,
    attackMax: 18,
    description: "Heavy weapon specialist with crushing blows",
    abilities: [
      {
        name: "Crushing Blow",
        iconName: "Sword",
        description: "Deal 30-40 damage and stun for 1 turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Ground Slam",
        iconName: "Sparkles",
        description: "Deal 20-25 damage to all enemies and slow them",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Hammer Time",
        iconName: "Clock",
        description: "Increase attack speed and damage by 50% for 2 turns",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Swordsman: {
    health: 105,
    attackMin: 11,
    attackMax: 16,
    description: "Classic sword fighter with balanced combat",
    abilities: [
      {
        name: "Swift Strike",
        iconName: "Sword",
        description: "Attack twice for 8-12 damage each",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Defensive Stance",
        iconName: "Shield",
        description: "Reduce damage by 50% and counter for 15 damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Perfect Form",
        iconName: "Target",
        description: "Guaranteed critical hit for 25-35 damage",
        cooldown: 5,
        manaCost: 35
      }
    ]
  },
  
  // 🏛️ Noble & Elite Classes
  Noble: {
    health: 100,
    attackMin: 8,
    attackMax: 12,
    description: "Aristocratic fighter with refined techniques",
    abilities: [
      {
        name: "Noble Strike",
        iconName: "Sword",
        description: "Elegant attack dealing 20-25 damage",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Royal Guard",
        iconName: "Shield",
        description: "Summon royal guard that protects for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Command Authority",
        iconName: "Skull",
        description: "Intimidate opponent, reducing their attack by 30%",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Champion: {
    health: 115,
    attackMin: 12,
    attackMax: 17,
    description: "Elite warrior with tournament experience",
    abilities: [
      {
        name: "Champion's Strike",
        iconName: "Sword",
        description: "Deal 25-30 damage and gain 20% damage boost",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Victory Pose",
        iconName: "Heart",
        description: "Heal 15 health and gain 30% evasion for 2 turns",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Glory Seeker",
        iconName: "Target",
        description: "Increase all stats by 40% when below 50% health",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  KnightCommander: {
    health: 130,
    attackMin: 11,
    attackMax: 16,
    description: "Military leader with tactical expertise",
    abilities: [
      {
        name: "Tactical Strike",
        iconName: "Sword",
        description: "Deal 20-25 damage and gain tactical advantage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Battle Formation",
        iconName: "Shield",
        description: "Increase defense by 60% and attack by 20%",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Rally the Troops",
        iconName: "Heart",
        description: "Heal 25 health and inspire allies",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  
  // 🌟 Unique & Special Classes
  Timekeeper: {
    health: 90,
    attackMin: 7,
    attackMax: 11,
    description: "Master of time manipulation and temporal magic",
    abilities: [
      {
        name: "Time Warp",
        iconName: "Clock",
        description: "Skip opponent's next turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Haste",
        iconName: "Zap",
        description: "Increase attack by 30% for 2 turns",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Temporal Shield",
        iconName: "Shield",
        description: "Create time barrier that blocks all damage for 1 turn",
        cooldown: 7,
        manaCost: 45
      }
    ]
  },
  Voidwalker: {
    health: 85,
    attackMin: 10,
    attackMax: 15,
    description: "Master of void magic and dimensional travel",
    abilities: [
      {
        name: "Void Strike",
        iconName: "Sparkles",
        description: "Deal 20-25 damage and teleport behind enemy",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Void Shield",
        iconName: "Shield",
        description: "Create void barrier that absorbs 50% of damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Dimensional Rift",
        iconName: "Sparkles",
        description: "Banish opponent for 1 turn",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Chaosweaver: {
    health: 95,
    attackMin: 8,
    attackMax: 13,
    description: "Unpredictable mage who harnesses chaos magic",
    abilities: [
      {
        name: "Chaos Bolt",
        iconName: "Sparkles",
        description: "Deal 15-25 damage with random additional effects",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Reality Warp",
        iconName: "Eye",
        description: "Randomly swap health, mana, or stats with opponent",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Entropy Field",
        iconName: "Sparkles",
        description: "Create field that deals 10 damage per turn to both players",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Dreamweaver: {
    health: 80,
    attackMin: 6,
    attackMax: 10,
    description: "Master of dreams and psychic abilities",
    abilities: [
      {
        name: "Nightmare",
        iconName: "Eye",
        description: "Put opponent to sleep and deal 15 damage per turn",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Dream Shield",
        iconName: "Shield",
        description: "Create dream barrier that reflects 50% of damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Lucid Dreaming",
        iconName: "Eye",
        description: "Gain control of opponent's next action",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  
  // 🎯 Precision & Specialist Classes
  Sharpshooter: {
    health: 85,
    attackMin: 13,
    attackMax: 18,
    description: "Deadly accurate marksman with perfect aim",
    abilities: [
      {
        name: "Bullseye",
        iconName: "Target",
        description: "Guaranteed critical hit for 30-40 damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Steady Aim",
        iconName: "Eye",
        description: "Increase accuracy and damage by 60% for 2 turns",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Trick Shot",
        iconName: "Target",
        description: "Deal 25-35 damage and ignore all defenses",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Trapper: {
    health: 95,
    attackMin: 8,
    attackMax: 12,
    description: "Expert at setting traps and controlling the battlefield",
    abilities: [
      {
        name: "Bear Trap",
        iconName: "Target",
        description: "Trap opponent, dealing 15 damage and stunning for 1 turn",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Poison Trap",
        iconName: "Droplet",
        description: "Set poison trap that deals 8 damage per turn for 3 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Explosive Trap",
        iconName: "Bomb",
        description: "Deal 30-40 damage when opponent attacks next",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Scout: {
    health: 90,
    attackMin: 9,
    attackMax: 13,
    description: "Light and fast reconnaissance specialist",
    abilities: [
      {
        name: "Reconnaissance",
        iconName: "Eye",
        description: "Study opponent, gaining 80% evasion for next attack",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Quick Strike",
        iconName: "Sword",
        description: "Fast attack dealing 12-16 damage with 50% chance to attack twice",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Escape Route",
        iconName: "Zap",
        description: "Remove all negative effects and gain 100% evasion for 1 turn",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  
  // 🔥 Elemental & Nature Classes
  Firebender: {
    health: 95,
    attackMin: 10,
    attackMax: 15,
    description: "Master of fire bending and flame manipulation",
    abilities: [
      {
        name: "Fire Blast",
        iconName: "Flame",
        description: "Deal 20-25 damage and burn for 5 damage per turn",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Flame Shield",
        iconName: "Shield",
        description: "Create fire barrier that deals 10 damage to attackers",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Inferno Burst",
        iconName: "Flame",
        description: "Deal 30-40 damage to all enemies",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Icebender: {
    health: 90,
    attackMin: 8,
    attackMax: 12,
    description: "Master of ice bending and frost magic",
    abilities: [
      {
        name: "Ice Shard",
        iconName: "Sparkles",
        description: "Deal 15-20 damage and freeze for 1 turn",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Frost Armor",
        iconName: "Shield",
        description: "Create ice armor reducing damage by 60% for 2 turns",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Blizzard",
        iconName: "Sparkles",
        description: "Deal 25-35 damage and slow opponent for 2 turns",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Earthbender: {
    health: 120,
    attackMin: 11,
    attackMax: 16,
    description: "Master of earth bending and stone manipulation",
    abilities: [
      {
        name: "Rock Throw",
        iconName: "Target",
        description: "Hurl massive rock for 25-30 damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Stone Skin",
        iconName: "Shield",
        description: "Transform skin to stone, reducing damage by 70%",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Earthquake",
        iconName: "Sparkles",
        description: "Deal 30-40 damage and stun for 1 turn",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  
  // 🎭 Performance & Art Classes
  Jester: {
    health: 85,
    attackMin: 6,
    attackMax: 10,
    description: "Entertaining performer who confuses and distracts",
    abilities: [
      {
        name: "Juggle",
        iconName: "Target",
        description: "Distract opponent, 70% chance they miss next attack",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Comedy",
        iconName: "Heart",
        description: "Heal 15 health and confuse opponent for 1 turn",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Final Act",
        iconName: "Sparkles",
        description: "Deal 20-30 damage with 50% chance to stun",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  Dancer: {
    health: 90,
    attackMin: 7,
    attackMax: 11,
    description: "Graceful performer who uses dance to fight",
    abilities: [
      {
        name: "Dance of Blades",
        iconName: "Sword",
        description: "Elegant attack dealing 15-20 damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Graceful Dodge",
        iconName: "Zap",
        description: "Dance away from attack, 90% chance to dodge",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Performance",
        iconName: "Heart",
        description: "Inspire self, gaining 40% damage boost for 2 turns",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  Musician: {
    health: 80,
    attackMin: 5,
    attackMax: 8,
    description: "Harmonious fighter who uses music to enhance abilities",
    abilities: [
      {
        name: "Sonic Boom",
        iconName: "Sparkles",
        description: "Deal 15-20 damage with sound waves",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Healing Melody",
        iconName: "Heart",
        description: "Heal 20 health and remove negative effects",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Battle Anthem",
        iconName: "Sparkles",
        description: "Increase all stats by 30% for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  
  // 🏺 Crafting & Artisan Classes
  Blacksmith: {
    health: 110,
    attackMin: 10,
    attackMax: 15,
    description: "Master craftsman who forges weapons and armor",
    abilities: [
      {
        name: "Forge Strike",
        iconName: "Sword",
        description: "Deal 20-25 damage with forged weapon",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Repair Armor",
        iconName: "Shield",
        description: "Heal 25 health and increase defense by 40%",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Masterwork",
        iconName: "Target",
        description: "Create perfect weapon, dealing 30-40 damage",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  Artificer: {
    health: 95,
    attackMin: 8,
    attackMax: 12,
    description: "Magical engineer who creates enchanted items",
    abilities: [
      {
        name: "Magical Device",
        iconName: "Sparkles",
        description: "Deploy device that deals 15-20 damage per turn for 2 turns",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Enchant Weapon",
        iconName: "Sword",
        description: "Enchant weapon for 50% increased damage for 3 turns",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Disenchant",
        iconName: "Sparkles",
        description: "Remove all positive effects from opponent",
        cooldown: 6,
        manaCost: 40
      }
    ]
  },
  Tinkerer: {
    health: 85,
    attackMin: 6,
    attackMax: 10,
    description: "Inventive engineer who creates mechanical devices",
    abilities: [
      {
        name: "Clockwork Device",
        iconName: "Clock",
        description: "Deploy device that attacks for 10 damage for 3 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Repair",
        iconName: "Heart",
        description: "Heal 20 health and reduce cooldowns by 1 turn",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Overcharge",
        iconName: "Zap",
        description: "Increase damage by 100% but take 10 damage per turn",
        cooldown: 6,
        manaCost: 35
      }
    ]
  }
};