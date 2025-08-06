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
  markDuration: 0
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
  // Increase attack power directly
  setPlayer(prev => ({
    ...prev,
    attackMin: Math.floor(prev.attackMin * (1 + boostValue / 100)),
    attackMax: Math.floor(prev.attackMax * (1 + boostValue / 100)),
    effects: { 
      ...prev.effects, 
      attackBoost: boostValue,
      attackBoostDuration: duration
    }
  }));
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
  
  // Apply damage boost if any
  if (boost > 0) {
    damage = Math.floor(damage * (1 + boost/100));
  }
  
  // Apply damage reduction if any
  if (reduction > 0) {
    damage = Math.floor(damage * (1 - reduction/100));
  }
  
  return damage;
};

export const dealDamage = (
  damage: number,
  target: Player,
  setTarget: Dispatch<SetStateAction<Player>>,
  addLogMessage: (message: string) => void,
  logMessage: string
) => {
  const newHealth = Math.max(0, target.health - damage);
  
  setTarget(prev => ({
    ...prev,
    health: newHealth
  }));
  
  addLogMessage(logMessage);
  
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