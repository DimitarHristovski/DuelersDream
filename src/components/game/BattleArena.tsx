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
    
    // Calculate effect duration as half of cooldown (rounded up)
    const calculateEffectDuration = (cooldown: number) => Math.ceil(cooldown / 2);
    
    // Apply the effect with the calculated duration
    const effectDuration = calculateEffectDuration(ability.cooldown);
    
    switch(ability.name) {
      // Knight abilities
      case 'Shield Wall':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Shield Wall for ${damage} damage!`);
        break;
      case 'Heavy Strike':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Heavy Strike for ${damage} damage!`);
        break;
      case 'Rally':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} uses Rally, healing for 15 health!`);
        break;
        
      // Archer abilities  
      case 'Quick Shot':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Quick Shot for ${damage} damage!`);
        break;
      case 'Poison Arrow':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} fires a Poison Arrow for ${damage} damage!`);
        break;
      case 'Evasion':
        damage = Math.floor(Math.random() * 11) + 18; // 18-28 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Evasion for ${damage} damage!`);
        break;
        
      // Mage abilities
      case 'Fireball':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Fireball for ${damage} damage!`);
        break;
      case 'Arcane Shield':
        applyHeal(player, setPlayer, 20, addLogMessage, 
          `${player.name} casts Arcane Shield, healing for 20 health!`);
        break;
      case 'Healing Potion':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} drinks a Healing Potion, restoring 20 health!`);
        break;

      // Special abilities for other classes  
      case 'Soul Drain':
        damage = Math.floor(Math.random() * 6) + 10; // 10-15 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} drains ${damage} health from ${opponent.name}!`);
        applyHeal(player, setPlayer, damage, addLogMessage, `${player.name} heals for ${damage} health!`);
        break;
        
      case 'Summon Skeleton':
        damage = Math.floor(Math.random() * 11) + 12; // 12-22 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} summons a skeleton for ${damage} damage!`);
        break;
        
      case 'Entangling Roots':
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} casts Entangling Roots for ${damage} damage!`);
        break;
        
      case 'Rejuvenation':
        applyHeal(player, setPlayer, 25, addLogMessage, `${player.name} casts Rejuvenation, healing for 25 health!`);
        break;
        
      // Barbarian abilities
      case 'Rage':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} enters a Rage for ${damage} damage!`);
        dealDamage(5, player, setPlayer, addLogMessage, 
          `${player.name} takes 5 damage from rage!`);
        break;
      case 'Whirlwind':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Whirlwind for ${damage} damage!`);
        break;
      case 'Intimidate':
        damage = Math.floor(Math.random() * 11) + 8; // 8-18 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} intimidates ${opponent.name} for ${damage} damage!`);
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
        applyHeal(player, setPlayer, 30, addLogMessage, 
          `${player.name} casts Divine Shield, healing for 30 health!`);
        break;
        
      // Sellsword abilities
      case 'Weapon Mastery':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Weapon Mastery for ${damage} damage!`);
        break;
      case 'Parry':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Parry for ${damage} damage!`);
        break;
        break;
      case 'War Cry':
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} lets out a War Cry for ${damage} damage!`);
        break;
        
      // Warlord abilities
      case 'Command Strike':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Command Strike for ${damage} damage!`);
        applyHeal(player, setPlayer, 10, addLogMessage, `${player.name} gains tactical advantage and heals for 10 health!`);
        break;
      case 'Battle Tactics':
        damage = Math.floor(Math.random() * 11) + 22; // 22-32 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} studies the opponent for ${damage} damage!`);
        break;
      case 'Rally Troops':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} rallies troops, healing for 20 health!`);
        applyHeal(player, setPlayer, 10, addLogMessage, `${player.name} gains tactical advantage and heals for 10 health!`);
        break;
        
      // Gladiator abilities
      case 'Crowd Pleaser':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} performs a Crowd Pleaser for ${damage} damage!`);
        break;
      case 'Net Throw':
        damage = Math.floor(Math.random() * 11) + 8; // 8-18 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} throws a net for ${damage} damage!`);
        break;
      case 'Second Wind':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} catches a Second Wind, healing for 15 health!`);
        break;
        
      // Blademaster abilities
      case 'Blade Flurry':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Blade Flurry for ${damage} damage!`);
        break;
      case 'Perfect Stance':
        applyHeal(player, setPlayer, 25, addLogMessage, 
          `${player.name} enters Perfect Stance, healing for 25 health!`);
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
        applyHeal(player, setPlayer, 20, addLogMessage, 
          `${player.name} forms a Phalanx, healing for 20 health!`);
        break;
      case 'Spear Wall':
        applyHeal(player, setPlayer, 30, addLogMessage, 
          `${player.name} forms a Spear Wall, healing for 30 health!`);
        break;
        
      // Duelist abilities
      case 'Riposte':
        damage = Math.floor(Math.random() * 11) + 28; // 28-38 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Riposte for ${damage} damage!`);
        break;
      case 'Feint':
        damage = Math.floor(Math.random() * 11) + 18; // 18-28 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Feint for ${damage} damage!`);
        break;
      case 'Precise Strike':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Precise Strike for ${damage} damage!`);
        break;
        
      // Crossbowman abilities
      case 'Heavy Bolt':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} fires a Heavy Bolt for ${damage} damage!`);
        break;
      case 'Piercing Shot':
        damage = Math.floor(Math.random() * 11) + 18; // 18-28 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Piercing Shot for ${damage} damage!`);
        break;
      case 'Rapid Reload':
        damage = Math.floor(Math.random() * 11) + 12; // 12-22 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} performs Rapid Reload for ${damage} damage!`);
        break;
        
      // Falconer abilities
      case 'Falcon Strike':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name}'s falcon strikes for ${damage} damage!`);
        break;
      case 'Hunting Tactics':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} marks the target for ${damage} damage!`);
        break;
      case 'Nature\'s Eye':
        damage = Math.floor(Math.random() * 11) + 22; // 22-32 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Nature's Eye for ${damage} damage!`);
        break;
        
      // Marksman abilities
      case 'Aimed Shot':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} takes an Aimed Shot for ${damage} damage!`);
        break;
      case 'Crippling Shot':
        damage = Math.floor(Math.random() * 11) + 12; // 12-22 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Crippling Shot for ${damage} damage!`);
        break;
      case 'Camouflage':
        damage = Math.floor(Math.random() * 11) + 18; // 18-28 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Camouflage for ${damage} damage!`);
        break;
        
      // Sorcerer abilities
      case 'Mana Explosion':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Mana Explosion for ${damage} damage!`);
        dealDamage(10, player, setPlayer, addLogMessage, `${player.name} takes 10 damage from the explosion!`);
        break;
      case 'Arcane Missiles':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} fires Arcane Missiles for ${damage} damage!`);
        break;
      case 'Mana Shield':
        applyHeal(player, setPlayer, 25, addLogMessage, 
          `${player.name} casts Mana Shield, healing for 25 health!`);
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
        applyHeal(player, setPlayer, 35, addLogMessage, 
          `${player.name} casts Blessed Armor, healing for 35 health!`);
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
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} summons an imp for ${damage} damage!`);
        break;
        
      // Battlemage abilities
      case 'Spell Blade':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Spell Blade for ${damage} damage!`);
        break;
      case 'Mana Surge':
        damage = Math.floor(Math.random() * 11) + 35; // 35-45 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} channels Mana Surge for ${damage} damage!`);
        break;
      case 'Arcane Armor':
        applyHeal(player, setPlayer, 30, addLogMessage, 
          `${player.name} casts Arcane Armor, healing for 30 health!`);
        break;
        
      // Templar abilities
      case 'Holy Strike':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Holy Strike for ${damage} damage!`);
        break;
      case 'Sacred Barrier':
        applyHeal(player, setPlayer, 40, addLogMessage, 
          `${player.name} casts Sacred Barrier, healing for 40 health!`);
        break;
      case 'Righteous Fury':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} channels Righteous Fury for ${damage} damage!`);
        break;
        
      // Alchemist abilities
      case 'Poison Brew':
        damage = Math.floor(Math.random() * 6) + 8; // 8-13 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} throws Poison Brew for ${damage} damage!`);
        break;
      case 'Healing Elixir':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 healing
        applyHeal(player, setPlayer, damage, addLogMessage, `${player.name} drinks Healing Elixir, restoring ${damage} health!`);
        break;
      case 'Smoke Bomb':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} throws a Smoke Bomb for ${damage} damage!`);
        break;
        
      // Assassin abilities
      case 'Backstab':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Backstab for ${damage} damage!`);
        break;
      case 'Poison Blade':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Poison Blade for ${damage} damage!`);
        break;
      case 'Smoke Bomb':
        damage = Math.floor(Math.random() * 11) + 18; // 18-28 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Smoke Bomb for ${damage} damage!`);
        break;
        
      // Berserker abilities
      case 'Reckless Strike':
        damage = Math.floor(Math.random() * 16) + 25; // 25-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Reckless Strike for ${damage} damage!`);
        dealDamage(5, player, setPlayer, addLogMessage, `${player.name} takes 5 damage from the reckless attack!`);
        break;
      case 'Battle Roar':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} lets out a Battle Roar for ${damage} damage!`);
        break;
      case 'Bloodlust':
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Bloodlust for ${damage} damage!`);
        applyHeal(player, setPlayer, 10, addLogMessage, `${player.name} heals for 10 health!`);
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
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Eternal Flames for ${damage} damage!`);
        break;
        
      // Shadowblade abilities
      case 'Shadow Step':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Shadow Step for ${damage} damage!`);
        break;
      case 'Death Mark':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} marks the target for ${damage} damage!`);
        break;
      case 'Vanish':
        damage = Math.floor(Math.random() * 11) + 22; // 22-32 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} vanishes for ${damage} damage!`);
        break;
        
      // Thief abilities
      case 'Pickpocket':
        stealMana(opponent, setOpponent, 15, addLogMessage, 
          `${player.name} steals 15 mana from ${opponent.name}!`);
        gainMana(player, setPlayer, 15, addLogMessage, 
          `${player.name} gains 15 mana!`);
        break;
      case 'Disable Trap':
        applyHeal(player, setPlayer, 20, addLogMessage, 
          `${player.name} removes negative effects and heals for 20 health!`);
        break;
      case 'Smoke Screen':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} creates a smoke screen for ${damage} damage!`);
        break;
        
      // Ninja abilities
      case 'Shuriken Storm':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} throws shurikens for ${damage} damage!`);
        break;
      case 'Stealth':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} becomes invisible for ${damage} damage!`);
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
        damage = Math.floor(Math.random() * 11) + 8; // 8-18 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} stuns ${opponent.name} for ${damage} damage!`);
        break;
      case 'Dirty Fighting':
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Dirty Fighting for ${damage} damage!`);
        break;
      case 'Escape Artist':
        applyHeal(player, setPlayer, 20, addLogMessage, 
          `${player.name} removes negative effects and heals for 20 health!`);
        break;
        
      // Guardian abilities
      case 'Guardian\'s Shield':
        applyHeal(player, setPlayer, 40, addLogMessage, 
          `${player.name} uses Guardian's Shield, healing for 40 health!`);
        break;
      case 'Taunt':
        damage = Math.floor(Math.random() * 11) + 8; // 8-18 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} taunts ${opponent.name} for ${damage} damage!`);
        break;
      case 'Last Stand':
        if (player.health < player.maxHealth * 0.25) {
          damage = Math.floor(Math.random() * 11) + 50; // 50-60 damage
          dealDamage(damage, opponent, setOpponent, addLogMessage, 
            `${player.name} enters Last Stand for ${damage} damage!`);
        }
        break;
        
      // Sentinel abilities
      case 'Counter Strike':
        damage = Math.floor(Math.random() * 11) + 28; // 28-38 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Counter Strike for ${damage} damage!`);
        break;
      case 'Defensive Stance':
        applyHeal(player, setPlayer, 30, addLogMessage, 
          `${player.name} enters Defensive Stance, healing for 30 health!`);
        break;
      case 'Protect Ally':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} protects ally and heals for 15 health!`);
        applyHeal(player, setPlayer, 25, addLogMessage, 
          `${player.name} gains additional protection and heals for 25 health!`);
        break;
        
      // Ironclad abilities
      case 'Iron Will':
        applyHeal(player, setPlayer, 50, addLogMessage, 
          `${player.name} uses Iron Will, healing for 50 health!`);
        break;
      case 'Heavy Armor':
        applyHeal(player, setPlayer, 35, addLogMessage, 
          `${player.name} dons Heavy Armor, healing for 35 health!`);
        break;
      case 'Unbreakable':
        applyHeal(player, setPlayer, 25, addLogMessage, `${player.name} becomes Unbreakable, healing for 25 health!`);
        break;
        
      // Ranger abilities
      case 'Call Wolf':
        damage = Math.floor(Math.random() * 11) + 18; // 18-28 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} calls a wolf for ${damage} damage!`);
        break;
      case 'Tracking Shot':
        damage = Math.floor(Math.random() * 8) + 18; // 18-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Tracking Shot for ${damage} damage!`);
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} marks the target for ${damage} damage!`);
        break;
      case 'Survival Instincts':
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Survival Instincts for ${damage} damage!`);
        break;
        
      // Sniper abilities
      case 'Precision Shot':
        damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} takes a Precision Shot for ${damage} damage!`);
        break;
      case 'Overwatch':
        damage = Math.floor(Math.random() * 11) + 50; // 50-60 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} sets up Overwatch for ${damage} damage!`);
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
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} summons a bear for ${damage} damage!`);
        break;
      case 'Pack Tactics':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Pack Tactics for ${damage} damage!`);
        break;
      case 'Wild Command':
        damage = Math.floor(Math.random() * 11) + 12; // 12-22 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Wild Command for ${damage} damage!`);
        break;
        
      // Pyromancer abilities
      case 'Inferno':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Inferno for ${damage} damage!`);
        break;
      case 'Fire Shield':
        applyHeal(player, setPlayer, 50, addLogMessage, 
          `${player.name} creates a Fire Shield, healing for 50 health!`);
        break;
      case 'Meteor Strike':
        damage = Math.floor(Math.random() * 11) + 35; // 35-45 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} calls down a Meteor Strike for ${damage} damage!`);
        break;
        
      // Cryomancer abilities
      case 'Frost Bolt':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Frost Bolt for ${damage} damage!`);
        damage = Math.floor(Math.random() * 11) + 8; // 8-18 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} freezes ${opponent.name} for ${damage} damage!`);
        break;
      case 'Ice Armor':
        applyHeal(player, setPlayer, 30, addLogMessage, 
          `${player.name} creates Ice Armor, healing for 30 health!`);
        break;
      case 'Blizzard':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Blizzard for ${damage} damage!`);
        damage = Math.floor(Math.random() * 11) + 8; // 8-18 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} slows ${opponent.name} for ${damage} damage!`);
        break;
        
      // Stormcaller abilities
      case 'Lightning Bolt':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Lightning Bolt for ${damage} damage!`);
        break;
      case 'Thunder Clap':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Thunder Clap for ${damage} damage!`);
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} stuns ${opponent.name} for ${damage} damage!`);
        break;
      case 'Storm Surge':
        damage = Math.floor(Math.random() * 11) + 50; // 50-60 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} channels Storm Surge for ${damage} damage!`);
        break;
        
      // Earthshaker abilities
      case 'Earthquake':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} causes an Earthquake for ${damage} damage!`);
        damage = Math.floor(Math.random() * 11) + 8; // 8-18 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} reduces ${opponent.name}'s attack for ${damage} damage!`);
        break;
      case 'Stone Skin':
        applyHeal(player, setPlayer, 40, addLogMessage, 
          `${player.name} transforms skin to stone, healing for 40 health!`);
        break;
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
        applyAttackReduction(opponent, setOpponent, 50, effectDuration, addLogMessage, 
          `${player.name} sings a Lullaby, reducing ${opponent.name}'s attack by 50% for ${effectDuration} turns!`);
        break;
      case 'Battle Song':
        applyAttackBoost(player, setPlayer, 25, 2, addLogMessage, 
          `${player.name} sings a Battle Song, increasing attack by 25% for 2 turns!`);
        break;
        
      // Enchanter abilities
      case 'Charm':
        applyAttackReduction(opponent, setOpponent, 40, effectDuration, addLogMessage, 
          `${player.name} charms ${opponent.name}, reducing their attack by 40% for ${effectDuration} turns!`);
        break;
      case 'Magic Weapon':
        applyAttackBoost(player, setPlayer, 50, 2, addLogMessage, 
          `${player.name} enchants weapon for 50% increased attack for 2 turns!`);
        break;
      case 'Mirror Image':
        applyAttackBoost(player, setPlayer, 45, effectDuration, addLogMessage, 
          `${player.name} creates a Mirror Image, gaining 45% attack boost for ${effectDuration} turns!`);
        break;
        
      // Illusionist abilities
      case 'Phantom Strike':
        damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Phantom Strike for ${damage} damage!`);
        break;
      case 'Confuse':
        applyAttackReduction(opponent, setOpponent, 45, effectDuration, addLogMessage, 
          `${player.name} confuses ${opponent.name}, reducing their attack by 45% for ${effectDuration} turns!`);
        break;
      case 'Invisibility':
        applyAttackBoost(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} becomes invisible, gaining 50% attack boost for ${effectDuration} turns!`);
        break;
        
      // Axemaster abilities
      case 'Cleave':
        damage = Math.floor(Math.random() * 11) + 25; // 25-35 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Cleave for ${damage} damage!`);
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
        applyAttackReduction(opponent, setOpponent, 40, effectDuration, addLogMessage, 
          `${player.name} stuns ${opponent.name}, reducing their attack by 40% for ${effectDuration} turns!`);
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
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, 
          `${player.name} uses Swift Strike for ${damage} damage!`);
        break;
      case 'Defensive Stance':
        applyShieldEffect(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} enters Defensive Stance, reducing damage by 50% for ${effectDuration} turns!`);
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
        applyAttackBoost(player, setPlayer, 30, effectDuration, addLogMessage, 
          `${player.name} gains 30% attack boost for ${effectDuration} turns!`);
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
        applyAttackReduction(opponent, setOpponent, 60, effectDuration, addLogMessage, 
          `${player.name} uses Time Warp, reducing ${opponent.name}'s attack by 60% for ${effectDuration} turns!`);
        break;
      case 'Haste':
        applyAttackBoost(player, setPlayer, 30, 2, addLogMessage, 
          `${player.name} uses Haste, gaining 30% attack boost for 2 turns!`);
        break;
      case 'Temporal Shield':
        applyShieldEffect(player, setPlayer, 100, 1, addLogMessage, 
          `${player.name} creates a Temporal Shield that blocks all damage for 1 turn!`);
        break;
        
      // Voidwalker abilities
      case 'Void Strike':
        damage = Math.floor(Math.random() * 6) + 20; // 20-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Void Strike for ${damage} damage!`);
        break;
      case 'Void Shield':
        applyShieldEffect(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} creates a Void Shield that absorbs 50% of damage for ${effectDuration} turns!`);
        break;
      case 'Dimensional Rift':
        applyAttackReduction(opponent, setOpponent, 70, effectDuration, addLogMessage, 
          `${player.name} opens a Dimensional Rift, reducing ${opponent.name}'s attack by 70% for ${effectDuration} turns!`);
        break;
        
      // Chaosweaver abilities
      case 'Chaos Bolt':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Chaos Bolt for ${damage} damage!`);
        break;
      case 'Reality Warp':
        convertHealthToMana(player, setPlayer, 15, 30, addLogMessage, 
          `${player.name} uses Reality Warp, converting 15 health to 30 mana!`);
        break;
      case 'Entropy Field':
        damage = Math.floor(Math.random() * 11) + 10; // 10-20 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} creates an Entropy Field for ${damage} damage!`);
        break;
        
      // Dreamweaver abilities
      case 'Nightmare':
        damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} casts Nightmare for ${damage} damage!`);
        applyAttackReduction(opponent, setOpponent, 40, effectDuration, addLogMessage, 
          `${player.name} puts ${opponent.name} to sleep, reducing their attack by 40% for ${effectDuration} turns!`);
        break;
      case 'Dream Shield':
        applyShieldEffect(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} creates a Dream Shield, reducing damage by 50% for ${effectDuration} turns!`);
        break;
      case 'Lucid Dreaming':
        applyAttackReduction(opponent, setOpponent, 35, effectDuration, addLogMessage, 
          `${player.name} uses Lucid Dreaming, confusing ${opponent.name} and reducing their attack by 35% for ${effectDuration} turns!`);
        break;
        
      // Jester abilities
      case 'Juggle':
        applyAttackReduction(opponent, setOpponent, 30, effectDuration, addLogMessage, 
          `${player.name} juggles, confusing ${opponent.name} and reducing their attack by 30% for ${effectDuration} turns!`);
        break;
      case 'Comedy':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} performs comedy, healing for 15 health!`);
        applyAttackReduction(opponent, setOpponent, 25, effectDuration, addLogMessage, 
          `${player.name} confuses ${opponent.name}, reducing their attack by 25% for ${effectDuration} turns!`);
        break;
      case 'Final Act':
        damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} performs Final Act for ${damage} damage!`);
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
        break;
      case 'Battle Anthem':
        applyAttackBoost(player, setPlayer, 30, 3, addLogMessage, 
          `${player.name} plays a Battle Anthem, increasing attack by 30% for 3 turns!`);
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
        applyAttackBoost(player, setPlayer, 35, effectDuration, addLogMessage, 
          `${player.name} deploys a Magical Device, gaining 35% attack for ${effectDuration} turns!`);
        break;
      case 'Enchant Weapon':
        applyAttackBoost(player, setPlayer, 50, 3, addLogMessage, 
          `${player.name} enchants weapon for 50% increased attack for 3 turns!`);
        break;
      case 'Disenchant':
        applyAttackReduction(opponent, setOpponent, 40, effectDuration, addLogMessage, 
          `${player.name} uses Disenchant, reducing ${opponent.name}'s attack by 40% for ${effectDuration} turns!`);
        break;
        
      // Tinkerer abilities
      case 'Clockwork Device':
        applyAttackBoost(player, setPlayer, 30, effectDuration, addLogMessage, 
          `${player.name} deploys a Clockwork Device, gaining 30% attack for ${effectDuration} turns!`);
        break;
      case 'Repair':
        applyHeal(player, setPlayer, 20, addLogMessage, `${player.name} repairs, healing for 20 health!`);
        break;
      case 'Overcharge':
        applyAttackBoost(player, setPlayer, 100, effectDuration, addLogMessage, 
          `${player.name} overcharges, increasing attack by 100% for ${effectDuration} turns!`);
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