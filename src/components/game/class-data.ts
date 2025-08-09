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
  const icon = (Icons as any)[name];
  return icon && typeof icon === 'function' ? icon : Icons.HelpCircle;
};

export const PLAYER_CLASSES: Record<string, PlayerClass> = {
  // Tier 1
  Warrior: { health: 120, attackMin: 10, attackMax: 15, description: "Tier 1 melee fighter", abilities: [
    { name: "Shield Wall", iconName: "Shield", description: "Deal 15-25 damage", cooldown: 4, manaCost: 15 },
    { name: "Heavy Strike", iconName: "Sword", description: "Deal 25-35 damage", cooldown: 3, manaCost: 20 },
    { name: "Rally", iconName: "Heart", description: "Restore 15 health points", cooldown: 5, manaCost: 25 },
    { name: "Shield Bash", iconName: "Shield", description: "Deal 20-30 damage", cooldown: 4, manaCost: 20 },
    { name: "Ground Smash", iconName: "Sword", description: "Deal 22-32 damage", cooldown: 5, manaCost: 25 }

  ]},
  Mage: { health: 85, attackMin: 5, attackMax: 8, description: "Tier 1 caster", abilities: [
    { name: "Fireball", iconName: "Flame", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Storm Bolt", iconName: "Zap", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Arcane Shield", iconName: "Shield", description: "Heal 20 health", cooldown: 5, manaCost: 40 },
    { name: "Healing Potion", iconName: "Heart", description: "Restore 20 health", cooldown: 4, manaCost: 20 },
    { name: "Mana Explosion", iconName: "Sparkles", description: "Deal 30-40 damage and take 10 damage", cooldown: 5, manaCost: 35 },
  ]},
  Rogue: { health: 95, attackMin: 11, attackMax: 16, description: "Tier 1 trickster", abilities: [
    { name: "Cheap Shot", iconName: "Sword", description: "Deal 15-20 damage", cooldown: 4, manaCost: 25 },
    { name: "Dirty Fighting", iconName: "Target", description: "Deal 10-20 damage", cooldown: 5, manaCost: 30 },
    { name: "Escape Artist", iconName: "Zap", description: "Heal 20 health", cooldown: 6, manaCost: 35 },
    { name: "Smoke Bomb", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 4, manaCost: 25 }
  ]},
  Archer: { health: 95, attackMin: 8, attackMax: 12, description: "Tier 1 ranged", abilities: [
    { name: "Quick Shot", iconName: "Target", description: "Deal 20-30 damage", cooldown: 3, manaCost: 20 },
    { name: "Poison Arrow", iconName: "Droplet", description: "Deal 15-25 damage", cooldown: 4, manaCost: 25 },
    { name: "Evasion", iconName: "Zap", description: "Deal 18-28 damage", cooldown: 4, manaCost: 15 }
  ]},
  Healer: { health: 105, attackMin: 6, attackMax: 10, description: "Tier 1 healer", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 },
    { name: "Healing Elixir", iconName: "Heart", description: "Restore 20-30 health", cooldown: 5, manaCost: 30 }
  ]},
  Ranger: { health: 100, attackMin: 10, attackMax: 15, description: "Tier 1 tracker", abilities: [
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Call Wolf", iconName: "Bird", description: "Deal 18-28 damage", cooldown: 5, manaCost: 30 },
    { name: "Nature's Eye", iconName: "Leaf", description: "Deal 22-32 damage", cooldown: 6, manaCost: 30 },
    { name: "Hunting Tactics", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 25 }
  ]},
  Slayer: { health: 100, attackMin: 14, attackMax: 22, description: "Tier 1 brutal striker", abilities: [
    { name: "Reckless Strike", iconName: "Sword", description: "Deal 25-40 damage and take 5 damage", cooldown: 4, manaCost: 30 },
    { name: "Battle Roar", iconName: "Skull", description: "Deal 25-35 damage", cooldown: 5, manaCost: 25 },
    { name: "Bloodlust", iconName: "Droplet", description: "Deal 10-20 damage and heal 10 health", cooldown: 5, manaCost: 35 },
    { name: "Executioner", iconName: "Sword", description: "Deal 40-50 damage if target below 40% health", cooldown: 6, manaCost: 40 }
  ]},
  Cleric: { health: 105, attackMin: 6, attackMax: 10, description: "Tier 1 divine caster", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 }
  ]},
  Oracle: { health: 95, attackMin: 7, attackMax: 12, description: "Tier 1 seer", abilities: [
    { name: "Arcane Missiles", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 },
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 }
  ]},
  Monk: { health: 110, attackMin: 10, attackMax: 15, description: "Tier 1 martial protector", abilities: [
    { name: "Counter Strike", iconName: "Sword", description: "Deal 28-38 damage", cooldown: 4, manaCost: 25 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 },
    { name: "Protect Ally", iconName: "Heart", description: "Heal 15 health and heal 25 health", cooldown: 6, manaCost: 35 }
  ]},

  // Tier 2
  Battlemage: { health: 95, attackMin: 9, attackMax: 13, description: "Melee + destructive magic", abilities: [
    { name: "Spell Blade", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Mana Surge", iconName: "Sparkles", description: "Deal 35-45 damage", cooldown: 5, manaCost: 25 },
    { name: "Arcane Armor", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 35 }
  ]},
  Warlord: { health: 135, attackMin: 14, attackMax: 19, description: "Tactical melee expert", abilities: [
    { name: "Command Strike", iconName: "Sword", description: "Deal 15-25 damage and heal 10 health", cooldown: 4, manaCost: 30 },
    { name: "Battle Tactics", iconName: "Target", description: "Deal 22-32 damage", cooldown: 5, manaCost: 25 },
    { name: "Rally Troops", iconName: "Heart", description: "Heal 20 health and heal 10 health", cooldown: 6, manaCost: 40 }
  ]},
  "Marksman Knight": { health: 120, attackMin: 11, attackMax: 17, description: "Armored ranged knight", abilities: [
    { name: "Aimed Shot", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 35 },
    { name: "Shield Wall", iconName: "Shield", description: "Deal 15-25 damage", cooldown: 4, manaCost: 15 },
    { name: "Heavy Strike", iconName: "Sword", description: "Deal 25-35 damage", cooldown: 3, manaCost: 20 }
  ]},
  Paladin: { health: 130, attackMin: 8, attackMax: 14, description: "Holy warrior", abilities: [
    { name: "Divine Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Divine Shield", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 35 },
    { name: "Holy Strike", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 25 },
    { name: "Lay on Hands", iconName: "Heart", description: "Restore 25 health", cooldown: 5, manaCost: 35 }
  ]},
  Beastguard: { health: 125, attackMin: 10, attackMax: 15, description: "Protector with beasts", abilities: [
    { name: "Shield Wall", iconName: "Shield", description: "Deal 15-25 damage", cooldown: 4, manaCost: 15 },
    { name: "Call Wolf", iconName: "Bird", description: "Deal 18-28 damage", cooldown: 5, manaCost: 30 },
    { name: "Summon Bear", iconName: "Target", description: "Deal 20-30 damage", cooldown: 5, manaCost: 30 },
    { name: "Pack Tactics", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 25 }
  ]},
  Berserker: { health: 100, attackMin: 14, attackMax: 24, description: "Rage-fueled fighter", abilities: [
    { name: "Reckless Strike", iconName: "Sword", description: "Deal 25-40 damage and take 5 damage", cooldown: 4, manaCost: 30 },
    { name: "Battle Roar", iconName: "Skull", description: "Deal 25-35 damage", cooldown: 5, manaCost: 25 },
    { name: "Blood Focus", iconName: "Droplet", description: "Heal 20 health", cooldown: 5, manaCost: 20 },
    { name: "Rage", iconName: "Skull", description: "Deal 30-40 damage and take 5 damage", cooldown: 5, manaCost: 30 }
  ]},
  Crusader: { health: 125, attackMin: 10, attackMax: 15, description: "Devout knight", abilities: [
    { name: "Divine Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Divine Shield", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 35 },
    { name: "Holy Strike", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 25 },
    { name: "Sacred Barrier", iconName: "Shield", description: "Heal 40 health", cooldown: 5, manaCost: 30 }
  ]},
  "Templar Seer": { health: 120, attackMin: 10, attackMax: 14, description: "Foresight warrior", abilities: [
    { name: "Holy Strike", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 25 },
    { name: "Sacred Barrier", iconName: "Shield", description: "Heal 40 health", cooldown: 5, manaCost: 30 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 }
  ]},
  "Fistblade Knight": { health: 125, attackMin: 11, attackMax: 17, description: "Martial in armor", abilities: [
    { name: "Counter Strike", iconName: "Sword", description: "Deal 28-38 damage", cooldown: 4, manaCost: 25 },
    { name: "Heavy Strike", iconName: "Sword", description: "Deal 25-35 damage", cooldown: 3, manaCost: 20 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 },
    { name: "Parry", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 20 }
  ]},
  Spellblade: { health: 95, attackMin: 12, attackMax: 18, description: "Stealth magic assassin", abilities: [
    { name: "Spell Blade", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Mana Surge", iconName: "Sparkles", description: "Deal 35-45 damage", cooldown: 5, manaCost: 25 },
    { name: "Arcane Armor", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 35 }
  ]},
  "Arcane Archer": { health: 90, attackMin: 10, attackMax: 16, description: "Magical archer", abilities: [
    { name: "Aimed Shot", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 35 },
    { name: "Fireball", iconName: "Flame", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Piercing Shot", iconName: "Sword", description: "Deal 18-28 damage", cooldown: 4, manaCost: 25 }
  ]},
  Priest: { health: 110, attackMin: 7, attackMax: 12, description: "Magic healer", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 }
  ]},
  "Elemental Warden": { health: 100, attackMin: 9, attackMax: 14, description: "Nature mage defender", abilities: [
    { name: "Fireball", iconName: "Flame", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Blizzard", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 5, manaCost: 35 },
    { name: "Stone Skin", iconName: "Shield", description: "Heal 40 health", cooldown: 5, manaCost: 35 },
    { name: "Meteor Strike", iconName: "Sparkles", description: "Deal 35-45 damage", cooldown: 6, manaCost: 40 }
  ]},
  Warlock: { health: 85, attackMin: 9, attackMax: 14, description: "Dark caster", abilities: [
    { name: "Shadow Bolt", iconName: "Bolt", description: "Deal 18-24 damage", cooldown: 3, manaCost: 25 },
    { name: "Life Tap", iconName: "Heart", description: "Sacrifice 10 health to gain 25 mana", cooldown: 3, manaCost: 0 },
    { name: "Summon Imp", iconName: "Flame", description: "Deal 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Soul Drain", iconName: "Droplet", description: "Deal 10-15 damage and heal the same", cooldown: 3, manaCost: 20 },
    { name: "Stat Swap", iconName: "Shuffle", description: "Swap your health and mana with the opponent", cooldown: 6, manaCost: 40 }

  ]},
  Lightbinder: { health: 105, attackMin: 7, attackMax: 12, description: "Holy mage", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 }
  ]},
  Sage: { health: 95, attackMin: 8, attackMax: 12, description: "Wise spellcaster", abilities: [
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 },
    { name: "Arcane Missiles", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 }
  ]},
  "Mystic Monk": { health: 115, attackMin: 10, attackMax: 15, description: "Martial spell monk", abilities: [
    { name: "Counter Strike", iconName: "Sword", description: "Deal 28-38 damage", cooldown: 4, manaCost: 25 },
    { name: "Arcane Armor", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 35 },
    { name: "Holy Strike", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 25 }
  ]},
  Sniper: { health: 90, attackMin: 12, attackMax: 20, description: "Long-range assassin", abilities: [
    { name: "Precision Shot", iconName: "Target", description: "Deal 30-40 damage", cooldown: 5, manaCost: 35 },
    { name: "Camouflage", iconName: "Leaf", description: "Deal 18-28 damage", cooldown: 6, manaCost: 30 },
    { name: "Kill Shot", iconName: "Target", description: "Deal 40-50 damage if target below 30% health", cooldown: 6, manaCost: 40 },
    { name: "Overwatch", iconName: "Target", description: "Deal 50-60 damage", cooldown: 6, manaCost: 45 }
  ]},
  "Shadow Priest": { health: 100, attackMin: 9, attackMax: 14, description: "Stealthy healer", abilities: [
    { name: "Backstab", iconName: "Sword", description: "Deal 20-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 }
  ]},
  Pathfinder: { health: 100, attackMin: 10, attackMax: 15, description: "Stealth tracker", abilities: [
    { name: "Nature's Eye", iconName: "Leaf", description: "Deal 22-32 damage", cooldown: 6, manaCost: 30 },
    { name: "Camouflage", iconName: "Leaf", description: "Deal 18-28 damage", cooldown: 6, manaCost: 30 },
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 }
  ]},
  Shadowblade: { health: 85, attackMin: 14, attackMax: 20, description: "Stealth killer", abilities: [
    { name: "Shadow Step", iconName: "Zap", description: "Deal 25-35 damage", cooldown: 4, manaCost: 30 },
    { name: "Death Mark", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 25 },
    { name: "Vanish", iconName: "Eye", description: "Deal 22-32 damage", cooldown: 6, manaCost: 35 }
  ]},
  Inquisitor: { health: 110, attackMin: 10, attackMax: 15, description: "Zealot fighter", abilities: [
    { name: "Cheap Shot", iconName: "Sword", description: "Deal 15-20 damage", cooldown: 4, manaCost: 25 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 },
    { name: "Divine Shield", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 35 }
  ]},
  Nightseer: { health: 95, attackMin: 9, attackMax: 14, description: "Prophetic shadow", abilities: [
    { name: "Stealth", iconName: "Eye", description: "Deal 20-30 damage", cooldown: 5, manaCost: 25 },
    { name: "Arcane Missiles", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 }
  ]},
  "Shadow Monk": { health: 105, attackMin: 11, attackMax: 16, description: "Stealthy martial", abilities: [
    { name: "Stealth", iconName: "Eye", description: "Deal 20-30 damage", cooldown: 5, manaCost: 25 },
    { name: "Backstab", iconName: "Sword", description: "Deal 20-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Assassinate", iconName: "Sword", description: "Deal 30-40 damage if target below 50% health", cooldown: 6, manaCost: 40 }
  ]},
  Lightshot: { health: 95, attackMin: 9, attackMax: 14, description: "Holy archer", abilities: [
    { name: "Aimed Shot", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 35 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 },
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 }
  ]},
  Hawkeye: { health: 95, attackMin: 11, attackMax: 17, description: "Tracking marksman", abilities: [
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Aimed Shot", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 35 },
    { name: "Camouflage", iconName: "Leaf", description: "Deal 18-28 damage", cooldown: 6, manaCost: 30 }
  ]},
  Hunter: { health: 95, attackMin: 10, attackMax: 16, description: "Predator", abilities: [
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Crippling Shot", iconName: "Droplet", description: "Deal 12-22 damage", cooldown: 4, manaCost: 25 },
    { name: "Kill Shot", iconName: "Target", description: "Deal 40-50 damage if target below 30% health", cooldown: 6, manaCost: 40 }
  ]},
  "Holy Marksman": { health: 100, attackMin: 10, attackMax: 16, description: "Divine archer", abilities: [
    { name: "Aimed Shot", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 35 },
    { name: "Divine Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 }
  ]},
  "Starshot Seer": { health: 95, attackMin: 10, attackMax: 16, description: "Foresight archer", abilities: [
    { name: "Aimed Shot", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 35 },
    { name: "Arcane Missiles", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 }
  ]},
  "Zen Archer": { health: 100, attackMin: 10, attackMax: 16, description: "Focused archer", abilities: [
    { name: "Aimed Shot", iconName: "Target", description: "Deal 25-35 damage", cooldown: 5, manaCost: 35 },
    { name: "Counter Strike", iconName: "Sword", description: "Deal 28-38 damage", cooldown: 4, manaCost: 25 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 }
  ]},
  Beastwarden: { health: 110, attackMin: 10, attackMax: 15, description: "Nature healer", abilities: [
    { name: "Call Wolf", iconName: "Bird", description: "Deal 18-28 damage", cooldown: 5, manaCost: 30 },
    { name: "Summon Bear", iconName: "Target", description: "Deal 20-30 damage", cooldown: 5, manaCost: 30 },
    { name: "Rejuvenation", iconName: "Heart", description: "Heal 25 health", cooldown: 6, manaCost: 40 }
  ]},
  Exorcist: { health: 110, attackMin: 10, attackMax: 15, description: "Holy purger", abilities: [
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 },
    { name: "Reckless Strike", iconName: "Sword", description: "Deal 25-40 damage and take 5 damage", cooldown: 4, manaCost: 30 },
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 }
  ]},
  "High Priest": { health: 115, attackMin: 7, attackMax: 12, description: "Divine leader", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 }
  ]},
  Prophet: { health: 105, attackMin: 7, attackMax: 12, description: "Divine seer", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 }
  ]},
  Peacebringer: { health: 110, attackMin: 9, attackMax: 14, description: "Restorative monk", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 },
    { name: "Protect Ally", iconName: "Heart", description: "Heal 15 health and heal 25 health", cooldown: 6, manaCost: 35 }
  ]},
  Stalker: { health: 95, attackMin: 12, attackMax: 18, description: "Silent killer", abilities: [
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Backstab", iconName: "Sword", description: "Deal 20-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Kill Shot", iconName: "Target", description: "Deal 40-50 damage if target below 30% health", cooldown: 6, manaCost: 40 }
  ]},
  "Wild Chaplain": { health: 105, attackMin: 9, attackMax: 14, description: "Nature priest", abilities: [
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 },
    { name: "Holy Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 3, manaCost: 25 }
  ]},
  "Spirit Tracker": { health: 100, attackMin: 10, attackMax: 15, description: "Spiritual scout", abilities: [
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Nature's Eye", iconName: "Leaf", description: "Deal 22-32 damage", cooldown: 6, manaCost: 30 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 }
  ]},
  Wayfarer: { health: 105, attackMin: 10, attackMax: 15, description: "Traveling fighter", abilities: [
    { name: "Tracking Shot", iconName: "Target", description: "Deal 18-25 damage and then 15-25 damage", cooldown: 5, manaCost: 30 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 },
    { name: "Nature's Eye", iconName: "Leaf", description: "Deal 22-32 damage", cooldown: 6, manaCost: 30 }
  ]},
  "Doomblade Priest": { health: 110, attackMin: 12, attackMax: 18, description: "Slayer priest", abilities: [
    { name: "Reckless Strike", iconName: "Sword", description: "Deal 25-40 damage and take 5 damage", cooldown: 4, manaCost: 30 },
    { name: "Divine Smite", iconName: "Sparkles", description: "Deal 15-25 damage", cooldown: 4, manaCost: 30 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 }
  ]},
  Fatekiller: { health: 100, attackMin: 12, attackMax: 18, description: "Fateful assassin", abilities: [
    { name: "Reckless Strike", iconName: "Sword", description: "Deal 25-40 damage and take 5 damage", cooldown: 4, manaCost: 30 },
    { name: "Arcane Missiles", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 }
  ]},
  "Blood Monk": { health: 115, attackMin: 11, attackMax: 16, description: "Raging monk", abilities: [
    { name: "Reckless Strike", iconName: "Sword", description: "Deal 25-40 damage and take 5 damage", cooldown: 4, manaCost: 30 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 },
    { name: "Counter Strike", iconName: "Sword", description: "Deal 28-38 damage", cooldown: 4, manaCost: 25 }
  ]},
  "Divine Seer": { health: 105, attackMin: 7, attackMax: 12, description: "Holy prophet", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Blessed Armor", iconName: "Shield", description: "Heal 35 health", cooldown: 5, manaCost: 40 },
    { name: "Mana Shield", iconName: "Shield", description: "Heal 25 health", cooldown: 5, manaCost: 35 }
  ]},
  "Ascetic Priest": { health: 110, attackMin: 8, attackMax: 12, description: "Humble priest", abilities: [
    { name: "Divine Healing", iconName: "Heart", description: "Restore 30 health points", cooldown: 4, manaCost: 35 },
    { name: "Holy Strike", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 25 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 }
  ]},
  "Enlightened Master": { health: 115, attackMin: 10, attackMax: 15, description: "Visionary master", abilities: [
    { name: "Arcane Missiles", iconName: "Sparkles", description: "Deal 20-30 damage", cooldown: 3, manaCost: 30 },
    { name: "Defensive Stance", iconName: "Shield", description: "Heal 30 health", cooldown: 5, manaCost: 30 },
    { name: "Holy Strike", iconName: "Sword", description: "Deal 15-25 damage", cooldown: 4, manaCost: 25 }
  ]}
}; 