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
  attackReductionDuration: 0
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