import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Player, Ability, calculateAttackDamage, 
  applyShieldEffect, applyDamageBoost, applyHeal, 
  applyEvasion, applyPoison, applyStunEffect, 
  applyRegeneration, applyBleedingEffect, applyAttackReduction,
  dealDamage, applySummonedCreature, createDefaultEffects
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
    
    // Base damage calculation with attack reduction
    let damage = calculateAttackDamage(
      attacker.attackMin, 
      attacker.attackMax, 
      attacker.effects.damageBoost,
      defender.effects.attackReduction
    );
    

    
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
        applyDamageBoost(player, setPlayer, 50, effectDuration, addLogMessage, 
          `${player.name} prepares a Heavy Strike with 50% more damage for ${effectDuration} turns!`);
        break;
      case 'Rally':
        applyHeal(player, setPlayer, 15, addLogMessage, `${player.name} uses Rally, healing for 15 health!`);
        break;
        
      // Archer abilities  
      case 'Quick Shot':
        damage = calculateAttackDamage(player.attackMin, player.attackMax);
        dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses Quick Shot, hitting for ${damage} damage!`);
        
        // Deal second attack after a short delay
        setTimeout(() => {
          const damage2 = calculateAttackDamage(player.attackMin, player.attackMax);
          dealDamage(damage2, opponent, setOpponent, addLogMessage, `${player.name}'s Quick Shot hits again for ${damage2} damage!`);
        }, 500);
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