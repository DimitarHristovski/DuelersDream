import { useEffect, useRef, useState } from 'react';
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

    const damage = calculateAttackDamage(attacker.attackMin, attacker.attackMax, 0, 0);
    const newHealth = Math.max(0, defender.health - damage);

    setDefender((prev) => ({ ...prev, health: newHealth }));
    addLogMessage(`${attacker.name} attacks ${defender.name} for ${damage} damage!`);

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
      const manaRegen = 15;
      const newMana = Math.min(prev.maxMana, prev.mana + manaRegen);
      if (newMana > prev.mana) addLogMessage(`${prev.name} regenerates ${manaRegen} mana.`);
      return { ...prev, isActive: true, abilities: updatedAbilities, mana: newMana };
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
      return { ...prev, isActive: true, abilities: updatedAbilities, mana: newMana };
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

  // Returns whether the battle should continue (opponent not reduced to 0)
  const applyAbilityByDescription = (
    player: Player,
    opponent: Player,
    setPlayer: React.Dispatch<React.SetStateAction<Player>>,
    setOpponent: React.Dispatch<React.SetStateAction<Player>>,
    ability: Ability,
  ): boolean => {
    // Special-case exact ability names when needed
    if (ability.name === 'Stat Swap') {
      swapStats(player, setPlayer, opponent, setOpponent, addLogMessage, `${player.name} swaps health and mana with ${opponent.name}!`);
      return true;
    }

    const desc = ability.description.toLowerCase();

    // Conditional damage based on opponent health threshold: "if target below N% health"
    const thresholdMatch = desc.match(/below\s+(\d+)%\s+health/);
    let thresholdOk = true;
    if (thresholdMatch) {
      const percent = parseInt(thresholdMatch[1], 10);
      thresholdOk = opponent.health < Math.ceil((percent / 100) * opponent.maxHealth);
      if (!thresholdOk) {
        addLogMessage(`${player.name} attempts ${ability.name} but the target is too healthy!`);
        return true;
      }
    }

    // Sacrifice H health to gain M mana
    const healthToMana = desc.match(/sacrifice\s+(\d+)\s+health\s+to\s+gain\s+(\d+)\s+mana/);
    if (healthToMana) {
      const healthCost = parseInt(healthToMana[1], 10);
      const manaGain = parseInt(healthToMana[2], 10);
      convertHealthToMana(player, setPlayer, healthCost, manaGain, addLogMessage, `${player.name} sacrifices ${healthCost} health to gain ${manaGain} mana!`);
      return true;
    }

    // Gain mana pattern: "gain X mana"
    const gainManaMatch = desc.match(/gain\s+(\d+)\s+mana/);
    if (gainManaMatch) {
      const manaGain = parseInt(gainManaMatch[1], 10);
      gainMana(player, setPlayer, manaGain, addLogMessage, `${player.name} gains ${manaGain} mana!`);
    }

    // Heal pattern: "restore N health" or "heal N health" or ranges
    const healRangeMatch = desc.match(/(restore|heal)\s+(\d+)-(\d+)\s+health/);
    const healFixedMatch = desc.match(/(restore|heal)\s+(\d+)\s+health/);

    if (healRangeMatch) {
      const min = parseInt(healRangeMatch[2], 10);
      const max = parseInt(healRangeMatch[3], 10);
      const healAmount = Math.floor(Math.random() * (max - min + 1)) + min;
      applyHeal(player, setPlayer, healAmount, addLogMessage, `${player.name} uses ${ability.name}, healing for ${healAmount} health!`);
    } else if (healFixedMatch) {
      const amount = parseInt(healFixedMatch[2], 10);
      applyHeal(player, setPlayer, amount, addLogMessage, `${player.name} uses ${ability.name}, healing for ${amount} health!`);
    }

    // Damage pattern: supports single hit and multi-hit with "and then"
    // First hit
    const dmg1 = desc.match(/deal\s+(\d+)-(\d+)\s+damage/);
    // Second hit (and then ... damage)
    const dmg2 = desc.match(/and\s+then\s+(\d+)-(\d+)\s+damage/);

    let opponentAlive = true;

    if (dmg1) {
      const min = parseInt(dmg1[1], 10);
      const max = parseInt(dmg1[2], 10);
      const damage = Math.floor(Math.random() * (max - min + 1)) + min;
      const newHealth = dealDamage(damage, opponent, setOpponent, addLogMessage, `${player.name} uses ${ability.name} for ${damage} damage!`);
      opponentAlive = newHealth > 0;
    }

    if (opponentAlive && dmg2) {
      const min2 = parseInt(dmg2[1], 10);
      const max2 = parseInt(dmg2[2], 10);
      const damage2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      const newHealth2 = dealDamage(damage2, opponent, setOpponent, addLogMessage, `${player.name} follows up for ${damage2} damage!`);
      opponentAlive = newHealth2 > 0;
    }

    // Self-damage pattern: "and take N damage"
    const selfDmg = desc.match(/and\s+take\s+(\d+)\s+damage/);
    if (selfDmg) {
      const recoil = parseInt(selfDmg[1], 10);
      dealDamage(recoil, player, setPlayer, addLogMessage, `${player.name} takes ${recoil} recoil damage!`);
    }

    // If nothing matched, just log usage
    if (!dmg1 && !healRangeMatch && !healFixedMatch && !healthToMana && !gainManaMatch && ability.name !== 'Stat Swap') {
      addLogMessage(`${player.name} uses ${ability.name}!`);
    }

    return opponentAlive;
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