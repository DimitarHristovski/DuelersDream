import { useState, useEffect, useRef } from 'react';
import { ClassSelection } from '@/components/game/ClassSelection';
import { BattleArena } from '@/components/game/BattleArena';
import { GameHeader } from '@/components/game/GameHeader';
import { buildDefaultPlayer, Player } from '@/components/game/abilities';
import { PLAYER_CLASSES } from '@/components/game/class-data';
import { pickRandomAiClass } from '@/components/game/class-categories';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);

  const [player1Class, setPlayer1Class] = useState<keyof typeof PLAYER_CLASSES>('Warrior');
  const [player1Name, setPlayer1Name] = useState<string>('Player 1');
  const opponentClassForMatchRef = useRef<keyof typeof PLAYER_CLASSES | null>(null);

  const [player1, setPlayer1] = useState(
    buildDefaultPlayer(player1Name, player1Class, PLAYER_CLASSES[player1Class], true, false)
  );

  useEffect(() => {
    setPlayer1(buildDefaultPlayer(player1Name, player1Class, PLAYER_CLASSES[player1Class], true, false));
  }, [player1Name, player1Class]);

  const [player2, setPlayer2] = useState(() => {
    const aiClass = pickRandomAiClass('Warrior');
    return buildDefaultPlayer(`${String(aiClass)} AI`, aiClass, PLAYER_CLASSES[aiClass], true, true);
  });

  const [gameStats, setGameStats] = useState({
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    lastGameResult: '',
  });

  useEffect(() => {
    const savedStats = localStorage.getItem('duelGameStats');
    if (savedStats) {
      try {
        setGameStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Error loading game stats from localStorage:', e);
      }
    }
  }, []);

  const startGame = () => {
    const aiClass = opponentClassForMatchRef.current ?? pickRandomAiClass(player1Class);
    opponentClassForMatchRef.current = null;

    const newPlayer1 = buildDefaultPlayer(player1Name, player1Class, PLAYER_CLASSES[player1Class], true, false);
    const newPlayer2 = buildDefaultPlayer(`${String(aiClass)} AI`, aiClass, PLAYER_CLASSES[aiClass], true, true);

    setPlayer1(newPlayer1);
    setPlayer2(newPlayer2);

    setGameOver(false);
    setWinner(null);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
  };

  const resetStats = () => {
    const defaultStats = {
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      lastGameResult: '',
    };
    setGameStats(defaultStats);
    localStorage.setItem('duelGameStats', JSON.stringify(defaultStats));
  };

  return (
    <div className="min-h-screen flex flex-col bg-duel-void text-stone-200 relative overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 bg-[url('/assets/medieval-bg.jpg')] bg-cover bg-center opacity-[0.12]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-duel-void via-duel-ink/95 to-duel-void"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201, 162, 39, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(136, 19, 55, 0.08), transparent)`,
        }}
        aria-hidden
      />

      <GameHeader
        phase={gameStarted ? 'battle' : 'selection'}
        gamesPlayed={gameStats.gamesPlayed}
        wins={gameStats.wins}
        losses={gameStats.losses}
        onResetStats={resetStats}
      />

      <main className="relative z-10 flex-1 w-full">
        <div className="container mx-auto px-4 py-8 md:py-10 max-w-[1600px]">
          {!gameStarted && (
            <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
              <ClassSelection
                player1Class={player1Class}
                setPlayer1Class={setPlayer1Class}
                player1Name={player1Name}
                setPlayer1Name={setPlayer1Name}
                onOpponentClassLockedIn={(c) => {
                  opponentClassForMatchRef.current = c;
                }}
                startGame={startGame}
              />
            </div>
          )}

          {gameStarted && (
            <div className="animate-in fade-in-0 duration-700 space-y-8">
              <BattleArena
                player1={player1}
                player2={player2}
                setPlayer1={setPlayer1}
                setPlayer2={setPlayer2}
                gameOver={gameOver}
                setGameOver={setGameOver}
                winner={winner}
                setWinner={setWinner}
                gameStats={gameStats}
                setGameStats={setGameStats}
                resetGame={resetGame}
              />

              {gameOver && (
                <div className="flex justify-center animate-in slide-in-from-bottom-8 duration-700">
                  <Button
                    onClick={resetGame}
                    size="lg"
                    className="font-display tracking-wide px-10 py-6 text-base rounded-xl bg-gradient-to-r from-duel-brass to-amber-600 text-duel-void hover:from-amber-400 hover:to-duel-flame shadow-lg shadow-black/40 border border-duel-brass/40"
                  >
                    New battle
                    <MoveRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-duel-brass/15 bg-duel-void/80 backdrop-blur-sm py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-duel-mist">
          <p className="font-display text-duel-brass/80 text-sm mb-1">Duelers Dream</p>
          <p className="text-duel-mist/80">Arena duel · single player vs random AI</p>
        </div>
      </footer>
    </div>
  );
}
