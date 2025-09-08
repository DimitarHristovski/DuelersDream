import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Ability,
  Player,
  calculateAttackDamage,
  dealDamage,
  applyHeal,
  gainMana,
  convertHealthToMana,
  swapStats,
  applyAttackBoost,
  removeAllNegativeEffects,
  applySummonedCreature,
  applyAttackReduction,
  applyPoison,
  applyBleedingEffect
} from './abilities';
import { BattleArenaUI } from './BattleArenaUI';

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
  resetGame,
}: BattleArenaProps) => {
  const { toast } = useToast();
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(20);
  const [turnTimerActive, setTurnTimerActive] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const computerMoveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setBattleLog([
      `Battle begins! ${player1.name} (${player1.className}) vs ${player2.name} (${player2.className})`,
      `${player1.isActive ? player1.name : player2.name}'s turn to start!`,
    ]);
  }, []);

  const addLogMessage = (message: string) => {
    setBattleLog((prev) => [message, ...prev.slice(0, 9)]);
  };

  const getActiveAndDefender = (): [Player, Player, React.Dispatch<React.SetStateAction<Player>>, React.Dispatch<React.SetStateAction<Player>>] => {
    if (player1.isActive) return [player1, player2, setPlayer1, setPlayer2];
    return [player2, player1, setPlayer2, setPlayer1];
  };

  const handleAttack = () => {
    if (gameOver) return;
    const [attacker, defender, setAttacker, setDefender] = getActiveAndDefender();

    if (attacker.effects.stunned) {
      toast({ title: 'Stunned!', description: 'You are stunned and cannot attack.', variant: 'destructive' });
      return;
    }

    // Check for evasion
    if (defender.effects.evasion > 0) {
      const evasionRoll = Math.random() * 100;
      if (evasionRoll < defender.effects.evasion) {
        addLogMessage(`${defender.name} evades ${attacker.name}'s attack!`);
        
        // Reduce evasion duration
        setDefender(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            evasionDuration: Math.max(0, prev.effects.evasionDuration - 1),
            evasion: prev.effects.evasionDuration <= 1 ? 0 : prev.effects.evasion
          }
        }));
        
        endOfAction(true);
        return;
      }
    }

    const boost = attacker.effects.attackBoost || 0;
    const reduction = defender.effects.attackReduction || 0;
    console.log('Attack calculation:', {
      playerName: attacker.name,
      attackMin: attacker.attackMin,
      attackMax: attacker.attackMax,
      attackBoost: boost,
      attackReduction: reduction,
      effects: attacker.effects
    });
    let damage = calculateAttackDamage(attacker.attackMin, attacker.attackMax, boost, reduction);
    
    // Apply next hit bonus
    if (attacker.effects.nextHitBonus > 0) {
      const bonusDamage = Math.floor(damage * (attacker.effects.nextHitBonus / 100));
      damage += bonusDamage;
      addLogMessage(`${attacker.name} deals ${bonusDamage} bonus damage from enhanced focus!`);
      
      // Remove next hit bonus
      setAttacker(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          nextHitBonus: 0,
          nextHitBonusDuration: 0
        }
      }));
    }
    
    // Apply marked target bonus damage
    if (defender.effects.marked && defender.effects.markDamageIncrease > 0) {
      const markedBonus = Math.floor(damage * (defender.effects.markDamageIncrease / 100));
      damage += markedBonus;
      addLogMessage(`${defender.name} takes ${markedBonus} bonus damage from being marked!`);
    }
    
    const newHealth = Math.max(0, defender.health - damage);

    setDefender((prev) => ({ ...prev, health: newHealth }));
    addLogMessage(`${attacker.name} attacks ${defender.name} for ${damage} damage!`);

    // Counterattack: defender reflects a percentage of damage back to attacker
    const reflectPct = defender.effects.counterAttack || 0;
    if (reflectPct > 0 && damage > 0) {
      const reflected = Math.max(1, Math.floor(damage * reflectPct / 100));
      setAttacker(prev => ({ ...prev, health: Math.max(0, prev.health - reflected) }));
      addLogMessage(`${defender.name} counterattacks for ${reflected} damage!`);
    }

    endOfAction(newHealth > 0);
  };

  const endOfAction = (shouldContinue: boolean) => {
    // Reset turn timer
    setTurnTimeLeft(20);
    if (shouldContinue) switchTurns();
  };

  const switchTurns = () => {
    // Toggle active player, reduce cooldowns for the player becoming active, and regen mana
    setPlayer1((prev) => {
      if (prev.isActive) return { ...prev, isActive: false };
      const updatedAbilities = prev.abilities.map((a) => ({
        ...a,
        currentCooldown: a.currentCooldown && a.currentCooldown > 0 ? a.currentCooldown - 1 : 0,
      }));
      const manaRegen = 5;
      const newMana = Math.min(prev.maxMana, prev.mana + manaRegen);
      if (newMana > prev.mana) addLogMessage(`${prev.name} regenerates ${manaRegen} mana.`);

      // expire temporary attack boost
      const updatedEffects = { ...prev.effects };
      if (updatedEffects.attackBoostDuration > 0) {
        updatedEffects.attackBoostDuration = Math.max(0, updatedEffects.attackBoostDuration - 1);
        if (updatedEffects.attackBoostDuration === 0) {
          updatedEffects.attackBoost = 0;
          addLogMessage(`${prev.name}'s attack boost has worn off.`);
        }
      }

      // expire stun effect
      if (updatedEffects.stunDuration > 0) {
        updatedEffects.stunDuration = Math.max(0, updatedEffects.stunDuration - 1);
        if (updatedEffects.stunDuration === 0) {
          updatedEffects.stunned = false;
          addLogMessage(`${prev.name} is no longer stunned!`);
        }
      }

      // expire attack reduction effect
      if (updatedEffects.attackReductionDuration > 0) {
        updatedEffects.attackReductionDuration = Math.max(0, updatedEffects.attackReductionDuration - 1);
        if (updatedEffects.attackReductionDuration === 0) {
          updatedEffects.attackReduction = 0;
          addLogMessage(`${prev.name}'s attack reduction has worn off.`);
        }
      }

      // expire shield effect
      if (updatedEffects.shieldDuration > 0) {
        updatedEffects.shieldDuration = Math.max(0, updatedEffects.shieldDuration - 1);
        if (updatedEffects.shieldDuration === 0) {
          updatedEffects.shield = 0;
          addLogMessage(`${prev.name}'s shield has worn off.`);
        }
      }

      // expire evasion effect
      if (updatedEffects.evasionDuration > 0) {
        updatedEffects.evasionDuration = Math.max(0, updatedEffects.evasionDuration - 1);
        if (updatedEffects.evasionDuration === 0) {
          updatedEffects.evasion = 0;
          addLogMessage(`${prev.name}'s evasion has worn off.`);
        }
      }

      // expire marked target effect
      if (updatedEffects.markDuration > 0) {
        updatedEffects.markDuration = Math.max(0, updatedEffects.markDuration - 1);
        if (updatedEffects.markDuration === 0) {
          updatedEffects.marked = false;
          updatedEffects.markDamageIncrease = 0;
          addLogMessage(`${prev.name} is no longer marked.`);
        }
      }

      // expire bleeding effect
      if (updatedEffects.bleedDuration > 0) {
        updatedEffects.bleedDuration = Math.max(0, updatedEffects.bleedDuration - 1);
        if (updatedEffects.bleedDuration === 0) {
          updatedEffects.bleeding = 0;
          addLogMessage(`${prev.name} stops bleeding.`);
        }
      }

      // expire weapon enhancement effect
      if (updatedEffects.weaponEnhancementDuration > 0) {
        updatedEffects.weaponEnhancementDuration = Math.max(0, updatedEffects.weaponEnhancementDuration - 1);
        if (updatedEffects.weaponEnhancementDuration === 0) {
          updatedEffects.weaponEnhancement = 0;
          updatedEffects.weaponEnhancementElement = '';
          addLogMessage(`${prev.name}'s weapon enhancement has worn off.`);
        }
      }

      // expire spell damage boost effect
      if (updatedEffects.spellDamageBoostDuration > 0) {
        updatedEffects.spellDamageBoostDuration = Math.max(0, updatedEffects.spellDamageBoostDuration - 1);
        if (updatedEffects.spellDamageBoostDuration === 0) {
          updatedEffects.spellDamageBoost = 0;
          addLogMessage(`${prev.name}'s spell damage boost has worn off.`);
        }
      }

      // expire damage reduction effect
      if (updatedEffects.damageReductionDuration > 0) {
        updatedEffects.damageReductionDuration = Math.max(0, updatedEffects.damageReductionDuration - 1);
        if (updatedEffects.damageReductionDuration === 0) {
          updatedEffects.damageReduction = 0;
          addLogMessage(`${prev.name}'s damage reduction has worn off.`);
        }
      }

      // expire next hit bonus effect
      if (updatedEffects.nextHitBonusDuration > 0) {
        updatedEffects.nextHitBonusDuration = Math.max(0, updatedEffects.nextHitBonusDuration - 1);
        if (updatedEffects.nextHitBonusDuration === 0) {
          updatedEffects.nextHitBonus = 0;
          addLogMessage(`${prev.name}'s next hit bonus has worn off.`);
        }
      }

      // Apply permanent regeneration if present (heals per turn)
      let interimHealth = prev.health;
      if (updatedEffects.regeneration && updatedEffects.regeneration > 0 && prev.health < prev.maxHealth) {
        const healed = Math.min(updatedEffects.regeneration, prev.maxHealth - prev.health);
        interimHealth = prev.health + healed;
        addLogMessage(`${prev.name} regenerates ${healed} health.`);
      }

      // Apply bleeding damage
      if (updatedEffects.bleeding > 0) {
        const bleedDamage = updatedEffects.bleedDamage || 6;
        const newHealth = Math.max(1, interimHealth - bleedDamage);
        addLogMessage(`${prev.name} takes ${bleedDamage} bleeding damage!`);
        return { ...prev, health: newHealth, isActive: true, abilities: updatedAbilities, mana: newMana, effects: updatedEffects };
      }

      // Apply poison damage
      if (updatedEffects.poisoned > 0) {
        const poisonDamage = 8;
        const newHealth = Math.max(1, interimHealth - poisonDamage);
        addLogMessage(`${prev.name} takes ${poisonDamage} poison damage!`);
        return { ...prev, health: newHealth, isActive: true, abilities: updatedAbilities, mana: newMana, effects: updatedEffects };
      }

      return { ...prev, isActive: true, abilities: updatedAbilities, mana: newMana, effects: updatedEffects, health: interimHealth };
    });

    setPlayer2((prev) => {
      if (prev.isActive) return { ...prev, isActive: false };
      const updatedAbilities = prev.abilities.map((a) => ({
        ...a,
        currentCooldown: a.currentCooldown && a.currentCooldown > 0 ? a.currentCooldown - 1 : 0,
      }));
      const manaRegen = 15;
      const newMana = Math.min(prev.maxMana, prev.mana + manaRegen);
      if (newMana > prev.mana) addLogMessage(`${prev.name} regenerates ${manaRegen} mana.`);

      // expire temporary attack boost
      const updatedEffects = { ...prev.effects };
      if (updatedEffects.attackBoostDuration > 0) {
        updatedEffects.attackBoostDuration = Math.max(0, updatedEffects.attackBoostDuration - 1);
        if (updatedEffects.attackBoostDuration === 0) {
          updatedEffects.attackBoost = 0;
          addLogMessage(`${prev.name}'s attack boost has worn off.`);
        }
      }

      // expire stun effect
      if (updatedEffects.stunDuration > 0) {
        updatedEffects.stunDuration = Math.max(0, updatedEffects.stunDuration - 1);
        if (updatedEffects.stunDuration === 0) {
          updatedEffects.stunned = false;
          addLogMessage(`${prev.name} is no longer stunned!`);
        }
      }

      // expire attack reduction effect
      if (updatedEffects.attackReductionDuration > 0) {
        updatedEffects.attackReductionDuration = Math.max(0, updatedEffects.attackReductionDuration - 1);
        if (updatedEffects.attackReductionDuration === 0) {
          updatedEffects.attackReduction = 0;
          addLogMessage(`${prev.name}'s attack reduction has worn off.`);
        }
      }

      // expire shield effect
      if (updatedEffects.shieldDuration > 0) {
        updatedEffects.shieldDuration = Math.max(0, updatedEffects.shieldDuration - 1);
        if (updatedEffects.shieldDuration === 0) {
          updatedEffects.shield = 0;
          addLogMessage(`${prev.name}'s shield has worn off.`);
        }
      }

      // expire evasion effect
      if (updatedEffects.evasionDuration > 0) {
        updatedEffects.evasionDuration = Math.max(0, updatedEffects.evasionDuration - 1);
        if (updatedEffects.evasionDuration === 0) {
          updatedEffects.evasion = 0;
          addLogMessage(`${prev.name}'s evasion has worn off.`);
        }
      }

      // expire marked target effect
      if (updatedEffects.markDuration > 0) {
        updatedEffects.markDuration = Math.max(0, updatedEffects.markDuration - 1);
        if (updatedEffects.markDuration === 0) {
          updatedEffects.marked = false;
          updatedEffects.markDamageIncrease = 0;
          updatedEffects.markDuration = 0;
          addLogMessage(`${prev.name} is no longer marked.`);
        }
      }

      // expire bleeding effect
      if (updatedEffects.bleedDuration > 0) {
        updatedEffects.bleedDuration = Math.max(0, updatedEffects.bleedDuration - 1);
        if (updatedEffects.bleedDuration === 0) {
          updatedEffects.bleeding = 0;
          addLogMessage(`${prev.name} stops bleeding.`);
        }
      }

      // expire weapon enhancement effect
      if (updatedEffects.weaponEnhancementDuration > 0) {
        updatedEffects.weaponEnhancementDuration = Math.max(0, updatedEffects.weaponEnhancementDuration - 1);
        if (updatedEffects.weaponEnhancementDuration === 0) {
          updatedEffects.weaponEnhancement = 0;
          updatedEffects.weaponEnhancementElement = '';
          addLogMessage(`${prev.name}'s weapon enhancement has worn off.`);
        }
      }

      // expire spell damage boost effect
      if (updatedEffects.spellDamageBoostDuration > 0) {
        updatedEffects.spellDamageBoostDuration = Math.max(0, updatedEffects.spellDamageBoostDuration - 1);
        if (updatedEffects.spellDamageBoostDuration === 0) {
          updatedEffects.spellDamageBoost = 0;
          addLogMessage(`${prev.name}'s spell damage boost has worn off.`);
        }
      }

      // expire damage reduction effect
      if (updatedEffects.damageReductionDuration > 0) {
        updatedEffects.damageReductionDuration = Math.max(0, updatedEffects.damageReductionDuration - 1);
        if (updatedEffects.damageReductionDuration === 0) {
          updatedEffects.damageReduction = 0;
          addLogMessage(`${prev.name}'s damage reduction has worn off.`);
        }
      }

      // expire next hit bonus effect
      if (updatedEffects.nextHitBonusDuration > 0) {
        updatedEffects.nextHitBonusDuration = Math.max(0, updatedEffects.nextHitBonusDuration - 1);
        if (updatedEffects.nextHitBonusDuration === 0) {
          updatedEffects.nextHitBonus = 0;
          addLogMessage(`${prev.name}'s next hit bonus has worn off.`);
        }
      }

      // Apply permanent regeneration if present (heals per turn)
      let interimHealth = prev.health;
      if (updatedEffects.regeneration && updatedEffects.regeneration > 0 && prev.health < prev.maxHealth) {
        const healed = Math.min(updatedEffects.regeneration, prev.maxHealth - prev.health);
        interimHealth = prev.health + healed;
        addLogMessage(`${prev.name} regenerates ${healed} health.`);
      }

      // Apply bleeding damage
      if (updatedEffects.bleeding > 0) {
        const bleedDamage = updatedEffects.bleedDamage || 6;
        const newHealth = Math.max(1, interimHealth - bleedDamage);
        addLogMessage(`${prev.name} takes ${bleedDamage} bleeding damage!`);
        return { ...prev, health: newHealth, isActive: true, abilities: updatedAbilities, mana: newMana, effects: updatedEffects };
      }

      // Apply poison damage
      if (updatedEffects.poisoned > 0) {
        const poisonDamage = 8;
        const newHealth = Math.max(1, interimHealth - poisonDamage);
        addLogMessage(`${prev.name} takes ${poisonDamage} poison damage!`);
        return { ...prev, health: newHealth, isActive: true, abilities: updatedAbilities, mana: newMana, effects: updatedEffects };
      }

      return { ...prev, isActive: true, abilities: updatedAbilities, mana: newMana, effects: updatedEffects, health: interimHealth };
    });
  };

  const handleAbilityUse = (playerNum: 1 | 2, abilityIndex: number) => {
    if (gameOver) return;

    const player = playerNum === 1 ? player1 : player2;
    const opponent = playerNum === 1 ? player2 : player1;
    const setPlayer = playerNum === 1 ? setPlayer1 : setPlayer2;
    const setOpponent = playerNum === 1 ? setPlayer2 : setPlayer1;

    if (!player.isActive) {
      toast({ title: 'Not your turn!', description: 'Wait for your turn to use abilities.', variant: 'destructive' });
      return;
    }

    if (player.effects.stunned) {
      toast({ title: 'Stunned!', description: 'You are stunned and cannot use abilities.', variant: 'destructive' });
      return;
    }

    const ability = player.abilities[abilityIndex];

    if ((ability.currentCooldown || 0) > 0) {
      toast({
        title: 'Ability on cooldown!',
        description: `${ability.name} will be available in ${ability.currentCooldown} turns.`,
        variant: 'destructive',
      });
      return;
    }

    if (ability.manaCost && player.mana < ability.manaCost) {
      toast({
        title: 'Not enough mana!',
        description: `${ability.name} requires ${ability.manaCost} mana, but you only have ${player.mana}.`,
        variant: 'destructive',
      });
      return;
    }

    // Spend mana
    if (ability.manaCost) {
      setPlayer((prev) => ({ ...prev, mana: Math.max(0, prev.mana - ability.manaCost!) }));
      addLogMessage(`${player.name} spends ${ability.manaCost} mana to use ${ability.name}.`);
    }

    // Apply the ability effect
    const continueBattle = applyAbilityByDescription(player, opponent, setPlayer, setOpponent, ability);

    // Put ability on cooldown
    setPlayer((prev) => {
      const updated = [...prev.abilities];
      updated[abilityIndex] = { ...updated[abilityIndex], currentCooldown: ability.cooldown };
      return { ...prev, abilities: updated };
    });

    endOfAction(continueBattle);
  };

  // Timer for turn-based gameplay
  useEffect(() => {
    if (turnTimerActive && !gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTurnTimeLeft((prev) => {
          if (prev <= 1) {
            const activePlayer = player1.isActive ? player1 : player2;
            addLogMessage(`${activePlayer.name} took too long! Turn skipped.`);
            switchTurns();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turnTimerActive, gameOver]);

  // Computer AI
  const computerTurn = () => {
    if (gameOver) return;
    if (computerMoveTimer.current) clearTimeout(computerMoveTimer.current);
    computerMoveTimer.current = setTimeout(() => {
      const computerPlayer = player1.isActive && player1.isComputer ? player1 : player2.isActive && player2.isComputer ? player2 : null;
      if (!computerPlayer) return;

      const availableAbilities = computerPlayer.abilities
        .map((ability, index) => ({ ability, index }))
        .filter(({ ability }) => (!ability.currentCooldown || ability.currentCooldown <= 0) && (!ability.manaCost || computerPlayer.mana >= ability.manaCost));

      if (availableAbilities.length > 0 && Math.random() > 0.3) {
        const randomIndex = Math.floor(Math.random() * availableAbilities.length);
        const { index } = availableAbilities[randomIndex];
        handleAbilityUse(computerPlayer === player1 ? 1 : 2, index);
      } else {
        handleAttack();
      }
    }, 800);
  };

  useEffect(() => {
    if (!gameOver && ((player1.isActive && player1.isComputer) || (player2.isActive && player2.isComputer))) {
      computerTurn();
    }
    return () => {
      if (computerMoveTimer.current) clearTimeout(computerMoveTimer.current);
    };
  }, [player1.isActive, player2.isActive, gameOver]);

  // Game over and stats
  useEffect(() => {
    if (player1.health === 0 || player2.health === 0) {
      const didP1Die = player1.health === 0;
      const winPlayer = didP1Die ? player2 : player1;
      setGameOver(true);
      setWinner(winPlayer);
      setTurnTimerActive(false);

      setGameStats((prev) => {
        const updated = {
          wins: prev.wins + (winPlayer.isComputer ? 0 : 1),
          losses: prev.losses + (winPlayer.isComputer ? 1 : 0),
          gamesPlayed: prev.gamesPlayed + 1,
          lastGameResult: winPlayer.name,
        };
        localStorage.setItem('duelGameStats', JSON.stringify(updated));
        return updated;
      });
    }
  }, [player1.health, player2.health]);

  const applyAbilityByDescription = (player: Player, opponent: Player, setPlayer: Dispatch<SetStateAction<Player>>, setOpponent: Dispatch<SetStateAction<Player>>, ability: Ability): boolean => {
    const description = ability.description.toLowerCase();
    
    console.log('Ability used:', ability.name, 'Description:', description);

    // Helper: when abilities deal damage, ensure counterattack triggers like basic attacks
    const abilityDealDamage = (rawDamage: number, message: string, onAppliedDamage?: (actualDamage: number) => void) => {
      return dealDamage(
        rawDamage,
        opponent,
        setOpponent,
        addLogMessage,
        message,
        (actual) => {
          // Trigger class counterattack
          if (actual > 0) {
            const reflectPct = opponent.effects.counterAttack || 0;
            if (reflectPct > 0) {
              const reflected = Math.max(1, Math.floor(actual * reflectPct / 100));
              setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - reflected) }));
              addLogMessage(`${opponent.name} counterattacks for ${reflected} damage!`);
            }
          }
          // Allow callers (e.g., vampiric strike) to act on actual applied damage
          if (onAppliedDamage) onAppliedDamage(actual);
        }
      );
    };

    // Permanent regeneration ability (e.g., Rejuvenation permanent)
    if ((description.includes('rejuvenation') && description.includes('permanent')) || (description.includes('permanently') && description.includes('heal') && description.includes('every turn'))) {
      const amtMatch = description.match(/heal\s+(\d+)\s+.*every\s+turn/);
      const amount = amtMatch ? parseInt(amtMatch[1]) : 10;
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          regeneration: amount
        }
      }));
      addLogMessage(`${player.name} gains permanent regeneration (${amount} per turn).`);
      return true;
    }

    // Permanent counter mechanics from ability: counterattack only (no spell reflect)
    if (description.includes('permanently counterattack')) {
      const percMatch = description.match(/(\d+)%/);
      const pct = percMatch ? parseInt(percMatch[1]) : 20;
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          counterAttack: pct
        }
      }));
      addLogMessage(`${player.name} will permanently counter ${pct}% of incoming damage.`);
      return true;
    }
    
    // Universal attack boost parser - handles all attack boost abilities
    if (description.includes('attack boost') || description.includes('increase attack') || (description.includes('gain') && description.includes('attack'))) {
      console.log('Attack boost ability detected:', description);
      
      // Extract damage if present
      const damageMatch = description.match(/deal (\d+) damage/);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1]);
        abilityDealDamage(damage, `${player.name} deals ${damage} damage!`);
      }
      
      // Extract attack boost value
      const boostMatch = description.match(/(\d+)% attack boost/) || 
                        description.match(/increase attack by (\d+)%/) ||
                        description.match(/gain (\d+)% attack/);
      
      // Extract duration
      const turnsMatch = description.match(/for (\d+) turns?/);
      
      if (boostMatch) {
        const boostValue = parseInt(boostMatch[1]);
        const duration = turnsMatch ? parseInt(turnsMatch[1]) : 1; // Default to 2 turns
        
        console.log('Attack boost values:', { boostValue, duration });
        
        applyAttackBoost(player, setPlayer, boostValue, duration, addLogMessage, `${player.name} gains ${boostValue}% attack boost for ${duration} turn${duration > 1 ? 's' : ''}!`);
        
        // If the same ability also increases spell damage, apply it here too
        const spellBoostMatch = description.match(/increase spell damage by (\d+)%/);
        if (spellBoostMatch) {
          const spellBoost = parseInt(spellBoostMatch[1]);
          setPlayer(prev => ({
            ...prev,
            effects: {
              ...prev.effects,
              spellDamageBoost: spellBoost
            }
          }));
          addLogMessage(`${player.name}'s spell damage is increased by ${spellBoost}%.`);
        }

        // If the same ability also restores % health, heal now
        const healPctMatch = description.match(/restore (\d+)% health/);
        if (healPctMatch) {
          const pct = parseInt(healPctMatch[1]);
          const healAmount = Math.max(1, Math.floor(player.maxHealth * (pct / 100)));
          applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} restores ${healAmount} health!`);
        }
        
        // Handle special cases
        if (description.includes('poison')) {
          const poisonMatch = description.match(/apply (\d+) poison/);
          if (poisonMatch) {
            const poisonDamage = parseInt(poisonMatch[1]);
            applyPoison(opponent, setOpponent, 3, addLogMessage, `${opponent.name} is poisoned for ${poisonDamage} damage per turn!`);
          }
        }
        
        if (description.includes('berserker rage')) {
          const selfDamage = 10;
          setPlayer(prev => ({
            ...prev,
            health: Math.max(1, prev.health - selfDamage)
          }));
          addLogMessage(`${player.name} takes ${selfDamage} damage from berserker rage!`);
        }
        
        return opponent.health > 0;
      }
    }
    
    // Shield Bash - Deal 12-18 damage
    if (description.includes('deal 12-18 damage')) {
      const damage = Math.floor(Math.random() * 7) + 12; // 12-18 damage
      abilityDealDamage(damage, `${player.name} uses ${ability.name} and deals ${damage} damage!`);
      return opponent.health > 0;
    }
    
    // Rally - Restore health points
    if (description.includes('restore') && description.includes('health')) {
      const percentMatch = description.match(/(\d+)%/);
      if (percentMatch) {
        const pct = parseInt(percentMatch[1]);
        const healAmount = Math.max(1, Math.floor(player.maxHealth * (pct / 100)));
        applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} uses ${ability.name} and restores ${healAmount} health!`);
      } else {
        const healAmount = parseInt(description.match(/(\d+)/)?.[1] || '15');
        applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} uses ${ability.name} and restores ${healAmount} health!`);
      }
      return true;
    }
    
    // Intimidate - Reduce opponent's attack by percentage
    if (description.includes('reduce opponent') && description.includes('attack by')) {
      const reductionMatch = description.match(/(\d+)%/);
      if (reductionMatch) {
        const reductionValue = parseInt(reductionMatch[1]);
        applyAttackReduction(opponent, setOpponent, reductionValue, 1, addLogMessage, `${player.name} uses ${ability.name} and reduces ${opponent.name}'s attack by ${reductionValue}%!`);
      }
      return true;
    }
    
    // Poison Strike - Apply poison effect
    if (description.includes('poison') && description.includes('damage')) {
      const poisonMatch = description.match(/(\d+)/);
      if (poisonMatch) {
        const poisonDamage = parseInt(poisonMatch[1]);
        applyPoison(opponent, setOpponent, 1, addLogMessage, `${player.name} uses ${ability.name} and poisons ${opponent.name} for ${poisonDamage} damage per turn!`);
      }
      return true;
    }
    
    // Bleeding Strike - Apply bleeding effect
    if (description.includes('bleed') && description.includes('damage')) {
      const bleedMatch = description.match(/(\d+)/);
      if (bleedMatch) {
        const bleedDamage = parseInt(bleedMatch[1]);
        applyBleedingEffect(opponent, setOpponent, 1, addLogMessage, `${player.name} uses ${ability.name} and makes ${opponent.name} bleed for ${bleedDamage} damage per turn!`);
      }
      return true;
    }

    // Life Steal - Deal damage and heal
    if (description.includes('life steal') || (description.includes('steal') && description.includes('health') && description.includes('damage'))) {
      const damageMatch = description.match(/(\d+) damage/);
      const healMatch = description.match(/(\d+) health/);
      if (damageMatch && healMatch) {
        const damage = parseInt(damageMatch[1]);
        const healAmount = parseInt(healMatch[1]);
        abilityDealDamage(damage, `${player.name} uses ${ability.name} and deals ${damage} damage!`);
        applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} steals ${healAmount} health!`);
      }
      return opponent.health > 0;
    }

    // Mana Burn - Deal damage based on opponent's mana
    if (description.includes('mana burn')) {
      const multiplierMatch = description.match(/(\d+)x/);
      if (multiplierMatch) {
        const multiplier = parseInt(multiplierMatch[1]);
        const damage = Math.floor(opponent.mana * multiplier);
        const manaDrain = Math.floor(opponent.mana * 0.3);
        abilityDealDamage(damage, `${player.name} burns ${opponent.name}'s mana for ${damage} damage!`);
        setOpponent(prev => ({ ...prev, mana: Math.max(0, prev.mana - manaDrain) }));
        addLogMessage(`${opponent.name} loses ${manaDrain} mana!`);
      }
      return opponent.health > 0;
    }

    // Execute - Deal massive damage to low health enemies
    if (ability.name.toLowerCase() === 'execute' || (description.includes('instant') && description.includes('kill'))) {
      const thresholdMatch = description.match(/(\d+)%/);
      const damageMatch = description.match(/(\d+)\s*damage/);
      const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 10;
      const damage = damageMatch ? parseInt(damageMatch[1]) : 40;
      const healthPercent = (opponent.health / opponent.maxHealth) * 100;
      
      if (healthPercent <= threshold) {
        setOpponent(prev => ({ ...prev, health: 0 }));
        addLogMessage(`${player.name} executes ${opponent.name} instantly!`);
        return false; // stop turn switching; game over will trigger
      }
      abilityDealDamage(damage, `${player.name} uses Execute and deals ${damage} damage!`);
      return opponent.health > 0;
    }

    // Cleanse - Remove all negative effects and heal
    if (description.includes('cleanse')) {
      const healMatch = description.match(/(\d+) health/);
      if (healMatch) {
        const healAmount = parseInt(healMatch[1]);
        removeAllNegativeEffects(player, setPlayer, addLogMessage, `${player.name} cleanses all negative effects!`);
        applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} heals for ${healAmount} health!`);
      }
      return true;
    }

    // Whirlwind - Deal damage to opponent and self
    if (description.includes('whirlwind')) {
      const damageMatch = description.match(/(\d+) damage/);
      const selfDamageMatch = description.match(/(\d+) self damage/);
      if (damageMatch && selfDamageMatch) {
        const damage = parseInt(damageMatch[1]);
        const selfDamage = parseInt(selfDamageMatch[1]);
        abilityDealDamage(damage, `${player.name} whirlwinds for ${damage} damage!`);
        const newHealth = Math.max(1, player.health - selfDamage);
        setPlayer(prev => ({ ...prev, health: newHealth }));
        addLogMessage(`${player.name} takes ${selfDamage} self damage from whirlwind!`);
      }
      return opponent.health > 0;
    }

    // Vampiric Strike - Deal damage and heal based on actual damage dealt
    if (description.includes('vampiric strike')) {
      const rangeMatch = description.match(/(\d+)-(\d+) damage/);
      const damageMatch = description.match(/(\d+) damage/);
      const healPercentMatch = description.match(/(\d+)% healing/);
      if ((rangeMatch || damageMatch) && healPercentMatch) {
        let damage: number;
        if (rangeMatch) {
          const minD = parseInt(rangeMatch[1]);
          const maxD = parseInt(rangeMatch[2]);
          damage = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
        } else {
          damage = parseInt(damageMatch![1]);
        }
        const healPercent = parseInt(healPercentMatch[1]);
        abilityDealDamage(damage, `${player.name} strikes vampirically for ${damage} damage!`, (actual) => {
          if (actual > 0) {
            const healAmount = Math.max(1, Math.floor(actual * (healPercent / 100)));
            applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} heals for ${healAmount} health!`);
          } else {
            addLogMessage(`${player.name}'s vampiric strike was blocked and heals nothing.`);
          }
        });
      }
      return opponent.health > 0;
    }

    // Mana to Health - Convert mana to health
    if (description.includes('mana') && description.includes('health')) {
      const conversionMatch = description.match(/(\d+) mana/);
      const healthMatch = description.match(/(\d+) health/);
      if (conversionMatch && healthMatch) {
        const manaCost = parseInt(conversionMatch[1]);
        const healthAmount = parseInt(healthMatch[1]);
        if (player.mana >= manaCost) {
          setPlayer(prev => ({ ...prev, mana: Math.max(0, prev.mana - manaCost) }));
          applyHeal(player, setPlayer, healthAmount, addLogMessage, `${player.name} converts ${manaCost} mana into ${healthAmount} health!`);
        } else {
          addLogMessage(`${player.name} doesn't have enough mana for ${ability.name}!`);
        }
      }
      return true;
    }

    // Quick Shot - Three shots; each deals 100%-150% of base damage
    if (description.includes('quick shot') || description.includes('three quick shots')) {
      const boost = player.effects.attackBoost || 0;
      const reduction = opponent.effects.attackReduction || 0;
      const baseDamage = calculateAttackDamage(player.attackMin, player.attackMax, boost, reduction);

      const shot1 = Math.floor(baseDamage * (1 + Math.random() * 0.5));
      abilityDealDamage(shot1, `${player.name} fires first quick shot for ${shot1} damage!`);

      if (opponent.health > 0) {
        const shot2 = Math.floor(baseDamage * (1 + Math.random() * 0.5));
        abilityDealDamage(shot2, `${player.name} fires second quick shot for ${shot2} damage!`);
      }
      if (opponent.health > 0) {
        const shot3 = Math.floor(baseDamage * (1 + Math.random() * 0.5));
        abilityDealDamage(shot3, `${player.name} fires third quick shot for ${shot3} damage!`);
      }
      return opponent.health > 0;
    }






    // Hunter's Mark - Mark target and gain attack boost
    if (description.includes('hunter\'s mark') || description.includes('hunters mark')) {
      const markMatch = description.match(/(\d+)% more damage/);
      const boostMatch = description.match(/(\d+)% attack/);
      if (markMatch && boostMatch) {
        const markDamage = parseInt(markMatch[1]);
        const attackBoost = parseInt(boostMatch[1]);
        
        // Mark the opponent
        setOpponent(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            marked: true,
            markDamageIncrease: markDamage,
            markDuration: 3
          }
        }));
        
        // Boost own attack
        applyAttackBoost(player, setPlayer, attackBoost, 2, addLogMessage, `${player.name} marks ${opponent.name} and gains ${attackBoost}% attack boost!`);
        addLogMessage(`${opponent.name} will take ${markDamage}% more damage for 3 turns!`);
      }
      return true;
    }




    // Mark Target - Mark opponent for increased damage
    if (description.includes('marked target takes') && description.includes('more damage')) {
      const damageMatch = description.match(/(\d+)% more damage/);
      const turnsMatch = description.match(/(\d+) turns/);
      if (damageMatch && turnsMatch) {
        const damageIncrease = parseInt(damageMatch[1]);
        const duration = parseInt(turnsMatch[1]);
        
        setOpponent(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            marked: true,
            markDamageIncrease: damageIncrease,
            markDuration: duration
          }
        }));
        
        addLogMessage(`${player.name} marks ${opponent.name}! They will take ${damageIncrease}% more damage for ${duration} turns!`);
      }
      return true;
    }

   
    // Generic ranged damage handler (e.g., "Deal 20-30 fire damage")
    const rangeDamageMatch = description.match(/deal (\d+)-(\d+).*damage/);
    if (rangeDamageMatch) {
      const minD = parseInt(rangeDamageMatch[1]);
      const maxD = parseInt(rangeDamageMatch[2]);
      let damage = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
      // Apply spell damage boost if active
      if (player.effects.spellDamageBoost && player.effects.spellDamageBoost > 0) {
        const boosted = Math.floor(damage * (1 + player.effects.spellDamageBoost / 100));
        addLogMessage(`${player.name}'s spell is empowered (+${player.effects.spellDamageBoost}%)!`);
        damage = boosted;
      }
      abilityDealDamage(damage, `${player.name} uses ${ability.name} and deals ${damage} damage!`);
      return opponent.health > 0;
    }

    // Generic fixed damage handler (e.g., "Deal 35 damage")
    const fixedDamageMatch = description.match(/deal (\d+) damage/);
    if (fixedDamageMatch) {
      let damage = parseInt(fixedDamageMatch[1]);
      // Apply spell damage boost if active
      if (player.effects.spellDamageBoost && player.effects.spellDamageBoost > 0) {
        const boosted = Math.floor(damage * (1 + player.effects.spellDamageBoost / 100));
        addLogMessage(`${player.name}'s spell is empowered (+${player.effects.spellDamageBoost}%)!`);
        damage = boosted;
      }
      abilityDealDamage(damage, `${player.name} uses ${ability.name} and deals ${damage} damage!`);
      return opponent.health > 0;
    }

    // Mana Surge / Permanent spell damage boost (e.g., "Increase spell damage by 70%")
    if (description.includes('increase spell damage by')) {
      const boostMatch = description.match(/increase spell damage by (\d+)%/);
      if (boostMatch) {
        const spellBoost = parseInt(boostMatch[1]);
        setPlayer(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            spellDamageBoost: spellBoost
          }
        }));
        addLogMessage(`${player.name}'s spell damage is increased by ${spellBoost}% (persistent).`);
      }
      // Also handle inline attack boost in same description if present
      const atkBoostMatch = description.match(/increase attack by (\d+)%/);
      if (atkBoostMatch) {
        const atkBoost = parseInt(atkBoostMatch[1]);
        // Make the attack increase last 2 turns
        applyAttackBoost(player, setPlayer, atkBoost, 2, addLogMessage, `${player.name} gains ${atkBoost}% attack for 2 turns!`);
      }
      // Also handle inline healing: restore N% health
      const healPctMatch = description.match(/restore (\d+)% health/);
      if (healPctMatch) {
        const pct = parseInt(healPctMatch[1]);
        const healAmount = Math.max(1, Math.floor(player.maxHealth * (pct / 100)));
        applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} restores ${healAmount} health!`);
      }
      return true;
    }

    // Default case - just log the ability use
    addLogMessage(`${player.name} uses ${ability.name}!`);
    return true;
  };

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