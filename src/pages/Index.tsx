import { useState, useEffect } from 'react';
import { ClassSelection } from '@/components/game/ClassSelection';
import { BattleArena } from '@/components/game/BattleArena';
import { createDefaultEffects, buildDefaultPlayer, Player } from '@/components/game/abilities';
import { GameStats } from '@/components/game/BattleArena';
import { PLAYER_CLASSES } from '@/components/game/class-data';
import { MoveRight, Sword, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  // Game state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  
  // Player selections
  const [player1Class, setPlayer1Class] = useState<keyof typeof PLAYER_CLASSES>("Knight");
  const [player2Class, setPlayer2Class] = useState<keyof typeof PLAYER_CLASSES>("Mage");
  const [player1Name, setPlayer1Name] = useState<string>("Player 1");
  const [player2Name, setPlayer2Name] = useState<string>("Player 2");
  const [isPlayer2Computer, setIsPlayer2Computer] = useState<boolean>(false);
  
  // Player game states
  const [player1, setPlayer1] = useState(buildDefaultPlayer(
    player1Name,
    player1Class,
    PLAYER_CLASSES[player1Class],
    true,
    false
  ));
  
  // Update player1 when name changes
  useEffect(() => {
    setPlayer1(buildDefaultPlayer(
      player1Name,
      player1Class,
      PLAYER_CLASSES[player1Class],
      true,
      false
    ));
  }, [player1Name, player1Class]);
  
  const [player2, setPlayer2] = useState(buildDefaultPlayer(
    player2Name,
    player2Class,
    PLAYER_CLASSES[player2Class],
    false,
    isPlayer2Computer
  ));
  
  // Update player2 when computer setting changes
  useEffect(() => {
    setPlayer2(buildDefaultPlayer(
      isPlayer2Computer ? `${player2Class} AI` : player2Name,
      player2Class,
      PLAYER_CLASSES[player2Class],
      false,
      isPlayer2Computer
    ));
  }, [isPlayer2Computer, player2Name, player2Class]);
  
  // Debug game state
  useEffect(() => {
    console.log('Game state changed:', { gameStarted, gameOver, winner });
  }, [gameStarted, gameOver, winner]);
  
  // Game statistics
  const [gameStats, setGameStats] = useState({
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    lastGameResult: ""
  });
  
  // Load game stats from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('duelGameStats');
    if (savedStats) {
      try {
        setGameStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Error loading game stats from localStorage:", e);
      }
    }
  }, []);
  

  
  // Start the game with selected players
  const startGame = () => {
    console.log('startGame called');
    
    // Create player 1
    const newPlayer1 = buildDefaultPlayer(
      player1Name,
      player1Class,
      PLAYER_CLASSES[player1Class],
      true,
      false
    );
    
    // Create player 2 (can be computer or human)
    const newPlayer2 = buildDefaultPlayer(
      isPlayer2Computer ? `${player2Class} AI` : player2Name,
      player2Class,
      PLAYER_CLASSES[player2Class],
      false,
      isPlayer2Computer
    );
    
    console.log('Created players:', { player1: newPlayer1, player2: newPlayer2 });
    
    setPlayer1(newPlayer1);
    setPlayer2(newPlayer2);
    
    setGameOver(false);
    setWinner(null);
    setGameStarted(true);
    
    console.log('Game started, gameStarted should be true');
  };
  
  // Reset game to selection screen
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-fixed relative overflow-hidden"
         style={{ backgroundImage: "url('/assets/medieval-bg.jpg')" }}>
      
      {/* Dark overlay for background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
      
      {/* Game content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-8">
        <div className="container mx-auto px-4">
          {/* Game header with title and stats */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-5xl font-bold mb-4 md:mb-0 text-amber-100 drop-shadow-lg 
                        bg-gradient-to-br from-amber-200 to-amber-500 bg-clip-text text-transparent">
              Medieval Combat Arena
            </h1>
            
            {gameStats.gamesPlayed > 0 && (
              <div className="flex items-center space-x-6 text-amber-200">
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-green-400" />
                  <span>{gameStats.wins} Wins</span>
                </div>
                <div className="flex items-center">
                  <Sword className="w-5 h-5 mr-2 text-red-400" />
                  <span>{gameStats.losses} Losses</span>
                </div>
                <div>
                  <span className="text-amber-300 font-medium">{gameStats.gamesPlayed} Games Played</span>
                </div>
              </div>
            )}
          </div>
          
          {!gameStarted && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <ClassSelection 
                player1Class={player1Class}
                setPlayer1Class={setPlayer1Class}
                player2Class={player2Class}
                setPlayer2Class={setPlayer2Class}
                player1Name={player1Name}
                setPlayer1Name={setPlayer1Name}
                player2Name={player2Name}
                setPlayer2Name={setPlayer2Name}
                isPlayer2Computer={isPlayer2Computer}
                setIsPlayer2Computer={setIsPlayer2Computer}
                startGame={startGame}
              />
            </div>
          )}
          
          {gameStarted && (
            <div className="animate-in fade-in-0 duration-700">
              <div className="text-white text-center mb-4">DEBUG: Game started, rendering BattleArena</div>
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
                <div className="flex justify-center mt-6 animate-in slide-in-from-bottom-8 duration-700">
                  <Button 
                    onClick={resetGame}
                    className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800
                            text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center"
                  >
                    New Battle <MoveRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-8 text-center text-amber-200/70 text-sm relative z-10">
        <p>Medieval Combat Arena &copy; 2025</p>
      </footer>
    </div>
  );
}