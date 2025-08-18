import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

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
  description: string;
  abilities: PlayerClassAbility[];
}

export const getIconByName = (name: string): LucideIcon => {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return icon && typeof icon === 'function' ? icon : Icons.HelpCircle;
};

export const PLAYER_CLASSES: Record<string, PlayerClass> = {
  "Warrior": {
    health: 110,
    attackMin: 10,
    attackMax: 16,
    description: "Tier 1 melee fighter",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% ",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Increase attack by 20% ",
        cooldown: 4,
        manaCost: 20
      },

      {
        name: "Poison Strike",
        iconName: "Droplets",
        description: "Deal 8 poison damage",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Bleeding Strike",
        iconName: "Zap",
        description: "Inflict 6 bleed damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Berserker Rage",
        iconName: "Flame",
        description: "Berserker rage 50% attack boost, take 10 damage",
        cooldown: 8,
        manaCost: 40
      },
      {
        name: "Life Steal",
        iconName: "Heart",
        description: "Deal 20 damage and steal 20 health",
        cooldown: 6,
        manaCost: 30
      },
      {
        name: "Mana Burn",
        iconName: "Zap",
        description: "Mana burn 2x opponent's mana as damage",
        cooldown: 7,
        manaCost: 35
      },
      {
        name: "Execute",
        iconName: "Sword",
        description: "Execute enemies below 25% health for 40 damage",
        cooldown: 8,
        manaCost: 45
      },
      {
        name: "Cleanse",
        iconName: "Sparkles",
        description: "Cleanse all effects and restore 20 health",
        cooldown: 6,
        manaCost: 30
      },
      {
        name: "Whirlwind",
        iconName: "Wind",
        description: "Whirlwind 25 damage to enemy, 8 self damage",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Vampiric Strike",
        iconName: "Droplets",
        description: "Vampiric strike 22 damage with 40% healing",
        cooldown: 6,
        manaCost: 28
      },
      {
        name: "Mana Heal",
        iconName: "Heart",
        description: "Convert 25 mana to 30 health",
        cooldown: 5,
        manaCost: 0
      },

    ]
  },
  "Slayer": {
    health: 115,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 1 melee fighter",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40%",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% ",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Rogue": {
    health: 120,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 1 melee fighter",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40%",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Monk": {
    health: 110,
    attackMin: 10,
    attackMax: 16,
    description: "Tier 1 melee fighter",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Archer": {
    health: 95,
    attackMin: 8,
    attackMax: 14,
    description: "Tier 1 ranged fighter",
    abilities: [
      {
        name: "Rapid Fire",
        iconName: "Target",
        description: "Deal 20 damage and gain 30% attack boost for 3 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Power Shot",
        iconName: "Target",
        description: "Deal 28 damage with 40% attack boost",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Explosive Barrage",
        iconName: "Zap",
        description: "Deal 22 damage and increase attack by 25% for 2 turns",
        cooldown: 5,
        manaCost: 28
      },
      {
        name: "Focused Strike",
        iconName: "ArrowRight",
        description: "Deal 25 damage with 50% attack increase",
        cooldown: 4,
        manaCost: 26
      },
      {
        name: "Venomous Assault",
        iconName: "Droplets",
        description: "Deal 18 damage, apply 8 poison, gain 20% attack for 2 turns",
        cooldown: 5,
        manaCost: 28
      },
      {
        name: "Battle Fury",
        iconName: "Crosshair",
        description: "Increase attack by 60% for 4 turns",
        cooldown: 7,
        manaCost: 35
      },
      {
        name: "Berserker Shot",
        iconName: "Eye",
        description: "Deal 30 damage and gain 45% attack boost for 2 turns",
        cooldown: 6,
        manaCost: 32
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 100% evasion for 2 turns",
        cooldown: 8,
        manaCost: 40
      }
    ]
  },
  "Ranger": {
    health: 100,
    attackMin: 10,
    attackMax: 16,
    description: "Tier 1 ranged fighter",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Mage": {
    health: 90,
    attackMin: 6,
    attackMax: 12,
    description: "Tier 1 caster fighter",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Cleric": {
    health: 95,
    attackMin: 7,
    attackMax: 13,
    description: "Tier 1 caster fighter",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Oracle": {
    health: 100,
    attackMin: 8,
    attackMax: 14,
    description: "Tier 1 caster fighter",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Healer": {
    health: 90,
    attackMin: 6,
    attackMax: 12,
    description: "Tier 1 caster fighter",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Warlord": {
    health: 130,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Berserker": {
    health: 135,
    attackMin: 14,
    attackMax: 22,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Reckless Swing",
        iconName: "Sword",
        description: "Deal 25-40 damage but take 5 self-damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Rage",
        iconName: "Flame",
        description: "Increase attack by 50% for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Battle Roar",
        iconName: "Skull",
        description: "Reduce enemy attack by 25% for 2 turns",
        cooldown: 5,
        manaCost: 20
      },
      {
        name: "Bloodlust",
        iconName: "Droplet",
        description: "Regenerate 10 health per turn for 2 turns",
        cooldown: 5,
        manaCost: 25
      }
    ]
  },
  "Crusader": {
    health: 140,
    attackMin: 16,
    attackMax: 24,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Holy Strike",
        iconName: "Sword",
        description: "Deal 18-26 damage; 25% to stun",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Sacred Barrier",
        iconName: "Shield",
        description: "Reduce damage by 75% for 1 turn",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Vow of Zeal",
        iconName: "Megaphone",
        description: "Increase attack by 30% for 2 turns",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Purify",
        iconName: "Sparkles",
        description: "Cleanse all negative effects",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  "Fistblade Knight": {
    health: 130,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Paladin": {
    health: 135,
    attackMin: 14,
    attackMax: 22,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Divine Smite",
        iconName: "Sparkles",
        description: "Deal 20-30 holy damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Lay on Hands",
        iconName: "Heart",
        description: "Heal yourself for 30 health",
        cooldown: 6,
        manaCost: 40
      },
      {
        name: "Divine Shield",
        iconName: "Shield",
        description: "Reduce damage taken by 75% until next turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Righteous Fury",
        iconName: "Flame",
        description: "Increase damage by 40% for 2 turns",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Beastguard": {
    health: 140,
    attackMin: 16,
    attackMax: 24,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Shadowblade": {
    health: 130,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Stalker": {
    health: 135,
    attackMin: 14,
    attackMax: 22,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Doomblade Priest": {
    health: 140,
    attackMin: 16,
    attackMax: 24,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Blood Monk": {
    health: 130,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Templar Seer": {
    health: 135,
    attackMin: 14,
    attackMax: 22,
    description: "Tier 2 melee specialist",
    abilities: [
      {
        name: "Shield Bash",
        iconName: "Shield",
        description: "Stun enemy for 1 turn and deal 12-18 damage",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Rally",
        iconName: "Heart",
        description: "Restore 15 health points",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Battle Shout",
        iconName: "Megaphone",
        description: "Increase attack by 40% for 2 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Intimidate",
        iconName: "Skull",
        description: "Reduce opponent's attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 20
      }
    ]
  },
  "Marksman Knight": {
    health: 100,
    attackMin: 10,
    attackMax: 18,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Sniper": {
    health: 105,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 28-38 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "90% evasion vs next attack",
        cooldown: 6,
        manaCost: 30
      },
      {
        name: "Crippling Shot",
        iconName: "Droplet",
        description: "Reduce enemy attack by 30% for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked (+25% dmg) for 2 turns",
        cooldown: 4,
        manaCost: 25
      }
    ]
  },
  "Hawkeye": {
    health: 110,
    attackMin: 14,
    attackMax: 22,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Twin Arrows",
        iconName: "Target",
        description: "Two shots at 80% damage each",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Evasion",
        iconName: "Zap",
        description: "75% chance to dodge next attack",
        cooldown: 4,
        manaCost: 20
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Trap",
        iconName: "Triangle",
        description: "Immobilize enemy for 1 turn",
        cooldown: 4,
        manaCost: 25
      }
    ]
  },
  "Hunter": {
    health: 100,
    attackMin: 10,
    attackMax: 18,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Pathfinder": {
    health: 105,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Lightshot": {
    health: 110,
    attackMin: 14,
    attackMax: 22,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Holy Marksman": {
    health: 100,
    attackMin: 10,
    attackMax: 18,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Starshot Seer": {
    health: 105,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Zen Archer": {
    health: 110,
    attackMin: 14,
    attackMax: 22,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Spirit Tracker": {
    health: 100,
    attackMin: 10,
    attackMax: 18,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Wayfarer": {
    health: 105,
    attackMin: 12,
    attackMax: 20,
    description: "Tier 2 ranged specialist",
    abilities: [
      {
        name: "Quick Shot",
        iconName: "Target",
        description: "Fire two quick shots (80% damage each)",
        cooldown: 3,
        manaCost: 20
      },
      {
        name: "Mark Target",
        iconName: "Crosshair",
        description: "Marked target takes 25% more damage for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Aimed Shot",
        iconName: "Target",
        description: "Deal 25-35 damage",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Camouflage",
        iconName: "Leaf",
        description: "Gain 90% evasion for next attack",
        cooldown: 6,
        manaCost: 30
      }
    ]
  },
  "Battlemage": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Firebrand",
        iconName: "Flame",
        description: "Weapon strikes deal +10 fire for 2 turns",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Arcane Shield",
        iconName: "Shield",
        description: "Block next attack completely",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Chain Lightning",
        iconName: "Bolt",
        description: "Deal 22 damage; 50% chance to chain",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Power Strike",
        iconName: "Sword",
        description: "Next attack deals +50% damage",
        cooldown: 3,
        manaCost: 20
      }
    ]
  },
  "Spellblade": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Arcane Edge",
        iconName: "Sword",
        description: "Deal 20-28 damage; next hit +25%",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Blink",
        iconName: "Zap",
        description: "Evade next attack (guaranteed)",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Shadow Slash",
        iconName: "Sword",
        description: "Deal 18-24; 30% to bleed (3 turns)",
        cooldown: 4,
        manaCost: 25
      }
    ]
  },
  "Arcane Archer": {
    health: 110,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Priest": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Greater Heal",
        iconName: "Heart",
        description: "Restore 30 health",
        cooldown: 4,
        manaCost: 35
      },
      {
        name: "Holy Smite",
        iconName: "Sparkles",
        description: "Deal 15-25 holy damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Sanctuary",
        iconName: "Shield",
        description: "Block next incoming attack",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Cleanse",
        iconName: "Sparkles",
        description: "Remove negative effects",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  "Elemental Warden": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Warlock": {
    health: 110,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Shadow Bolt",
        iconName: "Bolt",
        description: "Deal 18-24 shadow damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Life Tap",
        iconName: "Heart",
        description: "Lose 10 health to gain 25 mana",
        cooldown: 3,
        manaCost: 0
      },
      {
        name: "Summon Imp",
        iconName: "Flame",
        description: "Summon pet that deals 8 dmg for 3 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Curse of Agony",
        iconName: "Skull",
        description: "8 damage per turn for 3 turns",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  "Lightbinder": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Sage": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Mystic Monk": {
    health: 110,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Shadow Priest": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Inquisitor": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Interrogate",
        iconName: "Skull",
        description: "Reduce enemy attack by 35% for 2 turns",
        cooldown: 4,
        manaCost: 25
      },
      {
        name: "Smite Heresy",
        iconName: "Sparkles",
        description: "Deal 20-28 holy damage",
        cooldown: 4,
        manaCost: 30
      },
      {
        name: "Edict",
        iconName: "Megaphone",
        description: "Silence (no abilities) for 1 turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Judgment",
        iconName: "Target",
        description: "Mark target (+30% damage) for 2 turns",
        cooldown: 5,
        manaCost: 30
      }
    ]
  },
  "Nightseer": {
    health: 110,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Shadow Monk": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Beastwarden": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Summon Wolf",
        iconName: "Dog",
        description: "Summoned creature deals 8 dmg for 3 turns",
        cooldown: 5,
        manaCost: 30
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      },
      {
        name: "Entangling Roots",
        iconName: "Leaf",
        description: "Immobilize enemy 1 turn",
        cooldown: 5,
        manaCost: 35
      },
      {
        name: "Hunting Mark",
        iconName: "Crosshair",
        description: "Marked (+25% dmg) for 2 turns",
        cooldown: 4,
        manaCost: 25
      }
    ]
  },
  "Exorcist": {
    health: 110,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "High Priest": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Prophet": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Peacebringer": {
    health: 110,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Wild Chaplain": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Fatekiller": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Divine Seer": {
    health: 110,
    attackMin: 11,
    attackMax: 18,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Ascetic Priest": {
    health: 100,
    attackMin: 7,
    attackMax: 14,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  },
  "Enlightened Master": {
    health: 105,
    attackMin: 9,
    attackMax: 16,
    description: "Tier 2 caster specialist",
    abilities: [
      {
        name: "Fireball",
        iconName: "Flame",
        description: "Deal 20-30 fire damage",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Heal",
        iconName: "Heart",
        description: "Restore 25 health points",
        cooldown: 3,
        manaCost: 25
      },
      {
        name: "Mana Surge",
        iconName: "Sparkles",
        description: "Increase spell damage by 70% for next turn",
        cooldown: 5,
        manaCost: 25
      },
      {
        name: "Rejuvenation",
        iconName: "Heart",
        description: "Heal 10 per turn for 3 turns",
        cooldown: 6,
        manaCost: 35
      }
    ]
  }
};