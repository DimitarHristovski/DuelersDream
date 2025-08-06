import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Player, Ability, calculateAttackDamage, 
  applyShieldEffect, applyDamageBoost, applyAttackBoost, applyHeal, 
  applyEvasion, applyPoison, applyStunEffect, 
  applyRegeneration, applyBleedingEffect, applyAttackReduction,
  dealDamage, applySummonedCreature, createDefaultEffects,
  stealMana, gainMana, convertHealthToMana, removeAllNegativeEffects, removeAllPositiveEffects,
  reduceAllCooldowns, skipNextTurn, applyConfusion, applySleep, applySlow,
  applyChainLightning, applyReflectDamage, applyCounterAttack, applyMarkTarget, swapStats
} from './abilities';
import { BattleArenaUI } from './BattleArenaUI';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface GameStats {
  wins: number;
  losses: number;
  gamesPlayed: number;
  lastGameResult?: string;
}

interface BattleArenaProps {
  player1: Player;
  player2: Player;
  setPlayer1: React.Dispatch<React.SetStateAction<Player>>;
  setPlayer2: React.Dispatch<React.SetStateAction<Player>>;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  winner: Player | null;
  setWinner: React.Dispatch<React.SetStateAction<Player | null>>;
  gameStats: GameStats;
  setGameStats: React.Dispatch<React.SetStateAction<GameStats>>;
  resetGame: () => void;
}

export const BattleArena = ({
  player1,
  player2,
  setPlayer1,
  setPlayer2,
  gameOver,
  setGameOver,
  winner,
  setWinner,
  gameStats,
  setGameStats,
  resetGame
}: BattleArenaProps) => {
  console.log('BattleArena rendered with props:', { player1, player2, gameOver, winner });
  
  // Temporarily disable toast to see if that's causing issues
  const { toast } = useToast();
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(20);
  const [turnTimerActive, setTurnTimerActive] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const computerMoveTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize battle log
  useEffect(() => {
    setBattleLog([
      `Battle begins! ${player1.name} (${player1.className}) vs ${player2.name} (${player2.className})`,
      `${player1.isActive ? player1.name : player2.name}'s turn to start!`
    ]);
  }, []);

  const addLogMessage = (message: string) => {
    setBattleLog(prev => [message, ...prev.slice(0, 9)]); // Keep the last 10 messages
  };

  // Handle basic attack action
  const handleAttack = () => {
    if (gameOver) return;

    const attacker = player1.isActive ? player1 : player2;
    const defender = player1.isActive ? player2 : player1;
    
    executeAttack(attacker, defender);
  };

  // Execute attack logic with all modifiers
  const executeAttack = (attacker: Player, defender: Player) => {
    // Check if attacker is stunned
    if (attacker.effects.stunned) {
      addLogMessage(`${attacker.name} is stunned and cannot attack!`);
      
      // Remove stun effect
      if (attacker === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: { ...prev.effects, stunned: false }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: { ...prev.effects, stunned: false }
        }));
      }
      
      switchTurns();
      return;
    }
    
    // Check if attacker is sleeping
    if (attacker.effects.sleeping) {
      addLogMessage(`${attacker.name} is sleeping and cannot attack!`);
      
      // Remove sleep effect
      if (attacker === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: { ...prev.effects, sleeping: false, sleepDuration: 0 }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: { ...prev.effects, sleeping: false, sleepDuration: 0 }
        }));
      }
      
      switchTurns();
      return;
    }
    
    // Check if attacker is confused (50% chance to attack self)
    if (attacker.effects.confused) {
      const attackSelf = Math.random() < 0.5;
      if (attackSelf) {
        addLogMessage(`${attacker.name} is confused and attacks themselves!`);
        // Attack self instead
        const selfDamage = calculateAttackDamage(
          attacker.attackMin, 
          attacker.attackMax, 
          attacker.effects.damageBoost,
          0
        );
        
        const newHealth = Math.max(0, attacker.health - selfDamage);
        
        if (attacker === player1) {
          setPlayer1(prev => ({
            ...prev,
            health: newHealth
          }));
        } else {
          setPlayer2(prev => ({
            ...prev,
            health: newHealth
          }));
        }
        
        addLogMessage(`${attacker.name} takes ${selfDamage} damage from confusion!`);
        switchTurns();
        return;
      } else {
        addLogMessage(`${attacker.name} resists confusion and attacks normally!`);
      }
    }
    
    // Base damage calculation with attack reduction
    let damage = calculateAttackDamage(
      attacker.attackMin, 
      attacker.attackMax, 
      attacker.effects.damageBoost,
      defender.effects.attackReduction
    );
    
    // Apply mark damage increase if target is marked
    if (defender.effects.marked && defender.effects.markDamageIncrease > 0) {
      const markBonus = Math.floor(damage * (defender.effects.markDamageIncrease / 100));
      damage += markBonus;
      addLogMessage(`${attacker.name} deals ${markBonus} bonus damage to marked target!`);
    }
    

    
    let damageBlocked = false;
    let damageReduced = false;
    
    // Check if defender has shield effect
    if (defender.effects.shield > 0) {
      // Check if this is specifically a Mana Shield
      const hasManaShield = defender.abilities.some(a => a.name === "Mana Shield" && 
        (a.currentCooldown || 0) < a.cooldown && (a.currentCooldown || 0) > 0);
        
      if (defender.effects.shield === 100) {
        // Complete block
        damage = 0;
        damageBlocked = true;
      } else if (hasManaShield && defender.mana > 0) {
        // Mana Shield - converts damage to mana loss
        const originalDamage = damage;
        const manaReduction = Math.min(defender.mana, Math.floor(damage * (defender.effects.shield/100)));
        damage = Math.floor(damage * (1 - defender.effects.shield/100));
        damageReduced = true;
        
        // Update defender's mana
        if (defender === player1) {
          setPlayer1(prev => ({
            ...prev,
            mana: Math.max(0, prev.mana - manaReduction)
          }));
          addLogMessage(`${defender.name}'s Mana Shield absorbs ${manaReduction} damage at the cost of ${manaReduction} mana!`);
        } else {
          setPlayer2(prev => ({
            ...prev,
            mana: Math.max(0, prev.mana - manaReduction)
          }));
          addLogMessage(`${defender.name}'s Mana Shield absorbs ${manaReduction} damage at the cost of ${manaReduction} mana!`);
        }
      } else {
        // Regular shield - partial damage reduction
        damage = Math.floor(damage * (1 - defender.effects.shield/100));
        damageReduced = true;
      }
    }
    
    // Check if defender is evading
    if (defender.effects.evading) {
      const evadeSuccess = Math.random() < 0.5; // 50% chance
      if (evadeSuccess) {
        damage = 0;
        damageBlocked = true;
      }
    }

    const newHealth = Math.max(0, defender.health - damage);
    
    // Handle reflect damage
    if (defender.effects.reflectDamage > 0 && damage > 0) {
      const reflectedDamage = Math.floor(damage * (defender.effects.reflectDamage / 100));
      const newAttackerHealth = Math.max(0, attacker.health - reflectedDamage);
      
      if (attacker === player1) {
        setPlayer1(prev => ({
          ...prev,
          health: newAttackerHealth
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          health: newAttackerHealth
        }));
      }
      
      addLogMessage(`${defender.name} reflects ${reflectedDamage} damage back to ${attacker.name}!`);
    }
    
    // Create log entry
    let logEntry = `${attacker.name} attacks ${defender.name} for ${damage} damage!`;
    if (damageBlocked) {
      logEntry = `${attacker.name} attacks, but ${defender.name} blocks all damage!`;
    } else if (damageReduced) {
      logEntry = `${attacker.name} attacks for ${damage} damage (reduced by shield)!`;
    }
    
    addLogMessage(logEntry);
    
    // Apply damage and update state
    if (attacker === player1) {
      setPlayer2(prev => ({
        ...prev,
        health: newHealth,
        effects: {
          ...prev.effects,
          evading: false
        }
      }));
      
      // Process over time effects
      processOverTimeEffects(player1, player2);
      
      // Switch turns if game is not over
      if (newHealth > 0) {
        switchTurns();
      }
    } else {
      setPlayer1(prev => ({
        ...prev,
        health: newHealth,
        effects: {
          ...prev.effects,
          evading: false
        }
      }));
      
      // Process over time effects
      processOverTimeEffects(player2, player1);
      
      // Switch turns if game is not over
      if (newHealth > 0) {
        switchTurns();
      }
    }
    
    // Reset turn timer
    setTurnTimeLeft(20);
  };
  
  // Process effects that happen over time (poison, bleeding, etc.)
  const processOverTimeEffects = (attacker: Player, defender: Player) => {
    // Process poison effect
    if (defender.effects.poisoned > 0) {
      const poisonDamage = 5;
      const newDefenderHealth = Math.max(0, defender.health - poisonDamage);
      const isLastTurn = defender.effects.poisoned === 1;
      
      if (defender === player1) {
        setPlayer1(prev => ({
          ...prev,
          health: newDefenderHealth,
          effects: {
            ...prev.effects,
            poisoned: prev.effects.poisoned - 1
          }
        }));
        
        if (isLastTurn) {
          addLogMessage(`${defender.name}'s poison effect has worn off.`);
        }
      } else {
        setPlayer2(prev => ({
          ...prev,
          health: newDefenderHealth,
          effects: {
            ...prev.effects,
            poisoned: prev.effects.poisoned - 1
          }
        }));
        
        if (isLastTurn) {
          addLogMessage(`${defender.name}'s poison effect has worn off.`);
        }
      }
      
      addLogMessage(`${defender.name} takes ${poisonDamage} poison damage!`);
    }
    
    // Process bleeding effect
    if (defender.effects.bleeding > 0) {
      const bleedDamage = 8;
      const newDefenderHealth = Math.max(0, defender.health - bleedDamage);
      const isLastTurn = defender.effects.bleeding === 1;
      
      if (defender === player1) {
        setPlayer1(prev => ({
          ...prev,
          health: newDefenderHealth,
          effects: {
            ...prev.effects,
            bleeding: prev.effects.bleeding - 1
          }
        }));
        
        if (isLastTurn) {
          addLogMessage(`${defender.name}'s bleeding has stopped.`);
        }
      } else {
        setPlayer2(prev => ({
          ...prev,
          health: newDefenderHealth,
          effects: {
            ...prev.effects,
            bleeding: prev.effects.bleeding - 1
          }
        }));
        
        if (isLastTurn) {
          addLogMessage(`${defender.name}'s bleeding has stopped.`);
        }
      }
      
      addLogMessage(`${defender.name} takes ${bleedDamage} bleeding damage!`);
    }
    
    // Process regeneration effect
    if (attacker.effects.regeneration > 0) {
      const regenAmount = 10;
      const newAttackerHealth = Math.min(attacker.maxHealth, attacker.health + regenAmount);
      const isLastTurn = attacker.effects.regeneration === 1;
      
      if (attacker === player1) {
        setPlayer1(prev => ({
          ...prev,
          health: newAttackerHealth,
          effects: {
            ...prev.effects,
            regeneration: prev.effects.regeneration - 1
          }
        }));
        
        if (isLastTurn) {
          addLogMessage(`${attacker.name}'s regeneration effect has faded.`);
        }
      } else {
        setPlayer2(prev => ({
          ...prev,
          health: newAttackerHealth,
          effects: {
            ...prev.effects,
            regeneration: prev.effects.regeneration - 1
          }
        }));
        
        if (isLastTurn) {
          addLogMessage(`${attacker.name}'s regeneration effect has faded.`);
        }
      }
      
      addLogMessage(`${attacker.name} regenerates ${regenAmount} health!`);
    }
    
    // Process summoned creature attacks
    if (attacker.effects.summonedCreature) {
      const summonedDamage = attacker.effects.summonedCreature.damage;
      const newDefenderHealth = Math.max(0, defender.health - summonedDamage);
      const turnsLeft = attacker.effects.summonedCreature.turnsLeft - 1;
      const isLastTurn = turnsLeft === 0;
      
      if (defender === player1) {
        setPlayer1(prev => ({
          ...prev,
          health: newDefenderHealth
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          health: newDefenderHealth
        }));
      }
      
      // Update summoned creature turns left
      if (attacker === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            summonedCreature: turnsLeft > 0 
              ? { ...prev.effects.summonedCreature!, turnsLeft } 
              : null
          }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            summonedCreature: turnsLeft > 0 
              ? { ...prev.effects.summonedCreature!, turnsLeft } 
              : null
          }
        }));
      }
      
      addLogMessage(`${attacker.name}'s summoned creature attacks for ${summonedDamage} damage!`);
      
      if (isLastTurn) {
        addLogMessage(`${attacker.name}'s summoned creature disappears!`);
      }
    }
    
    // Process confusion effect
    if (defender.effects.confused && defender.effects.confusionDuration > 0) {
      const isLastTurn = defender.effects.confusionDuration === 1;
      
      if (defender === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            confusionDuration: prev.effects.confusionDuration - 1,
            confused: prev.effects.confusionDuration > 1
          }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            confusionDuration: prev.effects.confusionDuration - 1,
            confused: prev.effects.confusionDuration > 1
          }
        }));
      }
      
      if (isLastTurn) {
        addLogMessage(`${defender.name} is no longer confused.`);
      }
    }
    
    // Process sleep effect
    if (defender.effects.sleeping && defender.effects.sleepDuration > 0) {
      const isLastTurn = defender.effects.sleepDuration === 1;
      
      if (defender === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            sleepDuration: prev.effects.sleepDuration - 1,
            sleeping: prev.effects.sleepDuration > 1
          }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            sleepDuration: prev.effects.sleepDuration - 1,
            sleeping: prev.effects.sleepDuration > 1
          }
        }));
      }
      
      if (isLastTurn) {
        addLogMessage(`${defender.name} wakes up.`);
      }
    }
    
    // Process slow effect
    if (defender.effects.slowed && defender.effects.slowDuration > 0) {
      const isLastTurn = defender.effects.slowDuration === 1;
      
      if (defender === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            slowDuration: prev.effects.slowDuration - 1,
            slowed: prev.effects.slowDuration > 1
          }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            slowDuration: prev.effects.slowDuration - 1,
            slowed: prev.effects.slowDuration > 1
          }
        }));
      }
      
      if (isLastTurn) {
        addLogMessage(`${defender.name} is no longer slowed.`);
      }
    }
    
    // Process reflect damage effect
    if (attacker.effects.reflectDamage > 0 && attacker.effects.reflectDuration > 0) {
      const isLastTurn = attacker.effects.reflectDuration === 1;
      
      if (attacker === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            reflectDuration: prev.effects.reflectDuration - 1,
            reflectDamage: prev.effects.reflectDuration > 1 ? prev.effects.reflectDamage : 0
          }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            reflectDuration: prev.effects.reflectDuration - 1,
            reflectDamage: prev.effects.reflectDuration > 1 ? prev.effects.reflectDamage : 0
          }
        }));
      }
      
      if (isLastTurn) {
        addLogMessage(`${attacker.name}'s damage reflection has worn off.`);
      }
    }
    
    // Process mark effect
    if (defender.effects.marked && defender.effects.markDuration > 0) {
      const isLastTurn = defender.effects.markDuration === 1;
      
      if (defender === player1) {
        setPlayer1(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            markDuration: prev.effects.markDuration - 1,
            marked: prev.effects.markDuration > 1,
            markDamageIncrease: prev.effects.markDuration > 1 ? prev.effects.markDamageIncrease : 0
          }
        }));
      } else {
        setPlayer2(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            markDuration: prev.effects.markDuration - 1,
            marked: prev.effects.markDuration > 1,
            markDamageIncrease: prev.effects.markDuration > 1 ? prev.effects.markDamageIncrease : 0
          }
        }));
      }
      
      if (isLastTurn) {
        addLogMessage(`${defender.name} is no longer marked.`);
      }
    }
  };

  // Handle ability usage
  const handleAbilityUse = (playerNum: 1 | 2, abilityIndex: number) => {
    if (gameOver) return;
    
    const player = playerNum === 1 ? player1 : player2;
    const opponent = playerNum === 1 ? player2 : player1;
    const setPlayer = playerNum === 1 ? setPlayer1 : setPlayer2;
    const setOpponent = playerNum === 1 ? setPlayer2 : setPlayer1;
    
    // Check if it's the player's turn
    if (!player.isActive) {
      toast({
        title: "Not your turn!",
        description: "Wait for your turn to use abilities.",
        variant: "destructive"
      });
      return;
    }
    
    const ability = player.abilities[abilityIndex];
    
    // Check if ability is on cooldown
    if ((ability.currentCooldown || 0) > 0) {
      toast({
        title: "Ability on cooldown!",
        description: `${ability.name} will be available in ${ability.currentCooldown} turns.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if player has enough mana
    if (ability.manaCost && player.mana < ability.manaCost) {
      toast({
        title: "Not enough mana!",
        description: `${ability.name} requires ${ability.manaCost} mana, but you only have ${player.mana}.`,
        variant: "destructive"
      });
      return;
    }
    
    // Deduct mana if ability has a cost
    if (ability.manaCost) {
      setPlayer(prev => ({
        ...prev,
        mana: Math.max(0, prev.mana - ability.manaCost)
      }));
      
      // Add log message about mana usage
      addLogMessage(`${player.name} spends ${ability.manaCost} mana to use ${ability.name}.`);
    }
    
    // Apply ability effects
    handleSpecialAbility(player, opponent, setPlayer, setOpponent, ability);
    
    // Set ability on cooldown
    setPlayer(prev => {
      const updatedAbilities = [...prev.abilities];
      updatedAbilities[abilityIndex] = { 
        ...updatedAbilities[abilityIndex], 
        currentCooldown: ability.cooldown 
      };
      return { ...prev, abilities: updatedAbilities };
    });
    
    // End turn after using ability
    switchTurns();
    // Reset turn timer
    setTurnTimeLeft(20);
  };
  
  // Handle special ability effects based on name
  const handleSpecialAbility = (
    player: Player,
    opponent: Player,
    setPlayer: React.Dispatch<React.SetStateAction<Player>>,
    setOpponent: React.Dispatch<React.SetStateAction<Player>>,
    ability: Ability
  ) => {
    let damage;
    let fireballMin;
    let fireballMax;
    let fireballDamage;
    let drainDamage;
    let falconDamage;
    let cripplingDamage;
    
    // Calculate effect duration as half of cooldown (rounded up)
    const calculateEffectDuration = (cooldown: number) => Math.ceil(cooldown / 2);
    
    // Apply the effect with the calculated duration
    const effectDuration = calculateEffectDuration(ability.cooldown);
    
    switch(ability.name) {
      // Knight abilities
      case 'Shield Wall':
        applyShieldEffect(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} uses Shield Wall, reducing damage by 50% for ${effectDuration} turns!`);
        break;
      case 'Heavy Strike':
        applyAttackBoost(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} prepares a Heavy Strike with 50% more attack for ${effectDuration} turns!`);
        break;
      case 'Rally':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} uses Rally, healing for 15 health!`);
        break;
        
      // Archer abilities  
      case 'Quick Shot':
        // Deal two attacks at once
        const quickShot1 = calculateAttackDamage(player.attackMin, player.attackMax);
        const quickShot2 = calculateAttackDamage(player.attackMin, player.attackMax);
        const quickShotTotal = quickShot1 + quickShot2;
        
        dealDamage(quickShotTotal, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Quick Shot, hitting twice for ${quickShotTotal} total damage!`);
        break;
      case 'Poison Arrow':
        applyPoison(opponent, setOpponent, calculateEffectDuration(ability.cooldown), addLogMessage, 
          `${player.name} fires a Poison Arrow, causing damage over ${calculateEffectDuration(ability.cooldown)} turns!`);
        break;
      case 'Evasion':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} uses Evasion, gaining 50% chance to dodge for ${calculateEffectDuration(ability.cooldown)} turns!`);
        break;
        
      // Mage abilities
      case 'Fireball':
        fireballMin = 20;
        fireballMax = 30;
        fireballDamage = Math.floor(Math.random() * (fireballMax - fireballMin + 1)) + fireballMin;
        dealDamage(fireballDamage, opponent, setOpponent, addLogMessage, `${player.name} casts Fireball for ${fireballDamage} damage!`);
        break;
      case 'Arcane Shield':
        applyShieldEffect(player, setPlayer, 100, effectDuration, addLogMessage, 
          `${player.name} casts Arcane Shield, blocking attacks for ${effectDuration} turns!`);
        break;
      case 'Healing Potion':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} drinks a Healing Potion, restoring 20 health!`);
        break;

      // Special abilities for other classes  
      case 'Soul Drain':
        drainDamage = Math.floor(Math.random() * 6) + 10; // 10-15 damage
        dealDamage(drainDamage, opponent, setOpponent, addLogMessage, `${player.name} drains ${drainDamage} health from ${opponent.name}!`);
        applyHeal(player, setPlayer, drainDamage, addLogMessage, `${player.name} heals for ${drainDamage} health!`);
        break;
        
      case 'Summon Skeleton':
        applySummonedCreature(player, setPlayer, 8, calculateEffectDuration(ability.cooldown), addLogMessage, 
          `${player.name} summons a skeleton to fight for ${calculateEffectDuration(ability.cooldown)} turns!`);
        break;
        
      case 'Entangling Roots':
        applyStunEffect(opponent, setOpponent, addLogMessage, 
          `${player.name} casts Entangling Roots, immobilizing ${opponent.name} for ${calculateEffectDuration(ability.cooldown)} turns!`);
        break;
        
      case 'Rejuvenation':
        applyRegeneration(player, setPlayer, calculateEffectDuration(ability.cooldown), addLogMessage, 
          `${player.name} casts Rejuvenation, healing over ${calculateEffectDuration(ability.cooldown)} turns!`);
        break;
        
      // Barbarian abilities
      case 'Rage':
        applyAttackBoost(player, setPlayer, 70, effectDuration, addLogMessage, 
          `${player.name} enters a Rage, increasing attack by 70% for ${effectDuration} turns!`);
        // Apply attack reduction to self (defense penalty)
        applyAttackReduction(player, setPlayer, 30, effectDuration, addLogMessage, 
          `${player.name} becomes reckless, reducing defense by 30%!`);
        break;
      case 'Whirlwind':
        // Deal two attacks at 80% damage each
        const whirlwind1 = Math.floor(calculateAttackDamage(player.attackMin, player.attackMax) * 0.8);
        const whirlwind2 = Math.floor(calculateAttackDamage(player.attackMin, player.attackMax) * 0.8);
        const whirlwindTotal = whirlwind1 + whirlwind2;
        
        dealDamage(whirlwindTotal, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Whirlwind, striking twice for ${whirlwindTotal} total damage!`);
        break;
      case 'Intimidate':
        applyAttackReduction(opponent, setOpponent, 40, effectDuration, addLogMessage, 
          `${player.name} intimidates ${opponent.name}, reducing their attack by 40% for ${effectDuration} turns!`);
        break;
        
      // Paladin abilities
      case 'Divine Smite':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} calls down Divine Smite for ${damage} damage!`);
        break;
      case 'Lay on Hands':
        applyHeal(player, setPlayer, 25, addLogMessage, `${player.name} uses Lay on Hands, healing for 25 health!`);
        break;
      case 'Divine Shield':
        applyShieldEffect(player, setPlayer, 75, effectDuration, addLogMessage, 
          `${player.name} casts Divine Shield, reducing damage by 75% for ${effectDuration} turns!`);
        break;
        
      // Sellsword abilities
      case 'Weapon Mastery':
        applyAttackBoost(player, setPlayer, 40, effectDuration, addLogMessage, 
          `${player.name} switches combat style, gaining 40% attack boost for ${effectDuration} turns!`);
        break;
      case 'Parry':
        applyShieldEffect(player, setPlayer, 100, 1, addLogMessage, 
          `${player.name} prepares to Parry the next attack!`);
        break;
      case 'War Cry':
        applyAttackReduction(opponent, setOpponent, 25, effectDuration, addLogMessage, 
          `${player.name} lets out a War Cry, reducing ${opponent.name}'s attack by 25% for ${effectDuration} turns!`);
        break;
        
      // Warlord abilities
      case 'Command Strike':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Command Strike for ${damage} damage!`);
        applyAttackBoost(player, setPlayer, 20, 1, addLogMessage, `${player.name} gains tactical advantage for next turn!`);
        break;
      case 'Battle Tactics':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} studies the opponent, gaining 70% chance to dodge next attack!`);
        break;
      case 'Rally Troops':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} rallies troops, healing for 20 health!`);
        applyAttackBoost(player, setPlayer, 10, 1, addLogMessage, `${player.name} gains +10 attack for next turn!`);
        break;
        
      // Gladiator abilities
      case 'Crowd Pleaser':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} performs a Crowd Pleaser for ${damage} damage!`);
        break;
      case 'Net Throw':
        applyStunEffect(opponent, setOpponent, addLogMessage, 
          `${player.name} throws a net, immobilizing ${opponent.name} for next turn!`);
        break;
      case 'Second Wind':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} catches a Second Wind, healing for 15 health!`);
        // Clear negative effects (implemented as healing message)
        addLogMessage(`${player.name} clears all negative effects!`);
        break;
        
      // Blademaster abilities
      case 'Blade Flurry':
        // Deal three attacks at once
        const bladeFlurry1 = Math.floor(Math.random() * 5) + 8; // 8-12 damage
        const bladeFlurry2 = Math.floor(Math.random() * 5) + 8;
        const bladeFlurry3 = Math.floor(Math.random() * 5) + 8;
        const bladeFlurryTotal = bladeFlurry1 + bladeFlurry2 + bladeFlurry3;
        
        dealDamage(bladeFlurryTotal, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Blade Flurry, striking three times for ${bladeFlurryTotal} total damage!`);
        break;
      case 'Perfect Stance':
        applyShieldEffect(player, setPlayer, 40, 2, addLogMessage, 
          `${player.name} enters Perfect Stance, reducing damage by 40% for 2 turns!`);
        break;
      case 'Vital Strike':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Vital Strike for ${damage} damage!`);
        break;
        
      // Spearman abilities
      case 'Thrust':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Thrust for ${damage} damage!`);
        break;
      case 'Phalanx':
        applyShieldEffect(player, setPlayer, 60, 1, addLogMessage, 
          `${player.name} forms a Phalanx, reducing damage by 60% for 1 turn!`);
        break;
      case 'Spear Wall':
        applyShieldEffect(player, setPlayer, 100, 1, addLogMessage, 
          `${player.name} forms a Spear Wall, ready to counter the next attack!`);
        break;
        
      // Duelist abilities
      case 'Riposte':
        applyShieldEffect(player, setPlayer, 150, 1, addLogMessage, 
          `${player.name} prepares to Riposte the next attack with 150% damage!`);
        break;
      case 'Feint':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} uses Feint, gaining 80% chance to dodge and counter!`);
        break;
      case 'Precise Strike':
        damage = calculateAttackDamage(player.attackMin, player.attackMax) * 2;
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Precise Strike for ${damage} damage!`);
        break;
        
      // Crossbowman abilities
      case 'Heavy Bolt':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} fires a Heavy Bolt for ${damage} damage!`);
        break;
      case 'Piercing Shot':
        damage = calculateAttackDamage(player.attackMin, player.attackMax);
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Piercing Shot for ${damage} damage!`);
        addLogMessage(`${player.name}'s shot ignores 50% of enemy shield!`);
        break;
      case 'Rapid Reload':
        reduceAllCooldowns(player, setPlayer, 1, addLogMessage, 
          `${player.name} performs Rapid Reload, reducing all cooldowns by 1 turn!`);
        break;
        
      // Falconer abilities
      case 'Falcon Strike':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name}'s falcon strikes for ${damage} damage!`);
        break;
      case 'Hunting Tactics':
        applyAttackBoost(player, setPlayer, 50, 1, addLogMessage, 
          `${player.name} marks the target, gaining 50% attack for next turn!`);
        break;
      case 'Nature\'s Eye':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} uses Nature's Eye, gaining 80% evasion for next attack!`);
        break;
        
      // Marksman abilities
      case 'Aimed Shot':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} takes an Aimed Shot for ${damage} damage!`);
        break;
      case 'Crippling Shot':
        applyAttackReduction(opponent, setOpponent, 30, 2, addLogMessage, 
          `${player.name} uses Crippling Shot, reducing ${opponent.name}'s attack by 30% for 2 turns!`);
        break;
      case 'Camouflage':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} uses Camouflage, gaining 90% evasion for next attack!`);
        break;
        
      // Sorcerer abilities
      case 'Mana Explosion':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Mana Explosion for ${damage} damage!`);
        dealDamage(10, player, setPlayer, addLogMessage, `${player.name} takes 10 damage from the explosion!`);
        break;
      case 'Arcane Missiles':
        damage = Math.floor(Math.random() * 4) + 7; // 7-10 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} fires an Arcane Missile for ${damage} damage!`);
        setTimeout(() => {
          const damage2 = Math.floor(Math.random() * 4) + 7;
          dealDamage(damage2, opponent, setOpponent, addLogMessage, `${player.name} fires a second Arcane Missile for ${damage2} damage!`);
        }, 200);
        setTimeout(() => {
          const damage3 = Math.floor(Math.random() * 4) + 7;
          dealDamage(damage3, opponent, setOpponent, addLogMessage, `${player.name} fires a third Arcane Missile for ${damage3} damage!`);
        }, 400);
        break;
      case 'Mana Shield':
        applyShieldEffect(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} casts Mana Shield, converting 50% of damage to mana drain for ${effectDuration} turns!`);
        break;
        
      // Cleric abilities
      case 'Divine Healing':
        applyHeal(player, setPlayer, 30, addLogMessage, `${player.name} casts Divine Healing, restoring 30 health!`);
        break;
      case 'Holy Smite':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Holy Smite for ${damage} damage!`);
        break;
      case 'Blessed Armor':
        applyShieldEffect(player, setPlayer, 65, 2, addLogMessage, 
          `${player.name} casts Blessed Armor, reducing damage by 65% for 2 turns!`);
        break;
        
      // Warlock abilities
      case 'Shadow Bolt':
        damage = Math.floor(Math.random() * 7) + 18; // 18-24 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Shadow Bolt for ${damage} damage!`);
        break;
      case 'Life Tap':
        convertHealthToMana(player, setPlayer, 10, 25, addLogMessage, 
          `${player.name} sacrifices 10 health to gain 25 mana!`);
        break;
      case 'Summon Imp':
        applySummonedCreature(player, setPlayer, 8, calculateEffectDuration(ability.cooldown), addLogMessage, 
          `${player.name} summons an imp to fight for ${calculateEffectDuration(ability.cooldown)} turns!`);
        break;
        
      // Battlemage abilities
      case 'Spell Blade':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Spell Blade for ${damage} damage!`);
        break;
      case 'Mana Surge':
        applyAttackBoost(player, setPlayer, 70, 1, addLogMessage, 
          `${player.name} channels Mana Surge, increasing attack by 70% for next turn!`);
        break;
      case 'Arcane Armor':
        applyShieldEffect(player, setPlayer, 60, 2, addLogMessage, 
          `${player.name} casts Arcane Armor, reducing damage by 60% for 2 turns!`);
        break;
        
      // Templar abilities
      case 'Holy Strike':
        damage = 15;
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Holy Strike for ${damage} damage!`);
        // Stun chance would need special implementation
        if (Math.random() < 0.3) {
          applyStunEffect(opponent, setOpponent, addLogMessage, `${player.name}'s Holy Strike stuns ${opponent.name}!`);
        }
        break;
      case 'Sacred Barrier':
        applyShieldEffect(player, setPlayer, 75, 1, addLogMessage, 
          `${player.name} casts Sacred Barrier, reducing damage by 75% for 1 turn!`);
        break;
      case 'Righteous Fury':
        applyAttackBoost(player, setPlayer, 40, 3, addLogMessage, 
          `${player.name} channels Righteous Fury, increasing attack by 40% for 3 turns!`);
        break;
        
      // Alchemist abilities
      case 'Poison Brew':
        damage = Math.floor(Math.random() * 6) + 8; // 8-13 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} throws Poison Brew for ${damage} damage!`);
        applyPoison(opponent, setOpponent, 3, addLogMessage, `${player.name}'s poison deals damage over 3 turns!`);
        break;
      case 'Healing Elixir':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 healing
        applyHeal(player, setPlayer, damage, addLogMessage, `${player.name} drinks Healing Elixir, restoring ${damage} health!`);
        break;
      case 'Smoke Bomb':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} throws a Smoke Bomb, gaining 70% evasion for 2 turns!`);
        break;
        
      // Assassin abilities
      case 'Backstab':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Backstab for ${damage} damage!`);
        break;
      case 'Poison Blade':
        applyPoison(opponent, setOpponent, 3, addLogMessage, 
          `${player.name} applies Poison Blade, dealing damage over 3 turns!`);
        break;
      case 'Smoke Bomb':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} uses Smoke Bomb, gaining 75% evasion for next attack!`);
        break;
        
      // Berserker abilities
      case 'Reckless Strike':
        damage = Math.floor(Math.random() * 16) + 25; // 25-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Reckless Strike for ${damage} damage!`);
        dealDamage(5, player, setPlayer, addLogMessage, `${player.name} takes 5 damage from the reckless attack!`);
        break;
      case 'Battle Roar':
        applyAttackBoost(player, setPlayer, 50, 2, addLogMessage, 
          `${player.name} lets out a Battle Roar, increasing attack by 50% for 2 turns!`);
        break;
      case 'Bloodlust':
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Bloodlust for ${damage} damage!`);
        applyRegeneration(player, setPlayer, 2, addLogMessage, `${player.name} gains regeneration for 2 turns!`);
        break;
        
      // Soulfire Warlock abilities
      case 'Soul Incineration':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Soul Incineration for ${damage} damage!`);
        dealDamage(10, player, setPlayer, addLogMessage, `${player.name} takes 10 damage from soul flames!`);
        break;
      case 'Life Exchange':
        convertHealthToMana(player, setPlayer, 15, 35, addLogMessage, 
          `${player.name} sacrifices 15 health to gain 35 mana!`);
        break;
      case 'Eternal Flames':
        applyPoison(opponent, setOpponent, 3, addLogMessage, 
          `${player.name} sets ${opponent.name} ablaze with Eternal Flames for 3 turns!`);
        break;
        
      // Shadowblade abilities
      case 'Shadow Step':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Shadow Step for ${damage} damage!`);
        break;
      case 'Death Mark':
        applyMarkTarget(opponent, setOpponent, 50, 2, addLogMessage, 
          `${player.name} marks the target for 50% increased damage for 2 turns!`);
        break;
      case 'Vanish':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} vanishes, gaining 90% evasion for next attack!`);
        break;
        
      // Thief abilities
      case 'Pickpocket':
        stealMana(opponent, setOpponent, 15, addLogMessage, 
          `${player.name} steals 15 mana from ${opponent.name}!`);
        gainMana(player, setPlayer, 15, addLogMessage, 
          `${player.name} gains 15 mana!`);
        break;
      case 'Disable Trap':
        removeAllNegativeEffects(player, setPlayer, addLogMessage, 
          `${player.name} removes all negative effects!`);
        break;
      case 'Smoke Screen':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} creates a smoke screen, gaining 80% evasion for next attack!`);
        break;
        
      // Ninja abilities
      case 'Shuriken Storm':
        // Throw 4 shurikens at once
        const damage1 = Math.floor(Math.random() * 3) + 6; // 6-8 damage
        const damage2 = Math.floor(Math.random() * 3) + 6;
        const damage3 = Math.floor(Math.random() * 3) + 6;
        const damage4 = Math.floor(Math.random() * 3) + 6;
        const totalDamage = damage1 + damage2 + damage3 + damage4;
        
        dealDamage(totalDamage, opponent, setOpponent, addLogMessage, 
          `${player.name} throws 4 shurikens for ${totalDamage} total damage!`);
        break;
      case 'Stealth':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} becomes invisible, gaining 90% evasion for next attack!`);
        break;
      case 'Assassinate':
        if (opponent.health < opponent.maxHealth * 0.5) {
          damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
          dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} assassinates for ${damage} damage!`);
        } else {
          addLogMessage(`${player.name} attempts to assassinate but target is too healthy!`);
        }
        break;
        
      // Rogue abilities
      case 'Cheap Shot':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Cheap Shot for ${damage} damage!`);
        applyStunEffect(opponent, setOpponent, addLogMessage, `${player.name} stuns ${opponent.name} for 1 turn!`);
        break;
      case 'Dirty Fighting':
        applyAttackReduction(opponent, setOpponent, 35, 2, addLogMessage, 
          `${player.name} uses Dirty Fighting, reducing ${opponent.name}'s attack by 35% for 2 turns!`);
        break;
      case 'Escape Artist':
        removeAllNegativeEffects(player, setPlayer, addLogMessage, 
          `${player.name} removes all negative effects!`);
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} gains 50% evasion!`);
        break;
        
      // Guardian abilities
      case 'Guardian\'s Shield':
        applyShieldEffect(player, setPlayer, 80, 2, addLogMessage, 
          `${player.name} uses Guardian's Shield, reducing damage by 80% for 2 turns!`);
        break;
      case 'Taunt':
        applyAttackReduction(opponent, setOpponent, 25, 1, addLogMessage, 
          `${player.name} taunts ${opponent.name}, reducing their attack by 25% for 1 turn!`);
        break;
      case 'Last Stand':
        if (player.health < player.maxHealth * 0.25) {
          applyAttackBoost(player, setPlayer, 100, 1, addLogMessage, 
            `${player.name} enters Last Stand, gaining 100% attack boost!`);
        }
        break;
        
      // Sentinel abilities
      case 'Counter Strike':
        applyShieldEffect(player, setPlayer, 100, 1, addLogMessage, 
          `${player.name} prepares to Counter Strike the next attack!`);
        break;
      case 'Defensive Stance':
        applyShieldEffect(player, setPlayer, 60, effectDuration, addLogMessage, 
          `${player.name} enters Defensive Stance, reducing damage by 60% for ${effectDuration} turns!`);
        applyAttackBoost(player, setPlayer, 30, effectDuration, addLogMessage, 
          `${player.name} gains 30% attack boost for ${effectDuration} turns!`);
        break;
      case 'Protect Ally':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} protects ally and heals for 15 health!`);
        applyShieldEffect(player, setPlayer, 50, 1, addLogMessage, 
          `${player.name} gains 50% shield for 1 turn!`);
        break;
        
      // Ironclad abilities
      case 'Iron Will':
        applyShieldEffect(player, setPlayer, 100, 1, addLogMessage, 
          `${player.name} uses Iron Will, becoming immune to all damage for 1 turn!`);
        break;
      case 'Heavy Armor':
        applyShieldEffect(player, setPlayer, 70, 3, addLogMessage, 
          `${player.name} dons Heavy Armor, reducing damage by 70% for 3 turns!`);
        break;
      case 'Unbreakable':
        applyHeal(player, setPlayer, 25, addLogMessage, `${player.name} becomes Unbreakable, healing for 25 health!`);
        removeAllNegativeEffects(player, setPlayer, addLogMessage, 
          `${player.name} clears all negative effects!`);
        break;
        
      // Ranger abilities
      case 'Call Wolf':
        applySummonedCreature(player, setPlayer, 10, 3, addLogMessage, 
          `${player.name} calls a wolf to fight for 3 turns!`);
        break;
      case 'Tracking Shot':
        damage = Math.floor(Math.random() * 8) + 18; // 18-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Tracking Shot for ${damage} damage!`);
        applyMarkTarget(opponent, setOpponent, 30, 1, addLogMessage, `${player.name} marks the target for 30% increased damage!`);
        break;
      case 'Survival Instincts':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} uses Survival Instincts, gaining 60% evasion for next attack!`);
        applyAttackBoost(player, setPlayer, 20, 2, addLogMessage, `${player.name} gains 20% attack boost for 2 turns!`);
        break;
        
      // Sniper abilities
      case 'Precision Shot':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} takes a Precision Shot for ${damage} damage!`);
        break;
      case 'Overwatch':
        applyAttackBoost(player, setPlayer, 100, 2, addLogMessage, 
          `${player.name} sets up Overwatch, gaining 100% attack boost for 2 turns!`);
        break;
      case 'Kill Shot':
        if (opponent.health < opponent.maxHealth * 0.3) {
          damage = Math.floor(Math.random() * 11) + 40; // 40-50 damage
          dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Kill Shot for ${damage} damage!`);
        } else {
          addLogMessage(`${player.name} attempts Kill Shot but target is too healthy!`);
        }
        break;
        
      // Beastmaster abilities
      case 'Summon Bear':
        applySummonedCreature(player, setPlayer, 15, 3, addLogMessage, 
          `${player.name} summons a bear to fight for 3 turns!`);
        break;
      case 'Pack Tactics':
        applyAttackBoost(player, setPlayer, 50, 2, addLogMessage, 
          `${player.name} uses Pack Tactics, gaining 50% attack boost for 2 turns!`);
        break;
      case 'Wild Command':
        applyAttackReduction(opponent, setOpponent, 40, effectDuration, addLogMessage, 
          `${player.name} uses Wild Command, intimidating ${opponent.name} and reducing their attack by 40% for ${effectDuration} turns!`);
        break;
        
      // Pyromancer abilities
      case 'Inferno':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Inferno for ${damage} damage!`);
        applyPoison(opponent, setOpponent, 3, addLogMessage, `${player.name}'s fire burns for 5 damage per turn!`);
        break;
      case 'Fire Shield':
        applyShieldEffect(player, setPlayer, 100, effectDuration, addLogMessage, 
          `${player.name} creates a Fire Shield that deals 10 damage to attackers for ${effectDuration} turns!`);
        break;
      case 'Meteor Strike':
        damage = Math.floor(Math.random() * 11) + 35; // 35-45 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} calls down a Meteor Strike for ${damage} damage!`);
        break;
        
      // Cryomancer abilities
      case 'Frost Bolt':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Frost Bolt for ${damage} damage!`);
        applyStunEffect(opponent, setOpponent, addLogMessage, `${player.name} freezes ${opponent.name} for 1 turn!`);
        break;
      case 'Ice Armor':
        applyShieldEffect(player, setPlayer, 65, 2, addLogMessage, 
          `${player.name} creates Ice Armor, reducing damage by 65% for 2 turns!`);
        break;
      case 'Blizzard':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Blizzard for ${damage} damage!`);
        applySlow(opponent, setOpponent, 2, addLogMessage, `${player.name} slows ${opponent.name} for 2 turns!`);
        break;
        
      // Stormcaller abilities
      case 'Lightning Bolt':
        applyChainLightning(opponent, setOpponent, Math.floor(Math.random() * 6) + 20, 0.3, addLogMessage, 
          `${player.name} casts Lightning Bolt!`);
        break;
      case 'Thunder Clap':
        damage = 15;
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Thunder Clap for ${damage} damage!`);
        applyStunEffect(opponent, setOpponent, addLogMessage, `${player.name} stuns ${opponent.name} for 1 turn!`);
        break;
      case 'Storm Surge':
        applyAttackBoost(player, setPlayer, 100, 2, addLogMessage, 
          `${player.name} channels Storm Surge, increasing attack by 100% for 2 turns!`);
        break;
        
      // Earthshaker abilities
      case 'Earthquake':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} causes an Earthquake for ${damage} damage!`);
        applyAttackReduction(opponent, setOpponent, 30, 2, addLogMessage, 
          `${player.name} reduces ${opponent.name}'s attack by 30% for 2 turns!`);
        break;
      case 'Stone Skin':
        applyShieldEffect(player, setPlayer, 75, effectDuration, addLogMessage, 
          `${player.name} transforms skin to stone, reducing damage by 75% for ${effectDuration} turns!`);
        break;
      case 'Rock Throw':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} hurls a massive rock for ${damage} damage!`);
        break;
        
      // Bard abilities
      case 'Inspire':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} inspires, healing for 20 health!`);
        applyAttackBoost(player, setPlayer, 30, 2, addLogMessage, `${player.name} gains 30% attack boost for 2 turns!`);
        break;
      case 'Lullaby':
        applySleep(opponent, setOpponent, 1, addLogMessage, 
          `${player.name} sings a Lullaby, putting ${opponent.name} to sleep for 1 turn!`);
        break;
      case 'Battle Song':
        applyAttackBoost(player, setPlayer, 25, 2, addLogMessage, 
          `${player.name} sings a Battle Song, increasing attack by 25% for 2 turns!`);
        break;
        
      // Enchanter abilities
      case 'Charm':
        applyConfusion(opponent, setOpponent, 1, addLogMessage, 
          `${player.name} charms ${opponent.name}, confusing them for 1 turn!`);
        break;
      case 'Magic Weapon':
        applyAttackBoost(player, setPlayer, 50, 2, addLogMessage, 
          `${player.name} enchants weapon for 50% increased attack for 2 turns!`);
        break;
      case 'Mirror Image':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} creates a Mirror Image, gaining 100% evasion for next attack!`);
        break;
        
      // Illusionist abilities
      case 'Phantom Strike':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Phantom Strike for ${damage} damage!`);
        break;
      case 'Confuse':
        applyConfusion(opponent, setOpponent, 2, addLogMessage, 
          `${player.name} confuses ${opponent.name}, 50% chance they attack themselves!`);
        break;
      case 'Invisibility':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} becomes invisible, guaranteed dodge for 2 turns!`);
        break;
        
      // Axemaster abilities
      case 'Cleave':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Cleave for ${damage} damage!`);
        applyPoison(opponent, setOpponent, 3, addLogMessage, `${player.name}'s attack causes bleeding for 5 damage per turn!`);
        break;
      case 'Berserker Rage':
        applyAttackBoost(player, setPlayer, 80, effectDuration, addLogMessage, 
          `${player.name} enters Berserker Rage, increasing attack by 80% for ${effectDuration} turns!`);
        applyAttackReduction(player, setPlayer, 30, effectDuration, addLogMessage, 
          `${player.name} becomes reckless, reducing defense by 30%!`);
        break;
      case 'Executioner':
        if (opponent.health < opponent.maxHealth * 0.4) {
          damage = Math.floor(Math.random() * 11) + 40; // 40-50 damage
          dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} executes for ${damage} damage!`);
        } else {
          addLogMessage(`${player.name} attempts execution but target is too healthy!`);
        }
        break;
        
      // Hammerlord abilities
      case 'Crushing Blow':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Crushing Blow for ${damage} damage!`);
        applyStunEffect(opponent, setOpponent, addLogMessage, `${player.name} stuns ${opponent.name} for 1 turn!`);
        break;
      case 'Ground Slam':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Ground Slam for ${damage} damage!`);
        applyAttackReduction(opponent, setOpponent, 25, 2, addLogMessage, `${player.name} slows ${opponent.name} for 2 turns!`);
        break;
      case 'Hammer Time':
        applyAttackBoost(player, setPlayer, 50, 2, addLogMessage, 
          `${player.name} enters Hammer Time, increasing attack by 50% for 2 turns!`);
        break;
        
      // Swordsman abilities
      case 'Swift Strike':
        // Deal two attacks at once
        const swiftStrike1 = Math.floor(Math.random() * 5) + 8; // 8-12 damage
        const swiftStrike2 = Math.floor(Math.random() * 5) + 8;
        const swiftStrikeTotal = swiftStrike1 + swiftStrike2;
        
        dealDamage(swiftStrikeTotal, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Swift Strike, hitting twice for ${swiftStrikeTotal} total damage!`);
        break;
      case 'Defensive Stance':
        applyShieldEffect(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} enters Defensive Stance, reducing damage by 50% for ${effectDuration} turns!`);
        addLogMessage(`${player.name} prepares to counter for 15 damage!`);
        break;
      case 'Perfect Form':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Perfect Form for ${damage} damage!`);
        break;
        
      // Noble abilities
      case 'Noble Strike':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Noble Strike for ${damage} damage!`);
        break;
      case 'Royal Guard':
        applyShieldEffect(player, setPlayer, 100, 2, addLogMessage, 
          `${player.name} summons a Royal Guard that protects for 2 turns!`);
        break;
      case 'Command Authority':
        applyAttackReduction(opponent, setOpponent, 30, effectDuration, addLogMessage, 
          `${player.name} uses Command Authority, intimidating ${opponent.name} and reducing their attack by 30% for ${effectDuration} turns!`);
        break;
        
      // Champion abilities
      case 'Champion\'s Strike':
        damage = Math.floor(Math.random() * 6) + 25; // 25-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Champion's Strike for ${damage} damage!`);
        applyAttackBoost(player, setPlayer, 20, 1, addLogMessage, `${player.name} gains 20% attack boost for next turn!`);
        break;
      case 'Victory Pose':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} strikes a Victory Pose, healing for 15 health!`);
        applyEvasion(player, setPlayer, addLogMessage, `${player.name} gains 30% evasion for next attack!`);
        break;
      case 'Glory Seeker':
        if (player.health < player.maxHealth * 0.5) {
          applyAttackBoost(player, setPlayer, 40, 1, addLogMessage, 
            `${player.name} becomes a Glory Seeker, increasing attack by 40%!`);
        }
        break;
        
      // KnightCommander abilities
      case 'Tactical Strike':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Tactical Strike for ${damage} damage!`);
        applyAttackBoost(player, setPlayer, 20, 1, addLogMessage, `${player.name} gains tactical advantage for next turn!`);
        break;
      case 'Battle Formation':
        applyShieldEffect(player, setPlayer, 60, effectDuration, addLogMessage, 
          `${player.name} forms Battle Formation, increasing defense by 60% for ${effectDuration} turns!`);
        applyAttackBoost(player, setPlayer, 20, effectDuration, addLogMessage, 
          `${player.name} increases attack by 20% for ${effectDuration} turns!`);
        break;
      case 'Rally the Troops':
        applyHeal(player, setPlayer, 25, addLogMessage, `${player.name} rallies the troops, healing for 25 health!`);
        break;
        
      // Timekeeper abilities
      case 'Time Warp':
        skipNextTurn(opponent, setOpponent, addLogMessage, 
          `${player.name} uses Time Warp, skipping ${opponent.name}'s next turn!`);
        break;
      case 'Haste':
        // This would need special implementation for double turns
        addLogMessage(`${player.name} uses Haste, gaining extra speed!`);
        applyAttackBoost(player, setPlayer, 30, 2, addLogMessage, 
          `${player.name} gains 30% attack boost for 2 turns!`);
        break;
      case 'Temporal Shield':
        applyShieldEffect(player, setPlayer, 100, 1, addLogMessage, 
          `${player.name} creates a Temporal Shield that blocks all damage for 1 turn!`);
        break;
        
      // Voidwalker abilities
      case 'Void Strike':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Void Strike for ${damage} damage!`);
        addLogMessage(`${player.name} teleports behind ${opponent.name}!`);
        break;
      case 'Void Shield':
        applyShieldEffect(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} creates a Void Shield that absorbs 50% of damage for ${effectDuration} turns!`);
        break;
      case 'Dimensional Rift':
        skipNextTurn(opponent, setOpponent, addLogMessage, 
          `${player.name} opens a Dimensional Rift, banishing ${opponent.name} for 1 turn!`);
        break;
        
      // Chaosweaver abilities
      case 'Chaos Bolt':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Chaos Bolt for ${damage} damage!`);
        addLogMessage(`${player.name}'s Chaos Bolt has random additional effects!`);
        break;
      case 'Reality Warp':
        swapStats(player, setPlayer, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Reality Warp, swapping stats with ${opponent.name}!`);
        break;
      case 'Entropy Field':
        addLogMessage(`${player.name} creates an Entropy Field that deals 10 damage per turn to both players!`);
        dealDamage(10, player, setPlayer, addLogMessage, `${player.name} takes 10 damage from entropy!`);
        dealDamage(10, opponent, setOpponent, addLogMessage, `${opponent.name} takes 10 damage from entropy!`);
        break;
        
      // Dreamweaver abilities
      case 'Nightmare':
        applyStunEffect(opponent, setOpponent, addLogMessage, 
          `${player.name} casts Nightmare, putting ${opponent.name} to sleep!`);
        applyPoison(opponent, setOpponent, 3, addLogMessage, `${player.name}'s nightmare deals 15 damage per turn!`);
        break;
      case 'Dream Shield':
        applyReflectDamage(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} creates a Dream Shield that reflects 50% of damage for ${effectDuration} turns!`);
        break;
      case 'Lucid Dreaming':
        applyConfusion(opponent, setOpponent, 1, addLogMessage, 
          `${player.name} uses Lucid Dreaming, confusing ${opponent.name} for 1 turn!`);
        break;
        
      // Jester abilities
      case 'Juggle':
        applyConfusion(opponent, setOpponent, 1, addLogMessage, 
          `${player.name} juggles, confusing ${opponent.name} for 1 turn!`);
        break;
      case 'Comedy':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} performs comedy, healing for 15 health!`);
        applyConfusion(opponent, setOpponent, 1, addLogMessage, 
          `${player.name} confuses ${opponent.name} for 1 turn!`);
        break;
      case 'Final Act':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} performs Final Act for ${damage} damage!`);
        if (Math.random() < 0.5) {
          applyStunEffect(opponent, setOpponent, addLogMessage, `${player.name}'s Final Act stuns ${opponent.name}!`);
        }
        break;
        
      // Dancer abilities
      case 'Dance of Blades':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} performs Dance of Blades for ${damage} damage!`);
        break;
      case 'Graceful Dodge':
        applyEvasion(player, setPlayer, addLogMessage, 
          `${player.name} dances away, gaining 90% evasion for next attack!`);
        break;
      case 'Performance':
        applyAttackBoost(player, setPlayer, 40, 2, addLogMessage, 
          `${player.name} performs, inspiring self and gaining 40% attack boost for 2 turns!`);
        break;
        
      // Musician abilities
      case 'Sonic Boom':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} creates a Sonic Boom for ${damage} damage!`);
        break;
      case 'Healing Melody':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} plays a Healing Melody, restoring 20 health!`);
        removeAllNegativeEffects(player, setPlayer, addLogMessage, 
          `${player.name} removes all negative effects!`);
        break;
      case 'Battle Anthem':
        applyDamageBoost(player, setPlayer, 30, 3, addLogMessage, 
          `${player.name} plays a Battle Anthem, increasing all stats by 30% for 3 turns!`);
        break;
        
      // Blacksmith abilities
      case 'Forge Strike':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Forge Strike for ${damage} damage!`);
        break;
      case 'Repair Armor':
        applyHeal(player, setPlayer, 25, addLogMessage, `${player.name} repairs armor, healing for 25 health!`);
        applyShieldEffect(player, setPlayer, 40, 1, addLogMessage, `${player.name} increases defense by 40%!`);
        break;
      case 'Masterwork':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} creates a Masterwork weapon for ${damage} damage!`);
        break;
        
      // Artificer abilities
      case 'Magical Device':
        applySummonedCreature(player, setPlayer, 15, 2, addLogMessage, 
          `${player.name} deploys a Magical Device that attacks for 2 turns!`);
        break;
      case 'Enchant Weapon':
        applyDamageBoost(player, setPlayer, 50, 3, addLogMessage, 
          `${player.name} enchants weapon for 50% increased damage for 3 turns!`);
        break;
      case 'Disenchant':
        removeAllPositiveEffects(opponent, setOpponent, addLogMessage, 
          `${player.name} uses Disenchant, removing all positive effects from ${opponent.name}!`);
        break;
        
      // Tinkerer abilities
      case 'Clockwork Device':
        applySummonedCreature(player, setPlayer, 10, 3, addLogMessage, 
          `${player.name} deploys a Clockwork Device that attacks for 3 turns!`);
        break;
      case 'Repair':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} repairs, healing for 20 health!`);
        reduceAllCooldowns(player, setPlayer, 1, addLogMessage, 
          `${player.name} reduces all cooldowns by 1 turn!`);
        break;
      case 'Overcharge':
        applyDamageBoost(player, setPlayer, 100, effectDuration, addLogMessage, 
          `${player.name} overcharges, increasing damage by 100% for ${effectDuration} turns!`);
        dealDamage(10, player, setPlayer, addLogMessage, `${player.name} takes 10 damage from overcharge!`);
        break;
        
      default:
        addLogMessage(`${player.name} uses ${ability.name}!`);
        break;
    }
  };

  // Computer AI logic
  const computerTurn = () => {
    console.log('computerTurn called, gameOver:', gameOver);
    if (gameOver) return;
    
    // Clear any existing computer move timer
    if (computerMoveTimer.current) {
      clearTimeout(computerMoveTimer.current);
    }
    
    // Add a small delay to make it seem like the computer is thinking
    computerMoveTimer.current = setTimeout(() => {
      const computerPlayer = player1.isActive && player1.isComputer ? player1 : 
                            player2.isActive && player2.isComputer ? player2 : null;
      
      console.log('Computer player found:', computerPlayer?.name);
      if (!computerPlayer) return;
      
      // Check if there's an ability not on cooldown and has enough mana
      const availableAbilities = computerPlayer.abilities
        .map((ability, index) => ({ ability, index }))
        .filter(({ ability }) => 
          (!ability.currentCooldown || ability.currentCooldown <= 0) && 
          (!ability.manaCost || computerPlayer.mana >= ability.manaCost)
        );
      
      console.log('Available abilities for computer:', availableAbilities.length);
      
      // Simple AI - use abilities if available, otherwise basic attack
      if (availableAbilities.length > 0 && Math.random() > 0.3) { // 70% chance to use ability if available
        // Pick a random available ability
        const randomIndex = Math.floor(Math.random() * availableAbilities.length);
        const { index } = availableAbilities[randomIndex];
        
        console.log('Computer using ability:', availableAbilities[randomIndex].ability.name);
        // Use the ability
        handleAbilityUse(computerPlayer === player1 ? 1 : 2, index);
      } else {
        console.log('Computer using basic attack');
        // Basic attack
        handleAttack();
      }
    }, 1000); // 1 second delay
  };

  // Switch turns between players
  const switchTurns = () => {
    console.log('switchTurns called');
    
    // Determine which player is currently active and switch to the other
    const currentlyActive = player1.isActive ? 1 : 2;
    const nextActive = currentlyActive === 1 ? 2 : 1;
    
    console.log('Switching turns:', { currentlyActive, nextActive });
    
    // Reduce ability cooldowns and handle effects duration for the players
    setPlayer1(prev => {
      if (prev.isActive) {
        // Player 1 is currently active, make them inactive
        return { ...prev, isActive: false };
      } else {
        // Player 1 is becoming active
        // Reduce cooldowns for the player who's becoming active
        const updatedAbilities = prev.abilities.map(ability => ({
          ...ability,
          currentCooldown: ability.currentCooldown && ability.currentCooldown > 0 
            ? ability.currentCooldown - 1 
            : 0
        }));
        
        // Update effects duration - reduce effect durations by 1 turn
        const updatedEffects = { ...prev.effects };
        
        // Reduce shield effect duration
        if (updatedEffects.shieldDuration > 0) {
          updatedEffects.shieldDuration = Math.max(0, updatedEffects.shieldDuration - 1);
          if (updatedEffects.shieldDuration === 0) {
            updatedEffects.shield = 0;
            addLogMessage(`${prev.name}'s shield effect has worn off.`);
          }
        }
        
        // Reduce damage boost effect duration
        if (updatedEffects.damageBoostDuration > 0) {
          updatedEffects.damageBoostDuration = Math.max(0, updatedEffects.damageBoostDuration - 1);
          if (updatedEffects.damageBoostDuration === 0) {
            updatedEffects.damageBoost = 0;
            addLogMessage(`${prev.name}'s damage boost has worn off.`);
          }
        }
        
        // Reduce attack reduction effect duration
        if (updatedEffects.attackReductionDuration > 0) {
          updatedEffects.attackReductionDuration = Math.max(0, updatedEffects.attackReductionDuration - 1);
          if (updatedEffects.attackReductionDuration === 0) {
            updatedEffects.attackReduction = 0;
            addLogMessage(`${prev.name}'s attack reduction has worn off.`);
          }
        }
        
        // Regenerate mana when player becomes active (15 mana per turn)
        const manaRegen = 15;
        const newMana = Math.min(prev.maxMana, prev.mana + manaRegen);
        if (newMana > prev.mana) {
          addLogMessage(`${prev.name} regenerates ${manaRegen} mana.`);
        }
        
        return { 
          ...prev, 
          isActive: true,
          abilities: updatedAbilities,
          effects: updatedEffects,
          mana: newMana
        };
      }
    });
    
    setPlayer2(prev => {
      if (prev.isActive) {
        // Player 2 is currently active, make them inactive
        return { ...prev, isActive: false };
      } else {
        // Player 2 is becoming active
        // Reduce cooldowns for the player who's becoming active
        const updatedAbilities = prev.abilities.map(ability => ({
          ...ability,
          currentCooldown: ability.currentCooldown && ability.currentCooldown > 0 
            ? ability.currentCooldown - 1 
            : 0
        }));
        
        // Update effects duration - reduce effect durations by 1 turn
        const updatedEffects = { ...prev.effects };
        
        // Reduce shield effect duration
        if (updatedEffects.shieldDuration > 0) {
          updatedEffects.shieldDuration = Math.max(0, updatedEffects.shieldDuration - 1);
          if (updatedEffects.shieldDuration === 0) {
            updatedEffects.shield = 0;
            addLogMessage(`${prev.name}'s shield effect has worn off.`);
          }
        }
        
        // Reduce damage boost effect duration
        if (updatedEffects.damageBoostDuration > 0) {
          updatedEffects.damageBoostDuration = Math.max(0, updatedEffects.damageBoostDuration - 1);
          if (updatedEffects.damageBoostDuration === 0) {
            updatedEffects.damageBoost = 0;
            addLogMessage(`${prev.name}'s damage boost has worn off.`);
          }
        }
        
        // Reduce attack reduction effect duration
        if (updatedEffects.attackReductionDuration > 0) {
          updatedEffects.attackReductionDuration = Math.max(0, updatedEffects.attackReductionDuration - 1);
          if (updatedEffects.attackReductionDuration === 0) {
            updatedEffects.attackReduction = 0;
            addLogMessage(`${prev.name}'s attack reduction has worn off.`);
          }
        }
        
        // Regenerate mana when player becomes active (15 mana per turn)
        const manaRegen = 15;
        const newMana = Math.min(prev.maxMana, prev.mana + manaRegen);
        if (newMana > prev.mana) {
          addLogMessage(`${prev.name} regenerates ${manaRegen} mana.`);
        }
        
        return { 
          ...prev, 
          isActive: true,
          abilities: updatedAbilities,
          effects: updatedEffects,
          mana: newMana
        };
      }
    });
    
    // Reset turn timer
    setTurnTimeLeft(20);
  };
  
  // Timer effect for turn-based gameplay
  useEffect(() => {
    if (turnTimerActive && !gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setTurnTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Time's up, switch turns
            const activePlayer = player1.isActive ? player1 : player2;
            addLogMessage(`${activePlayer.name} took too long! Turn skipped.`);
            switchTurns();
            return 20;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turnTimerActive, gameOver]);

  // Computer player effect
  useEffect(() => {
    console.log('Computer turn effect triggered:', {
      gameOver,
      player1Active: player1.isActive,
      player1Computer: player1.isComputer,
      player2Active: player2.isActive,
      player2Computer: player2.isComputer
    });
    
    if (!gameOver && ((player1.isActive && player1.isComputer) || (player2.isActive && player2.isComputer))) {
      console.log('Starting computer turn');
      computerTurn();
    }
    
    return () => {
      if (computerMoveTimer.current) {
        clearTimeout(computerMoveTimer.current);
      }
    };
  }, [player1.isActive, player2.isActive, gameOver]);
  
  // Check if game is over
  useEffect(() => {
    if (player1.health === 0) {
      setGameOver(true);
      setWinner(player2);
      setTurnTimerActive(false);
      
      // Update game stats
      setGameStats(prev => {
        const updated = {
          wins: prev.wins + (player2.isComputer ? 0 : 1),
          losses: prev.losses + (player2.isComputer ? 1 : 0),
          gamesPlayed: prev.gamesPlayed + 1,
          lastGameResult: player2.name
        };
        
        // Save to localStorage
        localStorage.setItem('duelGameStats', JSON.stringify(updated));
        return updated;
      });
      
    } else if (player2.health === 0) {
      setGameOver(true);
      setWinner(player1);
      setTurnTimerActive(false);
      
      // Update game stats
      setGameStats(prev => {
        const updated = {
          wins: prev.wins + (player1.isComputer ? 0 : 1),
          losses: prev.losses + (player1.isComputer ? 1 : 0),
          gamesPlayed: prev.gamesPlayed + 1,
          lastGameResult: player1.name
        };
        
        // Save to localStorage
        localStorage.setItem('duelGameStats', JSON.stringify(updated));
        return updated;
      });
    }
  }, [player1.health, player2.health, setGameOver, setWinner, setGameStats]);

  return (
    <div>
      <div className="text-white text-center mb-4">DEBUG: BattleArena component rendered</div>
      <BattleArenaUI 
        player1={player1}
        player2={player2}
        gameOver={gameOver}
        winner={winner}
        battleLog={battleLog}
        turnTimeLeft={turnTimeLeft}
        handleAttack={handleAttack}
        handleAbilityUse={handleAbilityUse}
        resetGame={resetGame}
        gameStats={gameStats}
      />
    </div>
  );
};