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
import { tickRealtimeSecond } from './battle-realtime-tick';

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
  const autoBasicAttackTimer1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoBasicAttackTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const battleTickIndexRef = useRef(0);
  const playersRef = useRef({ p1: player1, p2: player2 });
  playersRef.current = { p1: player1, p2: player2 };

  const [aiThinking, setAiThinking] = useState(false);
  const handleAttackFromRef = useRef<(attackerNum: 1 | 2) => void>(() => {});
  const handleAbilityUseRef = useRef<(playerNum: 1 | 2, abilityIndex: number) => void>(() => {});

  const AUTO_BASIC_ATTACK_MS = 2200;

  const clearAutoBasicAttackTimer = (who: 1 | 2 | 'both') => {
    if (who === 1 || who === 'both') {
      if (autoBasicAttackTimer1.current) {
        clearTimeout(autoBasicAttackTimer1.current);
        autoBasicAttackTimer1.current = null;
      }
    }
    if (who === 2 || who === 'both') {
      if (autoBasicAttackTimer2.current) {
        clearTimeout(autoBasicAttackTimer2.current);
        autoBasicAttackTimer2.current = null;
      }
    }
  };

  const scheduleAutoBasicAttack = (who: 1 | 2) => {
    if (gameOver) return;
    const p = who === 1 ? playersRef.current.p1 : playersRef.current.p2;
    if (p.isComputer) return;
    const ref = who === 1 ? autoBasicAttackTimer1 : autoBasicAttackTimer2;
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => {
      ref.current = null;
      handleAttackFromRef.current(who);
    }, AUTO_BASIC_ATTACK_MS);
  };

  useEffect(() => {
    setBattleLog([
      `Battle begins! ${player1.name} (${player1.className}) vs ${player2.name} (${player2.className})`,
      `Real-time — both fighters act simultaneously.`,
    ]);
  }, []);

  const addLogMessage = (message: string) => {
    setBattleLog((prev) => [message, ...prev.slice(0, 499)]);
  };

  const getAttackerDefender = (
    attackerNum: 1 | 2
  ): [Player, Player, React.Dispatch<React.SetStateAction<Player>>, React.Dispatch<React.SetStateAction<Player>>] => {
    if (attackerNum === 1) return [player1, player2, setPlayer1, setPlayer2];
    return [player2, player1, setPlayer2, setPlayer1];
  };

  const handleAttackFrom = (attackerNum: 1 | 2) => {
    if (gameOver) return;
    clearAutoBasicAttackTimer(attackerNum);
    const [attacker, defender, setAttacker, setDefender] = getAttackerDefender(attackerNum);

    // Cannot attack untargetable target
    if (defender.effects.untargetable && defender.effects.untargetableDuration > 0) {
      addLogMessage(`${defender.name} is untargetable! The attack misses.`);
      scheduleAutoBasicAttack(attackerNum);
      return;
    }

    if (attacker.effects.stunned) {
      toast({ title: 'Stunned!', description: 'You are stunned and cannot attack.', variant: 'destructive' });
      scheduleAutoBasicAttack(attackerNum);
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
        
        scheduleAutoBasicAttack(attackerNum);
        return;
      }
    }

    const boost = attacker.effects.attackBoost || 0;
    const reduction = defender.effects.attackReduction || 0;
    
    // Check for Mutagens passive - parse values from description
    let mutagensBoost = 0;
    const mutagensAbility = attacker.abilities.find(ability => ability.name === "Mutagens");
    if (mutagensAbility) {
      const healthPercent = (attacker.health / attacker.maxHealth) * 100;
      const boostMatch = mutagensAbility.description.match(/increase attack by (\d+)%/i);
      const thresholdMatch = mutagensAbility.description.match(/above (\d+)% health/i);
      const boostPercent = boostMatch ? parseInt(boostMatch[1]) : 100;
      const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 50;
      
      if (healthPercent > threshold) {
        mutagensBoost = boostPercent;
        addLogMessage(`${attacker.name}'s Mutagens provide ${boostPercent}% attack boost!`);
      }
    }
    
    const totalBoost = boost + mutagensBoost;
    let damage = calculateAttackDamage(attacker.attackMin, attacker.attackMax, totalBoost, reduction);
    
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

    // Check for Gods's Wrath passive ability
    if (attacker.abilities.some(ability => ability.name === "Gods's Wrath")) {
      const wrathAbility = attacker.abilities.find(ability => ability.name === "Gods's Wrath");
      if (wrathAbility) {
        // Parse attack boost percentage from description "increase attack by 20%"
        const boostMatch = wrathAbility.description.match(/increase attack by (\d+)%/);
        const boostAmount = boostMatch ? parseInt(boostMatch[1]) : 20; // Default to 20% if parsing fails
        
        const currentAttackBoost = attacker.effects.attackBoost || 0;
        const newAttackBoost = currentAttackBoost + boostAmount; // Stack the parsed amount each time
        setAttacker(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            attackBoost: newAttackBoost,
            attackBoostDuration: Math.max(prev.effects.attackBoostDuration || 0, 999) // Make it last very long
          }
        }));
        addLogMessage(`${attacker.name}'s Gods's Wrath increases attack by ${boostAmount}%! (Total: +${newAttackBoost}%)`);
      }
    }

    // Check for Executioner's Zeal passive - reduce Divine Execution cooldown by 1
    const executionersZealAbility = attacker.abilities.find(ability => ability.name === "Executioner's Zeal");
    if (executionersZealAbility) {
      setAttacker(prev => ({
          ...prev,
        abilities: prev.abilities.map(ability => {
          if (ability.name === "Divine Execution" && ability.currentCooldown > 0) {
            const newCooldown = Math.max(0, ability.currentCooldown - 1);
            addLogMessage(`${attacker.name}'s Executioner's Zeal reduces Divine Execution cooldown by 1s! (${newCooldown}s remaining)`);
            return { ...ability, currentCooldown: newCooldown };
          }
          return ability;
        })
      }));
    }

    scheduleAutoBasicAttack(attackerNum);
  };

  const handleAbilityUse = (playerNum: 1 | 2, abilityIndex: number) => {
    if (gameOver) return;

    const player = playerNum === 1 ? player1 : player2;
    const opponent = playerNum === 1 ? player2 : player1;
    const setPlayer = playerNum === 1 ? setPlayer1 : setPlayer2;
    const setOpponent = playerNum === 1 ? setPlayer2 : setPlayer1;

    if (player.effects.stunned) {
      toast({ title: 'Stunned!', description: 'You are stunned and cannot use abilities.', variant: 'destructive' });
      return;
    }

    const ability = player.abilities[abilityIndex];

    if ((ability.currentCooldown || 0) > 0) {
      const secs = Math.ceil(ability.currentCooldown || 0);
      toast({
        title: 'Ability on cooldown!',
        description: `${ability.name} will be available in ${secs}s.`,
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

    clearAutoBasicAttackTimer(playerNum);

    // Spend mana
    if (ability.manaCost) {
      setPlayer((prev) => ({ ...prev, mana: Math.max(0, prev.mana - ability.manaCost!) }));
      addLogMessage(`${player.name} spends ${ability.manaCost} mana to use ${ability.name}.`);
    }

    // Apply the ability effect
    applyAbilityByDescription(player, opponent, setPlayer, setOpponent, ability);

    // Put ability on cooldown
    setPlayer((prev) => {
      const updated = [...prev.abilities];
      updated[abilityIndex] = { ...updated[abilityIndex], currentCooldown: ability.cooldown };
      return { ...prev, abilities: updated };
    });

    scheduleAutoBasicAttack(playerNum);
  };

  /** Real-time: cooldowns, mana regen, buff durations, DoTs — both fighters every second. */
  useEffect(() => {
    if (gameOver) return;
    const id = window.setInterval(() => {
      battleTickIndexRef.current += 1;
      const { p1, p2 } = playersRef.current;
      const [np1, np2] = tickRealtimeSecond(p1, p2, battleTickIndexRef.current, addLogMessage);
      setPlayer1(np1);
      setPlayer2(np2);
    }, 1000);
    return () => clearInterval(id);
  }, [gameOver]);

  /** Auto basic attack for each human fighter (independent timers). */
  useEffect(() => {
    clearAutoBasicAttackTimer('both');
    if (gameOver) return;
    scheduleAutoBasicAttack(1);
    scheduleAutoBasicAttack(2);
    return () => clearAutoBasicAttackTimer('both');
  }, [gameOver, player1.isComputer, player2.isComputer]);

  /** AI acts on its own interval (simultaneous with human). Skipped when both sides are human. */
  useEffect(() => {
    if (gameOver) return;
    if (!player1.isComputer && !player2.isComputer) return;
    const id = window.setInterval(() => {
      const runAi = (num: 1 | 2, p: Player) => {
        if (!p.isComputer || p.effects.stunned) return;
        setAiThinking(true);
        window.setTimeout(() => setAiThinking(false), 450);
        const availableAbilities = p.abilities
          .map((ability, index) => ({ ability, index }))
          .filter(({ ability }) => {
            const isPassive =
              (ability.cooldown === 0 && ability.manaCost === 0) ||
              ability.name === 'Mutagens' ||
              ability.name === 'Monster Lore' ||
              ability.name === 'Alchemy Mastery' ||
              ability.name === 'Totemic Strength' ||
              ability.name === 'Spirit Endurance' ||
              ability.name === 'Elemental Mastery' ||
              ability.name === 'Mana Overflow' ||
              ability.name === 'Elemental Harmony';
            return (
              !isPassive &&
              (!ability.currentCooldown || ability.currentCooldown <= 0) &&
              (!ability.manaCost || p.mana >= ability.manaCost)
            );
          });
        if (availableAbilities.length > 0 && Math.random() > 0.3) {
          const randomIndex = Math.floor(Math.random() * availableAbilities.length);
          handleAbilityUseRef.current(num, availableAbilities[randomIndex].index);
        } else {
          handleAttackFromRef.current(num);
        }
      };
      const { p1, p2 } = playersRef.current;
      runAi(1, p1);
      runAi(2, p2);
    }, 900);
    return () => clearInterval(id);
  }, [gameOver, player1.isComputer, player2.isComputer]);

  // Game over and stats
  useEffect(() => {
    // Check for Spirit Endurance reincarnation before game over
    if (player1.health === 0) {
      const spiritEnduranceAbility = player1.abilities.find(ability => ability.name === "Spirit Endurance");
      if (spiritEnduranceAbility && (spiritEnduranceAbility.currentCooldown || 0) === 0) {
        // Trigger reincarnation
        const reviveHealth = Math.floor(player1.maxHealth * 1); // Revive with 50% health
        setPlayer1(prev => ({
          ...prev,
          health: reviveHealth,
          effects: {
            ...prev.effects,
            attackBoost: 0, // Reset attack boost
            attackBoostDuration: 0, // Reset attack boost duration
            damageBoost: 0, // Reset damage boost
            spellDamageBoost: 0, // Reset spell damage boost
            spellDamageBoostDuration: 0, // Reset spell damage boost duration
            // Keep other effects like regeneration, poison, etc.
          },
          abilities: prev.abilities.map(ability => 
            ability.name === "Spirit Endurance" 
              ? { ...ability, currentCooldown: ability.cooldown }
              : ability
          )
        }));
        addLogMessage(`${player1.name} is reincarnated by Spirit Endurance with ${reviveHealth} health! All buffs have been reset.`);
        return; // Don't end the game
      }
    }
    
    if (player2.health === 0) {
      const spiritEnduranceAbility = player2.abilities.find(ability => ability.name === "Spirit Endurance");
      if (spiritEnduranceAbility && (spiritEnduranceAbility.currentCooldown || 0) === 0) {
        // Trigger reincarnation
        const reviveHealth = Math.floor(player2.maxHealth * 1); // Revive with 100% health
        setPlayer2(prev => ({
          ...prev,
          health: reviveHealth,
          effects: {
            ...prev.effects,
            attackBoost: 0, // Reset attack boost
            attackBoostDuration: 0, // Reset attack boost duration
            damageBoost: 0, // Reset damage boost
            spellDamageBoost: 0, // Reset spell damage boost
            spellDamageBoostDuration: 0, // Reset spell damage boost duration
            // Keep other effects like regeneration, poison, etc.
          },
          abilities: prev.abilities.map(ability => 
            ability.name === "Spirit Endurance" 
              ? { ...ability, currentCooldown: ability.cooldown }
              : ability
          )
        }));
        addLogMessage(`${player2.name} is reincarnated by Spirit Endurance with ${reviveHealth} health! All buffs have been reset.`);
        return; // Don't end the game
      }
    }

    if (player1.health === 0 || player2.health === 0) {
      const didP1Die = player1.health === 0;
      const winPlayer = didP1Die ? player2 : player1;
      setGameOver(true);
      setWinner(winPlayer);

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

  useEffect(() => {
    if (gameOver) setAiThinking(false);
  }, [gameOver]);

  const applyAbilityByDescription = (player: Player, opponent: Player, setPlayer: Dispatch<SetStateAction<Player>>, setOpponent: Dispatch<SetStateAction<Player>>, ability: Ability): boolean => {
    const description = ability.description.toLowerCase();

    // If opponent has a repelling shield active, block abilities (not basic attacks)
    if (opponent.effects.repelAbilities && opponent.effects.repelAbilitiesDuration > 0) {
      addLogMessage(`${opponent.name}'s repelling shield negates ${ability.name}!`);
      return true;
    }

    // Also block abilities against untargetable targets
    if (opponent.effects.untargetable && opponent.effects.untargetableDuration > 0) {
      addLogMessage(`${opponent.name} is untargetable! ${ability.name} fails.`);
      return true;
    }

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

    // Repelling shield: repel abilities for N turns
    if (description.includes('repel') && description.includes('abilities')) {
      const turnsMatch = description.match(/for\s+(\d+)\s+turns?/);
      const duration = turnsMatch ? parseInt(turnsMatch[1]) : 4;
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          repelAbilities: true,
          repelAbilitiesDuration: duration
        }
      }));
      addLogMessage(`${player.name} is surrounded by a repelling shield for ${duration} turns!`);
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
      // Extract damage if present
      const damageMatch = description.match(/deal (\d+) damage/i);
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
    
    // Poison (specific) - deal immediate poison damage parsed from description
    if (ability.name.toLowerCase() === 'poison') {
      const dm = description.match(/(\d+)/);
      const poisonPerTurn = dm ? parseInt(dm[1]) : 16;
      setOpponent(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          poisoned: 1,
          poisonDamage: poisonPerTurn
        }
      }));
      addLogMessage(`${player.name} uses ${ability.name} and poisons ${opponent.name} for ${poisonPerTurn} damage per turn!`);
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

    // Execute / Divine Execution — only these ability names (avoid matching unrelated "instant kill" text)
    if (ability.name.toLowerCase() === 'execute' || ability.name.toLowerCase() === 'divine execution') {
      const thresholdMatch = description.match(/under (\d+)%/);
      const damageMatch = description.match(/deal (\d+) damage/);
      const threshold = thresholdMatch ? parseInt(thresholdMatch[1], 10) : 12;
      let damage = damageMatch ? parseInt(damageMatch[1], 10) : 40;

      if (ability.name.toLowerCase() === 'divine execution') {
        const oathOfFinalityAbility = player.abilities.find((a) => a.name === 'Oath of Finality');
        if (oathOfFinalityAbility) {
          const playerHealthPercent = (player.health / player.maxHealth) * 100;
          if (playerHealthPercent < 40) {
            const damageIncrease = Math.floor(damage * 0.3);
            damage += damageIncrease;
            addLogMessage(
              `${player.name}'s Oath of Finality increases Divine Execution spell damage by 30%! (+${damageIncrease} damage)`
            );
          }
        }
      }

      const healthPercent = (opponent.health / opponent.maxHealth) * 100;
      if (healthPercent <= threshold) {
        setOpponent((prev) => ({ ...prev, health: 0 }));
        addLogMessage(
          ability.name.toLowerCase() === 'divine execution'
            ? `${player.name} uses Divine Execution and instantly kills ${opponent.name}!`
            : `${player.name} executes ${opponent.name} instantly!`
        );
        return false;
      }
      const msg =
        ability.name.toLowerCase() === 'divine execution'
          ? `${player.name} uses Divine Execution and deals ${damage} damage!`
          : `${player.name} uses Execute and deals ${damage} damage!`;
      abilityDealDamage(damage, msg);
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
    if (description.includes('mana') && description.includes('health') && !description.includes('lose')) {
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

    // Blood Frenzy - Attack twice for 30-40 each, then take 15 self-damage
    if (ability.name.toLowerCase() === 'blood frenzy' || (description.includes('attack twice') && description.includes('damage each'))) {
      // Parse damage range from description "Attack twice for 30-40 damage each"
      const damageMatch = description.match(/attack twice for (\d+)-(\d+) damage each/);
      const selfDamageMatch = description.match(/take (\d+) self-damage/);
      
      const minDamage = damageMatch ? parseInt(damageMatch[1]) : 30;
      const maxDamage = damageMatch ? parseInt(damageMatch[2]) : 40;
      const selfDamage = selfDamageMatch ? parseInt(selfDamageMatch[1]) : 15;
      
      const hit1 = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
      const hit2 = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
      const totalDamage = hit1 + hit2;
      
      // Deal both attacks as total damage
      dealDamage(totalDamage, opponent, setOpponent, addLogMessage, `${player.name} unleashes Blood Frenzy and strikes twice for ${hit1} + ${hit2} = ${totalDamage} total damage!`);

      // Apply self-damage
      setPlayer(prev => ({ ...prev, health: Math.max(1, prev.health - selfDamage) }));
      addLogMessage(`${player.name} takes ${selfDamage} self-damage from Blood Frenzy!`);
      return opponent.health > 0;
    }

    // Summon Wolf - create a permanent summoned creature that deals N damage per turn
    if ((ability.name.toLowerCase() === 'summon wolf') || (description.includes('summon') && description.includes('wolf'))) {
      const dmgMatch = description.match(/(\d+)\s+damage\s+per\s+turn/);
      const damage = dmgMatch ? parseInt(dmgMatch[1]) : 12;
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          summonedCreature: { damage, turnsLeft: -1 }
        }
      }));
      addLogMessage(`${player.name} summons a wolf that will deal ${damage} damage each turn!`);
      return true;
    }

    // Fear Howl - Become untargetable for 3 turns (stealth mode)
    if ((ability.name.toLowerCase() === 'fear howl') || (description.includes('untargetable') && description.includes('3 turn'))) {
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          untargetable: true,
          untargetableDuration: 3
        }
      }));
      addLogMessage(`${player.name} enters stealth and becomes untargetable for 3 turns!`);
      return true;
    }

    // Shadow Ambush - Become untargetable for 1 turn, then strike next turn for 60-90 damage
    if ((ability.name.toLowerCase() === 'shadow ambush') || (description.includes('untargetable') && description.includes('strike next turn'))) {
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          untargetable: true,
          untargetableDuration: 1,
          ambushPending: true,
          ambushDelay: 1,
          ambushMin: 60,
          ambushMax: 90
        }
      }));
      addLogMessage(`${player.name} vanishes into the shadows!`);
      return true;
    }

    // Judgment of Fate - Deal 60-90 damage, double if enemy below 40% health
    if (ability.name.toLowerCase() === 'judgment of fate') {
      const baseDamage = Math.floor(Math.random() * (90 - 60 + 1)) + 60; // 60-90 damage
      const enemyHealthPercent = (opponent.health / opponent.maxHealth) * 100;
      
      let finalDamage = baseDamage;
      if (enemyHealthPercent < 40) {
        finalDamage = baseDamage * 2;
        addLogMessage(`${opponent.name} is below 40% health - Judgment of Fate deals double damage!`);
      }
      
      abilityDealDamage(finalDamage, `${player.name} casts Judgment of Fate and deals ${finalDamage} damage!`);
      return opponent.health > 0;
    }

    // Blessed Arrow - Parse damage and healing from description
    if (ability.name.toLowerCase() === "blessed arrow") {
      const damageMatch = description.match(/deal (\d+) damage/i);
      const healMatch = description.match(/restore (\d+) health/);
      
      if (damageMatch && healMatch) {
        const damage = parseInt(damageMatch[1]);
        const healAmount = parseInt(healMatch[1]);
        abilityDealDamage(damage, `${player.name} fires a blessed arrow for ${damage} damage!`);
        applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} is blessed and restores ${healAmount} health!`);
        return opponent.health > 0;
      }
    }

    // Sacred Ward - Parse shield amount from description
    if (ability.name.toLowerCase() === "sacred ward") {
      const shieldMatch = description.match(/blocks (\d+) damage/);
      
      if (shieldMatch) {
        const shieldAmount = parseInt(shieldMatch[1]);
        setPlayer(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            shield: prev.effects.shield + shieldAmount
          }
        }));
        addLogMessage(`${player.name} creates a sacred ward that blocks ${shieldAmount} damage!`);
      }
      return true;
    }

    // Elemental Warden abilities (must be before generic handlers)
    if (ability.name === "Fire Blast") {
      const damage = Math.floor(Math.random() * (35 - 25 + 1)) + 25; // 25-35 damage
      abilityDealDamage(damage, `${player.name} blasts with fire for ${damage} damage!`);
      
      // Parse permanent fire damage from description
      const burnMatch = description.match(/inflict (\d+) damage everyturn/);
      if (burnMatch) {
        const burnDamage = parseInt(burnMatch[1]);
        setOpponent(prev => ({
          ...prev,
          effects: {
            ...prev.effects,
            poisoned: 999, // Large number for "permanent" effect
            poisonDamage: burnDamage
          }
        }));
        addLogMessage(`${opponent.name} is burned and will take ${burnDamage} damage every turn!`);
      }
      return opponent.health > 0;
    }

    if (ability.name === "Water Spout") {
      // Parse damage from description "Deal 50 water damage , heal 30 health"
      const damageMatch = description.match(/deal (\d+) water damage/);
      const damage = damageMatch ? parseInt(damageMatch[1]) : 50;
      abilityDealDamage(damage, `${player.name} summons a water spout for ${damage} damage!`);

      // Parse heal amount from description "heal 30 health"
      const healMatch = description.match(/heal (\d+) health/);
      const healAmount = healMatch ? parseInt(healMatch[1]) : 30;
      applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} is refreshed and restores ${healAmount} health!`);
      return opponent.health > 0;
    }

    if (ability.name === "Earth Tremor") {
      const damage = Math.floor(Math.random() * (40 - 30 + 1)) + 30; // 30-40 damage
      abilityDealDamage(damage, `${player.name} causes an earth tremor for ${damage} damage!`);
      // Increase spell damage by 30%
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          spellDamageBoost: 30
        }
      }));
      addLogMessage(`${player.name}'s connection to earth increases spell damage by 30%!`);
      return opponent.health > 0;
    }

    if (ability.name === "Wind Slash") {
      const damage = Math.floor(Math.random() * (25 - 15 + 1)) + 15; // 15-25 damage
      abilityDealDamage(damage, `${player.name} slashes with wind for ${damage} damage!`);
      // Increase attack by 30% for 2 turns
      applyAttackBoost(player, setPlayer, 30, 2, addLogMessage, `${player.name} is empowered by wind and gains 30% attack for 2 turns!`);
      return opponent.health > 0;
    }

    if (ability.name === "Spirit Bolt") {
      const damage = Math.floor(Math.random() * (45 - 35 + 1)) + 35; // 35-45 damage
      abilityDealDamage(damage, `${player.name} channels spirit energy for ${damage} damage!`);
      // Restore 15 mana
      setPlayer(prev => ({
        ...prev,
        mana: Math.min(prev.maxMana, prev.mana + 15)
      }));
      addLogMessage(`${player.name} channels spirit energy and restores 15 mana!`);
      return opponent.health > 0;
    }

    // Necromancer abilities (must be before generic handlers)
    if (ability.name === "Summon Skeleton") {
      const damage = 15;
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          summonedCreatures: [
            ...prev.effects.summonedCreatures,
            { name: "Skeleton", damage: damage, turnsLeft: 5 }
          ]
        }
      }));
      addLogMessage(`${player.name} summons a skeleton that deals ${damage} damage per turn for 5 turns!`);
      return true;
    }

    if (ability.name === "Summon Zombie") {
      const damage = 18;
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          summonedCreatures: [
            ...prev.effects.summonedCreatures,
            { name: "Zombie", damage: damage, turnsLeft: 5 }
          ]
        }
      }));
      addLogMessage(`${player.name} summons a zombie that deals ${damage} damage per turn for 5 turns!`);
      return true;
    }

    if (ability.name === "Summon Wraith") {
      const damage = 20;
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          summonedCreatures: [
            ...prev.effects.summonedCreatures,
            { name: "Wraith", damage: damage, turnsLeft: 5 }
          ]
        }
      }));
      addLogMessage(`${player.name} summons a wraith that deals ${damage} damage per turn for 5 turns!`);
      return true;
    }

    if (ability.name === "Necromancy Mastery") {
      // Parse boost percentage from description "All summoned creatures deal 150% more damage everyturn"
      const boostMatch = description.match(/(\d+)% more damage everyturn/);
      const boostPercent = boostMatch ? parseInt(boostMatch[1]) : 150;
      
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          summonedCreatureDamageBoost: boostPercent,
          summonedCreatureDamageBoostDuration: 999 // Large number for permanent effect
        }
      }));
      addLogMessage(`${player.name} enhances all summoned creatures to deal ${boostPercent}% more damage permanently!`);
      return true;
    }

    // Generic ranged damage handler (e.g., "Deal 20-30 fire damage" or "Deal 70–100 fire damage")
    const rangeDamageMatch = description.match(/deal (\d+)[–-](\d+).*damage/);
    if (rangeDamageMatch) {
      // Check for Elemental Mastery spell immunity
      if (opponent.abilities.some(ability => ability.name === "Elemental Mastery")) {
        addLogMessage(`${opponent.name}'s Elemental Mastery grants immunity to ${ability.name}!`);
        return opponent.health > 0;
      }
      
      const minD = parseInt(rangeDamageMatch[1]);
      const maxD = parseInt(rangeDamageMatch[2]);
      let damage = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
      // Apply spell damage boost if active
      if (player.effects.spellDamageBoost && player.effects.spellDamageBoost > 0) {
        const boosted = Math.floor(damage * (1 + player.effects.spellDamageBoost / 100));
        addLogMessage(`${player.name}'s spell is empowered (+${player.effects.spellDamageBoost}%)!`);
        damage = boosted;
      }
      
      // Check for Monster Lore passive - parse values from description
      const monsterLoreAbility = player.abilities.find(ability => ability.name === "Monster Lore");
      if (monsterLoreAbility) {
        const healthPercent = (player.health / player.maxHealth) * 100;
        const boostMatch = monsterLoreAbility.description.match(/increase spell damage by (\d+)%/i);
        const thresholdMatch = monsterLoreAbility.description.match(/under (\d+)% health/i);
        const boostPercent = boostMatch ? parseInt(boostMatch[1]) : 100;
        const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 50;
        
        if (healthPercent < threshold) {
          const monsterLoreBoost = Math.floor(damage * (boostPercent / 100));
          damage += monsterLoreBoost;
          addLogMessage(`${player.name}'s Monster Lore provides ${boostPercent}% spell damage boost!`);
        }
      }
      abilityDealDamage(damage, `${player.name} uses ${ability.name} and deals ${damage} damage!`);
      return opponent.health > 0;
    }

    // Generic fixed damage handler (e.g., "Deal 35 damage")
    const fixedDamageMatch = description.match(/deal (\d+) damage/i);
    if (fixedDamageMatch) {
      let damage = parseInt(fixedDamageMatch[1]);
      // Apply spell damage boost if active
      if (player.effects.spellDamageBoost && player.effects.spellDamageBoost > 0) {
        const boosted = Math.floor(damage * (1 + player.effects.spellDamageBoost / 100));
        addLogMessage(`${player.name}'s spell is empowered (+${player.effects.spellDamageBoost}%)!`);
        damage = boosted;
      }
      
      // Check for Monster Lore passive - parse values from description
      const monsterLoreAbility = player.abilities.find(ability => ability.name === "Monster Lore");
      if (monsterLoreAbility) {
        const healthPercent = (player.health / player.maxHealth) * 100;
        const boostMatch = monsterLoreAbility.description.match(/increase spell damage by (\d+)%/i);
        const thresholdMatch = monsterLoreAbility.description.match(/under (\d+)% health/i);
        const boostPercent = boostMatch ? parseInt(boostMatch[1]) : 100;
        const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 50;
        
        if (healthPercent < threshold) {
          const monsterLoreBoost = Math.floor(damage * (boostPercent / 100));
          damage += monsterLoreBoost;
          addLogMessage(`${player.name}'s Monster Lore provides ${boostPercent}% spell damage boost!`);
        }
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

    // Swap Stats ability
    if (ability.name === "Swap Stats") {
      const playerHealth = player.health;
      const opponentHealth = opponent.health;
      
      setPlayer(prev => ({
        ...prev,
        health: opponentHealth
      }));
      
      setOpponent(prev => ({
        ...prev,
        health: playerHealth
      }));
      
      addLogMessage(`${player.name} swaps health with ${opponent.name}!`);
      return true;
    }

    // Starlight Volley ability
    if (ability.name === "Starlight Volley") {
      const damageMatch = description.match(/(\d+)-(\d+) damage (\d+) times/);
      if (damageMatch) {
        const minDamage = parseInt(damageMatch[1]);
        const maxDamage = parseInt(damageMatch[2]);
        const times = parseInt(damageMatch[3]);
        
        let totalDamage = 0;
        const damages = [];
        for (let i = 0; i < times; i++) {
          const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
          damages.push(damage);
          totalDamage += damage;
        }
        
        // Apply all damage at once
        dealDamage(totalDamage, opponent, setOpponent, addLogMessage, `${player.name} unleashes a barrage of ${times} astral arrows for ${totalDamage} total damage!`);
      }
      return true;
    }

    // Summon Imp ability
    if (ability.name === "Summon Imp") {
      const damageMatch = description.match(/(\d+) dmg/);
      const damage = damageMatch ? parseInt(damageMatch[1]) : 8;
      
      setPlayer(prev => ({
        ...prev,
        effects: {
          ...prev.effects,
          summonedCreature: { damage: damage, turnsLeft: 999 }
        }
      }));
      
      addLogMessage(`${player.name} summons an imp that will deal ${damage} damage every turn!`);
      return true;
    }

    // Life Tap ability
    if (ability.name === "Life Tap") {
      // Parse health loss and mana gain from description "Lose 100 health to gain 100 mana"
      const healthMatch = description.match(/lose (\d+) health/i);
      const manaMatch = description.match(/gain (\d+) mana/i);
      
      const healthLoss = healthMatch ? parseInt(healthMatch[1]) : 10; // Default to 10 if parsing fails
      const manaGain = manaMatch ? parseInt(manaMatch[1]) : 25; // Default to 25 if parsing fails
      
      setPlayer(prev => ({
        ...prev,
        health: Math.max(0, prev.health - healthLoss),
        mana: Math.min(prev.maxMana, prev.mana + manaGain)
      }));
      
      addLogMessage(`${player.name} loses ${healthLoss} health to gain ${manaGain} mana!`);
      return true;
    }

    addLogMessage(`${player.name} uses ${ability.name}!`);
    return true;
  };

  handleAttackFromRef.current = handleAttackFrom;
  handleAbilityUseRef.current = handleAbilityUse;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!player1.isComputer) handleAttackFromRef.current(1);
        return;
      }
      const slot = parseInt(e.key, 10);
      if (slot >= 1 && slot <= 4 && !player1.isComputer) {
        handleAbilityUseRef.current(1, slot - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameOver, player1.isComputer]);

  return (
    <BattleArenaUI
      player1={player1}
      player2={player2}
      gameOver={gameOver}
      winner={winner}
      battleLog={battleLog}
      handleAttack={() => handleAttackFrom(1)}
      handleAbilityUse={handleAbilityUse}
      resetGame={resetGame}
      gameStats={gameStats}
      aiThinking={aiThinking}
      basicAttackAutomatic
    />
  );
};
