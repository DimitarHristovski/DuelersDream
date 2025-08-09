import { Shield, Sword, Heart, Clock, Zap, Info, AlertCircle, Skull, ChevronRight, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Player } from './abilities';
import { PLAYER_CLASSES, getIconByName } from './class-data';
import { motion, AnimatePresence } from 'framer-motion';

interface GameStats {
  wins: number;
  losses: number;
  gamesPlayed: number;
  lastGameResult?: string;
}

interface BattleArenaUIProps {
  player1: Player;
  player2: Player;
  gameOver: boolean;
  winner: Player | null;
  battleLog: string[];
  turnTimeLeft: number;
  handleAttack: () => void;
  handleAbilityUse: (playerNum: 1 | 2, abilityIndex: number) => void;
  resetGame: () => void;
  gameStats: GameStats;
}

export const BattleArenaUI = ({
  player1,
  player2,
  gameOver,
  winner,
  battleLog,
  turnTimeLeft,
  handleAttack,
  handleAbilityUse,
  resetGame,
  gameStats
}: BattleArenaUIProps) => {
  console.log('BattleArenaUI rendered with props:', { player1, player2, gameOver, winner });
  
  // Render player card with abilities
  const renderPlayerCard = (player: Player, playerNum: 1 | 2) => {
    const isActive = player.isActive && !gameOver;
    
    return (
      <div className={`relative h-full ${isActive ? 'z-10' : 'z-0'}`}>
        {/* Active player indicator */}
        {isActive && (
          <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-amber-700 rounded-lg animate-pulse -z-10"></div>
        )}
        
        <Card className={`h-full border-0 shadow-xl ${
          isActive 
            ? 'bg-gradient-to-br from-amber-900/90 to-black/95' 
            : 'bg-gradient-to-br from-stone-900/90 to-black/95'
        }`}>
          <CardHeader className={`pb-2 ${
            isActive 
              ? 'bg-gradient-to-r from-amber-700/50 to-amber-900/30' 
              : 'bg-gradient-to-r from-stone-800/30 to-stone-900/20'
          }`}>
            <CardTitle className="flex justify-between items-center text-amber-100">
              <div className="flex items-center">
                {(() => {
                  try {
                    const classData = PLAYER_CLASSES[player.className as keyof typeof PLAYER_CLASSES];
                    if (classData && classData.abilities && classData.abilities[0]) {
                      return renderIcon(classData.abilities[0].iconName, "h-5 w-5 mr-2 text-amber-400");
                    }
                    return <Sword className="h-5 w-5 mr-2 text-amber-400" />;
                  } catch (error) {
                    console.error('Error rendering icon:', error);
                    return <Sword className="h-5 w-5 mr-2 text-amber-400" />;
                  }
                })()}
                {player.name}
              </div>
              <div className="flex gap-2">
                {player.isComputer && (
                  <Badge variant="outline" className="bg-blue-900/50 text-blue-200 border-blue-700">
                    AI
                  </Badge>
                )}
                {isActive && (
                  <Badge variant="outline" className="bg-amber-700/70 text-amber-200 border-amber-600 animate-pulse">
                    Active
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription className="text-amber-400/80">
              {player.className} • {(() => {
                try {
                  const classData = PLAYER_CLASSES[player.className as keyof typeof PLAYER_CLASSES];
                  return classData?.description || "Warrior";
                } catch (error) {
                  console.error('Error getting description:', error);
                  return "Warrior";
                }
              })()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 p-4">
            <div className="space-y-3">
              {/* Health bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <div className="flex items-center text-amber-200">
                    <Heart className="h-4 w-4 text-red-500 mr-1" />
                    <span>Health</span>
                  </div>
                  <span className={`${player.health < player.maxHealth * 0.3 ? 'text-red-400' : 'text-amber-200'}`}>
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
                <div className="relative h-2.5 bg-red-950/50 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                      player.health < player.maxHealth * 0.3 
                        ? "bg-gradient-to-r from-red-700 to-red-500 animate-pulse" 
                        : "bg-gradient-to-r from-green-700 to-green-500"
                    }`}
                    style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Mana bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                  <div className="flex items-center text-amber-200">
                    <Zap className="h-4 w-4 text-blue-500 mr-1" />
                    <span>Mana</span>
                  </div>
                  <span className="text-blue-300">
                    {player.mana}/{player.maxMana}
                  </span>
                </div>
                <div className="relative h-2.5 bg-blue-950/50 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-500"
                    style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Status effects */}
            {(player.effects.shield > 0 || player.effects.damageBoost > 0 || 
              player.effects.poisoned > 0 || player.effects.evading || 
              player.effects.stunned || player.effects.bleeding > 0 || 
              player.effects.regeneration > 0 || player.effects.attackReduction > 0 ||
              player.effects.summonedCreature) && (
              <div className="flex flex-wrap gap-1.5">
                {player.effects.shield > 0 && (
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700 py-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Shield {player.effects.shield}%
                  </Badge>
                )}
                {player.effects.damageBoost > 0 && (
                  <Badge variant="outline" className="bg-red-900/30 text-red-300 border-red-700 py-1">
                    <Sword className="h-3 w-3 mr-1" />
                    +{player.effects.damageBoost}% DMG
                  </Badge>
                )}
                {player.effects.poisoned > 0 && (
                  <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 py-1">
                    Poisoned ({player.effects.poisoned})
                  </Badge>
                )}
                {player.effects.bleeding > 0 && (
                  <Badge variant="outline" className="bg-red-900/30 text-red-300 border-red-700 py-1">
                    Bleeding ({player.effects.bleeding})
                  </Badge>
                )}
                {player.effects.evading && (
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700 py-1">
                    Evading
                  </Badge>
                )}
                {player.effects.stunned && (
                  <Badge variant="outline" className="bg-yellow-900/30 text-yellow-300 border-yellow-700 py-1 animate-pulse">
                    Stunned
                  </Badge>
                )}
                {player.effects.regeneration > 0 && (
                  <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 py-1">
                    Regen ({player.effects.regeneration})
                  </Badge>
                )}
                {player.effects.attackReduction > 0 && (
                  <Badge variant="outline" className="bg-orange-900/30 text-orange-300 border-orange-700 py-1">
                    -{player.effects.attackReduction}% ATK
                  </Badge>
                )}
                {player.effects.summonedCreature && (
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700 py-1">
                    Summon ({player.effects.summonedCreature.turnsLeft})
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-amber-200">
              <Sword className="h-4 w-4 text-amber-400" />
              <span>Attack: {player.attackMin}-{player.attackMax}</span>
            </div>
            
            {/* Abilities section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-amber-200">Abilities</h4>
              <div className="grid grid-cols-3 gap-2">
                {player.abilities.map((ability, index) => {
                  const isDisabled = (ability.currentCooldown || 0) > 0 || !player.isActive || gameOver || player.isComputer;
                  const notEnoughMana = player.isActive && (ability.manaCost || 0) > player.mana;
                  
                  return (
                    <div className="relative group" key={`${player.name}-ability-${index}`}>
                      <Button 
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`flex flex-col items-center justify-center p-2 h-auto text-xs relative w-full
                          ${isDisabled || notEnoughMana
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-amber-700'
                          }
                          ${isActive && !isDisabled && !notEnoughMana ? 'bg-amber-800 text-amber-100' : 'bg-stone-800/50 text-stone-300'}
                        `}
                        onClick={() => handleAbilityUse(playerNum, index)}
                        disabled={isDisabled || notEnoughMana}
                      >
                        <div className="mb-1">
                          {(() => {
                            try {
                              if (ability.iconName) {
                                const IconComponent = getIconByName(ability.iconName);
                                return <IconComponent className="h-5 w-5" />;
                              }
                              return null;
                            } catch (error) {
                              console.error('Error rendering ability icon:', error);
                              return <Sword className="h-5 w-5" />;
                            }
                          })()}
                        </div>
                        <div className="text-[10px] font-medium">{ability.name}</div>
                        {(ability.currentCooldown || 0) > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm">
                            <Badge variant="default" className="bg-amber-900 text-amber-100 text-[10px] px-1 py-0 rounded-sm">
                              <Clock className="h-3 w-3 mr-0.5" /> {ability.currentCooldown}
                            </Badge>
                          </div>
                        )}
                        {notEnoughMana && !isDisabled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm">
                            <Badge variant="default" className="bg-blue-900 text-blue-100 text-[10px] px-1 py-0 rounded-sm">
                              <AlertCircle className="h-3 w-3 mr-0.5" /> No Mana
                            </Badge>
                          </div>
                        )}
                        {ability.manaCost && (
                          <Badge variant="default" className="absolute top-1 right-1 bg-blue-800/70 text-[9px] px-1 py-0">
                            {ability.manaCost}
                          </Badge>
                        )}
                      </Button>
                      
                      {/* Enhanced tooltip */}
                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 w-48 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <p className="font-semibold mb-1">{ability.name}</p>
                        <p className="text-[10px]">{ability.description}</p>
                        <div className="flex justify-between mt-1">
                          <p className="text-[10px] text-amber-300">CD: {ability.cooldown} turns</p>
                          {ability.manaCost && <p className="text-[10px] text-blue-300">Mana: {ability.manaCost}</p>}
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-black/90"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render log entry with animation
  const renderLogEntry = (log: string, index: number) => {
    // Determine if the log contains damage, healing, or other effects
    const isDamage = log.includes('damage');
    const isHealing = log.includes('heal');
    const isEffect = log.includes('effect') || log.includes('poison') || log.includes('shield') || log.includes('stun');
    
    return (
      <motion.div 
        key={index}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`text-sm rounded-md px-3 py-2 my-1 ${
          isDamage 
            ? 'bg-red-900/30 text-red-200 border-l-2 border-red-700' 
            : isHealing 
              ? 'bg-green-900/30 text-green-200 border-l-2 border-green-700' 
              : isEffect
                ? 'bg-purple-900/30 text-purple-200 border-l-2 border-purple-700'
                : 'bg-stone-900/50 text-amber-200'
        }`}
      >
        {log}
      </motion.div>
    );
  };

  // Render stats card
  const renderGameStats = () => (
    <div className="bg-gradient-to-br from-stone-900/90 to-black/90 rounded-lg p-4 shadow-lg border border-amber-900/30">
      <h3 className="text-amber-300 font-bold text-lg mb-3 flex items-center">
        <Info className="h-4 w-4 mr-2" /> Battle Statistics
      </h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-900/30 p-3 rounded-lg">
          <p className="text-2xl font-bold text-green-300">{gameStats.wins}</p>
          <p className="text-xs text-green-400 uppercase tracking-wider">Victories</p>
        </div>
        <div className="bg-red-900/30 p-3 rounded-lg">
          <p className="text-2xl font-bold text-red-300">{gameStats.losses}</p>
          <p className="text-xs text-red-400 uppercase tracking-wider">Defeats</p>
        </div>
        <div className="bg-amber-900/30 p-3 rounded-lg">
          <p className="text-2xl font-bold text-amber-300">{gameStats.gamesPlayed}</p>
          <p className="text-xs text-amber-400 uppercase tracking-wider">Total Battles</p>
        </div>
      </div>
      {gameStats.lastGameResult && (
        <div className="mt-3 text-center bg-amber-900/20 rounded-md p-2">
          <p className="text-sm text-amber-200">
            Last victor: <span className="font-bold text-amber-300">{gameStats.lastGameResult}</span>
          </p>
        </div>
      )}
    </div>
  );
  
  // Helper function to render an icon by name
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = getIconByName(iconName);
    return <IconComponent className={className} />;
  };
  
  return (
    <div className="max-w-7xl w-full space-y-6">
      <div className="text-white text-center mb-4">DEBUG: BattleArenaUI component rendered</div>
      {/* Turn timer */}
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-amber-900/70 to-amber-800/50 text-amber-100 rounded-lg px-4 py-3 shadow-lg border border-amber-700/30">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-amber-300" />
          <span className="font-medium">Turn Timer:</span>
        </div>
        <div className="w-1/2 bg-amber-950/70 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              turnTimeLeft < 5 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-amber-500 to-amber-300'
            }`}
            style={{ width: `${(turnTimeLeft / 20) * 100}%` }}
          />
        </div>
        <div className="text-amber-200 font-bold text-lg">{turnTimeLeft}s</div>
      </div>

      {/* Game board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Player 1 card */}
        <div className="md:col-span-4">
          {renderPlayerCard(player1, 1)}
        </div>

        {/* Middle section with battle log */}
        <div className="md:col-span-4">
          <div className="h-full flex flex-col bg-gradient-to-br from-stone-900/90 to-black/90 rounded-lg shadow-xl border border-amber-900/30">
            <div className="bg-gradient-to-r from-amber-900/50 to-transparent p-3">
              <h3 className="text-center text-lg font-bold text-amber-300">Battle Log</h3>
            </div>
            <div className="flex-grow overflow-hidden p-2 relative">
              <ScrollArea className="h-[400px] px-1">
                <AnimatePresence>
                  {battleLog.length > 0 ? (
                    <div className="space-y-1">
                      {battleLog.map((log, index) => renderLogEntry(log, index))}
                    </div>
                  ) : (
                    <div className="text-center text-amber-400/70 p-4 italic">
                      Prepare for battle...
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
              
              {/* Fade overlay for bottom of scroll area */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
            </div>
            
            <div className="p-3 border-t border-amber-900/30 bg-stone-900/60">

              {gameOver ? (
                <Button 
                  onClick={resetGame} 
                  variant="outline" 
                  className="w-full bg-amber-900/70 text-amber-100 hover:bg-amber-800 hover:text-white border-amber-700/50"
                >
                  Return to Selection
                </Button>
              ) : (
                <Button 
                  onClick={handleAttack} 
                  className={`w-full ${
                    (player1.isActive && !player1.isComputer) || (player2.isActive && !player2.isComputer)
                      ? "bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800"
                      : "bg-stone-800/90 cursor-not-allowed"
                  } text-amber-100 shadow-lg border border-amber-700/50 flex items-center justify-center`}
                  disabled={gameOver || ((player1.isActive && player1.isComputer) || (player2.isActive && player2.isComputer))}
                >
                  <Sword className="h-4 w-4 mr-2" />
                  Basic Attack
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Player 2 card */}
        <div className="md:col-span-4">
          {renderPlayerCard(player2, 2)}
        </div>
      </div>

      {/* Bottom row - Game stats and winner announcement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Game stats */}
        <div>
          {renderGameStats()}
        </div>
        
        {/* Winner announcement */}
        <AnimatePresence>
          {gameOver && winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 rounded-lg overflow-hidden border border-amber-600/30 shadow-lg">
                <div className="bg-gradient-to-r from-amber-700/70 to-amber-800/50 p-3">
                  <h3 className="text-xl font-bold text-amber-100 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-amber-300" />
                    Battle Concluded!
                  </h3>
                </div>
                <div className="p-4 flex items-center space-x-4">
                  <div className="bg-amber-900/40 p-3 rounded-full">
                    {winner.health > winner.maxHealth * 0.7 ? (
                      <Sword className="h-12 w-12 text-amber-300" />
                    ) : winner.health > winner.maxHealth * 0.3 ? (
                      <Shield className="h-12 w-12 text-amber-300" />
                    ) : (
                      <Skull className="h-12 w-12 text-amber-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-amber-100 text-lg">
                      <span className="font-bold text-amber-200">{winner.name}</span> is victorious!
                    </p>
                    <p className="text-amber-300/90">
                      Survived with <span className="font-bold">{winner.health}</span> health remaining
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};