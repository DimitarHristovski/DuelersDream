import { Dispatch, SetStateAction } from 'react';

export interface Ability {
  name: string;
  iconName: string; // Changed from icon: JSX.Element to iconName: string
  description: string;
  cooldown: number;
  currentCooldown?: number;
  manaCost?: number; // Mana cost to use the ability
}

export interface Player {
  name: string;
  className: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attackMin: number;
  attackMax: number;
  isActive: boolean;
  abilities: Ability[];
  effects: {
    shield: number;
    damageBoost: number;
    poisoned: number;
    evading: boolean;
    stunned: boolean;
    bleeding: number;
    regeneration: number;
    attackReduction: number;
    summonedCreature: { damage: number, turnsLeft: number } | null;
    // Duration tracking for effects
    shieldDuration: number;
    damageBoostDuration: number;
    attackReductionDuration: number;
    // Attack boost tracking
    attackBoost: number;
    attackBoostDuration: number;
    // New effect types
    confused: boolean;
    confusionDuration: number;
    sleeping: boolean;
    sleepDuration: number;
    slowed: boolean;
    slowDuration: number;
    reflectDamage: number;
    reflectDuration: number;
    counterAttack: number;
    marked: boolean;
    markDamageIncrease: number;
    markDuration: number;
    // Additional effects for new abilities
    stunDuration: number;
    bleedDuration: number;
    bleedDamage: number;
    poisonDamage: number;
    spellDamageBoost: number;
    spellDamageBoostDuration: number;
    damageReduction: number;
    damageReductionDuration: number;
    nextHitBonus: number;
    nextHitBonusDuration: number;
    weaponEnhancement: number;
    weaponEnhancementElement: string;
    weaponEnhancementDuration: number;
    evasion: number;
    evasionDuration: number;
    // Counter reflected spell damage percent
    counterSpell: number;
    // Repel abilities effect
    repelAbilities: boolean;
    repelAbilitiesDuration: number;
    // Untargetable (cannot be hit by attacks or abilities)
    untargetable: boolean;
    untargetableDuration: number;
    // Shadow ambush delayed strike
    ambushPending: boolean;
    ambushDelay: number;
    ambushMin: number;
    ambushMax: number;
  };
  isComputer?: boolean;
}

export const createDefaultEffects = () => ({
  shield: 0,
  damageBoost: 0,
  poisoned: 0,
  evading: false,
  stunned: false,
  bleeding: 0,
  regeneration: 0,
  attackReduction: 0,
  summonedCreature: null,
  // Duration tracking for effects
  shieldDuration: 0,
  damageBoostDuration: 0,
  attackReductionDuration: 0,
  // Attack boost tracking
  attackBoost: 0,
  attackBoostDuration: 0,
  // New effect types
  confused: false,
  confusionDuration: 0,
  sleeping: false,
  sleepDuration: 0,
  slowed: false,
  slowDuration: 0,
  reflectDamage: 0,
  reflectDuration: 0,
  counterAttack: 0,
  marked: false,
  markDamageIncrease: 0,
  markDuration: 0,
  // Additional effects for new abilities
  stunDuration: 0,
  bleedDuration: 0,
  bleedDamage: 0,
  poisonDamage: 8,
  spellDamageBoost: 0,
  spellDamageBoostDuration: 0,
  damageReduction: 0,
  damageReductionDuration: 0,
  nextHitBonus: 0,
  nextHitBonusDuration: 0,
  weaponEnhancement: 0,
  weaponEnhancementElement: '',
  weaponEnhancementDuration: 0,
  evasion: 0,
  evasionDuration: 0,
  // Counter reflected spell damage percent
  counterSpell: 0,
  // Repel abilities effect
  repelAbilities: false,
  repelAbilitiesDuration: 0,
  // Untargetable effect
  untargetable: false,
  untargetableDuration: 0,
  // Ambush defaults
  ambushPending: false,
  ambushDelay: 0,
  ambushMin: 0,
  ambushMax: 0
});

// Ability utilities
export const applyShieldEffect = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  shieldValue: number,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  // Set shield value and duration
  setPlayer(prev => ({
    ...prev,
    effects: { 
      ...prev.effects, 
      shield: shieldValue,
      shieldDuration: duration
    }
  }));
  addLogMessage(logMessage);
};

export const applyDamageBoost = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  boostValue: number,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  // Set damage boost value and duration
  setPlayer(prev => ({
    ...prev,
    effects: { 
      ...prev.effects, 
      damageBoost: boostValue,
      damageBoostDuration: duration
    }
  }));
  addLogMessage(logMessage);
};

// New function to increase attack power directly
export const applyAttackBoost = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  boostValue: number,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  console.log('applyAttackBoost called with:', { boostValue, duration, playerName: player.name });
  console.log('Player effects before:', player.effects);
  
  // Set attack boost effect (store duration+1 to account for start-of-turn decrement)
  setPlayer(prev => {
    const newEffects = {
      ...prev.effects, 
      attackBoost: boostValue,
      attackBoostDuration: duration + 5
    };
    console.log('Player effects after:', newEffects);
    return {
      ...prev,
      effects: newEffects
    };
  });
  addLogMessage(logMessage);
};

export const applyHeal = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  healAmount: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  const newHealth = Math.min(player.maxHealth, player.health + healAmount);
  
  setPlayer(prev => ({
    ...prev,
    health: newHealth
  }));
  
  addLogMessage(logMessage);
};

export const applyStunEffect = (
  opponent: Player,
  setOpponent: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setOpponent(prev => ({
    ...prev,
    effects: { ...prev.effects, stunned: true }
  }));
  
  addLogMessage(logMessage);
};

export const applyEvasion = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    effects: { ...prev.effects, evading: true }
  }));
  
  addLogMessage(logMessage);
};

export const applyPoison = (
  opponent: Player,
  setOpponent: Dispatch<SetStateAction<Player>>,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setOpponent(prev => ({
    ...prev,
    effects: { ...prev.effects, poisoned: duration }
  }));
  
  addLogMessage(logMessage);
};

export const applyRegeneration = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    effects: { ...prev.effects, regeneration: duration }
  }));
  
  addLogMessage(logMessage);
};

export const applyBleedingEffect = (
  opponent: Player,
  setOpponent: Dispatch<SetStateAction<Player>>,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setOpponent(prev => ({
    ...prev,
    effects: { ...prev.effects, bleeding: duration }
  }));
  
  addLogMessage(logMessage);
};

export const applyAttackReduction = (
  opponent: Player,
  setOpponent: Dispatch<SetStateAction<Player>>,
  reductionPercent: number,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setOpponent(prev => ({
    ...prev,
    effects: { 
      ...prev.effects, 
      attackReduction: reductionPercent,
      attackReductionDuration: duration
    }
  }));
  
  addLogMessage(logMessage);
};

export const applySummonedCreature = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  damage: number,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    effects: { 
      ...prev.effects, 
      summonedCreature: { damage, turnsLeft: duration }
    }
  }));
  
  addLogMessage(logMessage);
};

// Mana manipulation functions
export const stealMana = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  amount: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setTarget(prev => ({
    ...prev,
    mana: Math.max(0, prev.mana - amount)
  }));
  addLogMessage(logMessage);
};

export const gainMana = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  amount: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    mana: Math.min(prev.maxMana, prev.mana + amount)
  }));
  addLogMessage(logMessage);
};

export const convertHealthToMana = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  healthCost: number,
  manaGain: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    health: Math.max(1, prev.health - healthCost),
    mana: Math.min(prev.maxMana, prev.mana + manaGain)
  }));
  addLogMessage(logMessage);
};

// Effect removal functions
export const removeAllNegativeEffects = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      poisoned: 0,
      stunned: false,
      bleeding: 0,
      attackReduction: 0,
      attackReductionDuration: 0
    }
  }));
  addLogMessage(logMessage);
};

export const removeAllPositiveEffects = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setTarget(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      shield: 0,
      shieldDuration: 0,
      damageBoost: 0,
      damageBoostDuration: 0,
      regeneration: 0,
      evading: false,
      summonedCreature: null
    }
  }));
  addLogMessage(logMessage);
};

// Cooldown reduction function
export const reduceAllCooldowns = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  reduction: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    abilities: prev.abilities.map(ability => ({
      ...ability,
      currentCooldown: ability.currentCooldown 
        ? Math.max(0, ability.currentCooldown - reduction)
        : 0
    }))
  }));
  addLogMessage(logMessage);
};

// Skip turn function
export const skipNextTurn = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setTarget(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      stunned: true
    }
  }));
  addLogMessage(logMessage);
};

// Confusion effect
export const applyConfusion = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setTarget(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      confused: true,
      confusionDuration: duration
    }
  }));
  addLogMessage(logMessage);
};

// Sleep effect
export const applySleep = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setTarget(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      sleeping: true,
      sleepDuration: duration
    }
  }));
  addLogMessage(logMessage);
};

// Slow effect
export const applySlow = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setTarget(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      slowed: true,
      slowDuration: duration
    }
  }));
  addLogMessage(logMessage);
};

// Chain lightning effect
export const applyChainLightning = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  damage: number,
  chainChance: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  dealDamage(damage, target, setTarget, addLogMessage, logMessage);
  if (Math.random() < chainChance) {
    addLogMessage(`${target.name} is hit by chain lightning!`);
    dealDamage(Math.floor(damage * 0.5), target, setTarget, addLogMessage, 
      `${target.name} takes ${Math.floor(damage * 0.5)} chain damage!`);
  }
};

// Reflect damage effect
export const applyReflectDamage = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  reflectPercent: number,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      reflectDamage: reflectPercent,
      reflectDuration: duration
    }
  }));
  addLogMessage(logMessage);
};

// Counter attack effect
export const applyCounterAttack = (
  player: Player,
  setPlayer: Dispatch<SetStateAction<Player>>,
  counterDamage: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setPlayer(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      counterAttack: counterDamage
    }
  }));
  addLogMessage(logMessage);
};

// Mark target for increased damage
export const applyMarkTarget = (
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  damageIncrease: number,
  duration: number,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  setTarget(prev => ({
    ...prev,
    effects: {
      ...prev.effects,
      marked: true,
      markDamageIncrease: damageIncrease,
      markDuration: duration
    }
  }));
  addLogMessage(logMessage);
};

// Swap stats between players
export const swapStats = (
  player1: Player,
  setPlayer1: Dispatch<SetStateAction<Player>>,
  player2: Player,
  setPlayer2: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  const tempHealth = player1.health;
  const tempMana = player1.mana;
  
  setPlayer1(prev => ({
    ...prev,
    health: player2.health,
    mana: player2.mana
  }));
  
  setPlayer2(prev => ({
    ...prev,
    health: tempHealth,
    mana: tempMana
  }));
  
  addLogMessage(logMessage);
};

export const calculateAttackDamage = (
  min: number, 
  max: number, 
  boost: number = 0, 
  reduction: number = 0
): number => {
  let damage = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log('calculateAttackDamage:', { min, max, boost, reduction, baseDamage: damage });
  
  // Apply damage boost if any
  if (boost > 0) {
    const boostedDamage = Math.floor(damage * (1 + boost/100));
    console.log(`Applying ${boost}% attack boost: ${damage} -> ${boostedDamage}`);
    damage = boostedDamage;
  }
  
  // Apply damage reduction if any
  if (reduction > 0) {
    const reducedDamage = Math.floor(damage * (1 - reduction/100));
    console.log(`Applying ${reduction}% attack reduction: ${damage} -> ${reducedDamage}`);
    damage = reducedDamage;
  }
  
  console.log('Final damage:', damage);
  return damage;
};

export const dealDamage = (
  damage: number,
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string,
  onAppliedDamage?: (actualDamage: number) => void
) => {
  let actualDamage = damage;
  
  // Check if target has shield
  if (target.effects.shield > 0) {
    if (target.effects.shield >= damage) {
      // Shield completely blocks the damage
      actualDamage = 0;
      setTarget(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          shield: prev.effects.shield - damage
        }
      }));
      addLogMessage(`${target.name}'s shield blocks ${damage} damage!`);
    } else {
      // Shield partially blocks the damage
      actualDamage = damage - target.effects.shield;
      setTarget(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          shield: 0
        }
      }));
      addLogMessage(`${target.name}'s shield blocks ${target.effects.shield} damage!`);
    }
  }
  
  const newHealth = Math.max(0, target.health - actualDamage);
  
  setTarget(prev => ({
    ...prev,
    health: newHealth
  }));
  
  if (actualDamage > 0) {
    addLogMessage(logMessage);
  }
  
  if (onAppliedDamage) {
    try { onAppliedDamage(actualDamage); } catch (e) { /* no-op */ }
  }
  
  return newHealth;
};

interface ClassData {
  health: number;
  attackMin: number;
  attackMax: number;
  description: string;
  abilities: {
    name: string;
    iconName: string;
    description: string;
    cooldown: number;
    manaCost: number;
  }[];
}

export const buildDefaultPlayer = (
  name: string, 
  className: string,
  classData: ClassData,
  isActive: boolean,
  isComputer = false
): Player => {
  return {
    name,
    className,
    health: classData.health,
    maxHealth: classData.health,
    mana: 100, // Default starting mana
    maxMana: 100, // Default max mana
    attackMin: classData.attackMin,
    attackMax: classData.attackMax,
    isActive,
    abilities: classData.abilities.map((ability) => ({
      ...ability,
      currentCooldown: 0
    })),
    effects: createDefaultEffects(),
    isComputer
  };
};