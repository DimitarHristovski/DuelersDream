import { Shield, Sword, Heart, Clock, Zap, Info, AlertCircle, Skull, ChevronRight, Trophy, Droplet, Sparkles, FlaskRound, Beaker, BookOpen, BatteryCharging, Atom } from 'lucide-react';
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
  
  // Helper: get last damage dealt for a player from battle log
  const getLastDamageDealt = (playerName: string): number | null => {
    for (let i = 0; i < battleLog.length; i++) {
      const log = battleLog[i];
      const lower = log.toLowerCase();
      if (!lower.includes(playerName.toLowerCase())) continue;
      // Ignore DOT/reflect/counter logs
      if (lower.includes('poison') || lower.includes('bleed') || lower.includes('reflect') || lower.includes('counter')) continue;
      const match = log.match(/(\d+)\s+damage/);
      if (match) {
        const dmg = parseInt(match[1]);
        if (!Number.isNaN(dmg)) return dmg;
      }
    }
    return null;
  };

  // Helper: compute boosted damage preview from a description string
  const getBoostedDamagePreview = (description: string, spellBoost: number, player: Player): string | null => {
    const desc = description.toLowerCase();
    // Skip non-damage abilities
    if (!desc.includes('deal')) return null;

    // Check for Monster Lore passive boost
    let totalSpellBoost = spellBoost || 0;
    const monsterLoreAbility = player.abilities.find(ability => ability.name === "Monster Lore");
    if (monsterLoreAbility) {
      const healthPercent = (player.health / player.maxHealth) * 100;
      const boostMatch = monsterLoreAbility.description.match(/increase spell damage by (\d+)%/i);
      const thresholdMatch = monsterLoreAbility.description.match(/under (\d+)% health/i);
      const boostPercent = boostMatch ? parseInt(boostMatch[1]) : 100;
      const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 50;
      
      if (healthPercent < threshold) {
        totalSpellBoost += boostPercent;
      }
    }

    if (totalSpellBoost <= 0) return null;

    // Range: "Deal A-B ... damage" or "Deal A–B ... damage" (handle both regular hyphen and en-dash)
    const rangeMatch = desc.match(/deal\s+(\d+)[–-](\d+).*damage/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);
      const bMin = Math.floor(min * (1 + totalSpellBoost / 100));
      const bMax = Math.floor(max * (1 + totalSpellBoost / 100));
      return `${bMin}-${bMax}`;
    }
    // Fixed: "Deal N damage"
    const fixedMatch = desc.match(/deal\s+(\d+)\s+damage/);
    if (fixedMatch) {
      const base = parseInt(fixedMatch[1]);
      const boosted = Math.floor(base * (1 + totalSpellBoost / 100));
      return `${boosted}`;
    }
    return null;
  };
  
  // Render player card with abilities
  const renderPlayerCard = (player: Player, playerNum: 1 | 2) => {
    const isActive = player.isActive && !gameOver;
    
    // Compute boosted attack range for UI display
    const attackBoostPercent = player.effects.attackBoost || 0;
    const boostedAttackMin = Math.floor(player.attackMin * (1 + attackBoostPercent / 100));
    const boostedAttackMax = Math.floor(player.attackMax * (1 + attackBoostPercent / 100));

    const lastDamage = getLastDamageDealt(player.name);

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
              player.effects.summonedCreature || player.effects.attackBoost > 0 || player.effects.spellDamageBoost > 0 || player.effects.repelAbilities) && (
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
                {player.effects.attackBoost > 0 && (
                  <Badge variant="outline" className="bg-red-900/30 text-red-300 border-red-700 py-1">
                    <Sword className="h-3 w-3 mr-1" />
                    +{player.effects.attackBoost}% ATK
                  </Badge>
                )}
                {player.effects.spellDamageBoost > 0 && (
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    +{player.effects.spellDamageBoost}% SPELL
                  </Badge>
                )}
                {player.effects.poisoned > 0 && (
                  <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 py-1 flex items-center gap-1">
                    <Droplet className="h-3 w-3" /> Poisoned ({player.effects.poisoned})
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
                {player.effects.untargetable && (
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700 py-1">
                    Untargetable ({player.effects.untargetableDuration})
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
                {player.effects.summonedCreatureDamageBoost > 0 && (
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700 py-1">
                    Necromancy Boost ({player.effects.summonedCreatureDamageBoostDuration})
                  </Badge>
                )}
                {player.effects.repelAbilities && (
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700 py-1">
                    Repel ({player.effects.repelAbilitiesDuration})
                  </Badge>
                )}
              </div>
            )}
            
            {/* Passive Abilities Status */}
            {(() => {
              const hasPassiveAbilities = player.abilities.some(ability => 
                ability.name === "Mutagens" || ability.name === "Monster Lore" || ability.name === "Alchemy Mastery" || 
                ability.name === "Totemic Strength" || ability.name === "Spirit Endurance" ||
                ability.name === "Elemental Mastery" || ability.name === "Mana Overflow" || ability.name === "Elemental Harmony"
              );
              
              if (!hasPassiveAbilities) return null;
              
              const healthPercent = (player.health / player.maxHealth) * 100;
              
              // Parse Mutagens - "Increase attack by X% while above Y% health"
              const mutagensAbility = player.abilities.find(ability => ability.name === "Mutagens");
              let mutagensActive = false;
              let mutagensBoost = 0;
              let mutagensThreshold = 50;
              if (mutagensAbility) {
                const boostMatch = mutagensAbility.description.match(/increase attack by (\d+)%/i);
                const thresholdMatch = mutagensAbility.description.match(/above (\d+)% health/i);
                mutagensBoost = boostMatch ? parseInt(boostMatch[1]) : 100;
                mutagensThreshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 50;
                mutagensActive = healthPercent > mutagensThreshold;
              }
              
              // Parse Monster Lore - "Increase spell damage by X% while under Y% health"
              const monsterLoreAbility = player.abilities.find(ability => ability.name === "Monster Lore");
              let monsterLoreActive = false;
              let monsterLoreBoost = 0;
              let monsterLoreThreshold = 50;
              if (monsterLoreAbility) {
                const boostMatch = monsterLoreAbility.description.match(/increase spell damage by (\d+)%/i);
                const thresholdMatch = monsterLoreAbility.description.match(/under (\d+)% health/i);
                monsterLoreBoost = boostMatch ? parseInt(boostMatch[1]) : 100;
                monsterLoreThreshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 50;
                monsterLoreActive = healthPercent < monsterLoreThreshold;
              }
              
              // Parse Alchemy Mastery - "All healing received is X% stronger while under Y% health"
              const alchemyMasteryAbility = player.abilities.find(ability => ability.name === "Alchemy Mastery");
              let alchemyMasteryActive = false;
              let alchemyMasteryBoost = 0;
              if (alchemyMasteryAbility) {
                const boostMatch = alchemyMasteryAbility.description.match(/is (\d+)% stronger/i);
                const thresholdMatch = alchemyMasteryAbility.description.match(/under (\d+)% health/i);
                alchemyMasteryBoost = boostMatch ? parseInt(boostMatch[1]) : 100;
                const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 50;
                alchemyMasteryActive = healthPercent < threshold;
              }
              
              // Parse Totemic Strength - "Regenerate X health everyturn"
              const totemicStrengthAbility = player.abilities.find(ability => ability.name === "Totemic Strength");
              let totemicStrengthActive = false;
              let totemicStrengthHeal = 0;
              if (totemicStrengthAbility) {
                const healMatch = totemicStrengthAbility.description.match(/regenerate (\d+) health everyturn/i);
                totemicStrengthHeal = healMatch ? parseInt(healMatch[1]) : 20;
                totemicStrengthActive = true; // Always active
              }
              
              // Parse Spirit Endurance - "Reincarnation" (passive with cooldown)
              const spiritEnduranceAbility = player.abilities.find(ability => ability.name === "Spirit Endurance");
              let spiritEnduranceActive = false;
              let spiritEnduranceCooldown = 0;
              if (spiritEnduranceAbility) {
                spiritEnduranceCooldown = spiritEnduranceAbility.currentCooldown || 0;
                spiritEnduranceActive = spiritEnduranceCooldown === 0; // Active when cooldown is 0
              }
              
              // Parse Elemental Mastery - "Spell immunity"
              const elementalMasteryAbility = player.abilities.find(ability => ability.name === "Elemental Mastery");
              let elementalMasteryActive = false;
              if (elementalMasteryAbility) {
                elementalMasteryActive = true; // Always active
              }
              
              // Parse Mana Overflow - "Gain +X mana at the start of your turn"
              const manaOverflowAbility = player.abilities.find(ability => ability.name === "Mana Overflow");
              let manaOverflowActive = false;
              let manaOverflowGain = 0;
              if (manaOverflowAbility) {
                const manaMatch = manaOverflowAbility.description.match(/gain \+(\d+) mana at the start of your turn/i);
                manaOverflowGain = manaMatch ? parseInt(manaMatch[1]) : 20;
                manaOverflowActive = true; // Always active
              }
              
              // Parse Elemental Harmony - "Every turn gain X% attack and X% spell damage (stacks)"
              const elementalHarmonyAbility = player.abilities.find(ability => ability.name === "Elemental Harmony");
              let elementalHarmonyActive = false;
              let elementalHarmonyAttackGain = 0;
              let elementalHarmonySpellGain = 0;
              if (elementalHarmonyAbility) {
                const attackMatch = elementalHarmonyAbility.description.match(/(\d+)% attack/i);
                const spellMatch = elementalHarmonyAbility.description.match(/(\d+)% spell damage/i);
                elementalHarmonyAttackGain = attackMatch ? parseInt(attackMatch[1]) : 1;
                elementalHarmonySpellGain = spellMatch ? parseInt(spellMatch[1]) : 1;
                elementalHarmonyActive = true; // Always active
              }
              
              return (
                <div className="flex flex-wrap gap-1.5">
                  {mutagensActive && (
                    <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 py-1">
                      <Beaker className="h-3 w-3 mr-1" />
                      Mutagens Active (+{mutagensBoost}% ATK)
                    </Badge>
                  )}
                  {monsterLoreActive && (
                    <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700 py-1">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Monster Lore Active (+{monsterLoreBoost}% SPELL)
                    </Badge>
                  )}
                  {alchemyMasteryActive && (
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700 py-1">
                      <FlaskRound className="h-3 w-3 mr-1" />
                      Alchemy Mastery Active (+{alchemyMasteryBoost}% HEAL)
                    </Badge>
                  )}
                  {totemicStrengthActive && (
                    <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700 py-1">
                      <Heart className="h-3 w-3 mr-1" />
                      Totemic Strength Active (+{totemicStrengthHeal} HP/turn)
                    </Badge>
                  )}
                  {spiritEnduranceActive && (
                    <Badge variant="outline" className="bg-yellow-900/30 text-yellow-300 border-yellow-700 py-1">
                      <Skull className="h-3 w-3 mr-1" />
                      Spirit Endurance Ready
                    </Badge>
                  )}
                  {!spiritEnduranceActive && spiritEnduranceAbility && (
                    <Badge variant="outline" className="bg-gray-900/30 text-gray-300 border-gray-700 py-1">
                      <Skull className="h-3 w-3 mr-1" />
                      Spirit Endurance ({spiritEnduranceCooldown})
                    </Badge>
                  )}
                  {elementalMasteryActive && (
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700 py-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Elemental Mastery Active
                    </Badge>
                  )}
                  {manaOverflowActive && (
                    <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      Mana Overflow Active (+{manaOverflowGain} MP/turn)
                    </Badge>
                  )}
                  {elementalHarmonyActive && (
                    <Badge variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-700 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Elemental Harmony Active (+{elementalHarmonyAttackGain}% ATK, +{elementalHarmonySpellGain}% SPELL/turn)
                    </Badge>
                  )}
                </div>
              );
            })()}
            
            <div className="flex items-center space-x-2 text-sm text-amber-200">
              <Sword className="h-4 w-4 text-amber-400" />
              <span>
                Attack: {player.attackMin}-{player.attackMax}
                {attackBoostPercent > 0 && (
                  <>
                    {' '}(<span className="text-amber-300 font-semibold">{boostedAttackMin}-{boostedAttackMax}</span>)
                  </>
                )}
              </span>
            </div>
            {player.effects.spellDamageBoost > 0 && (
              <div className="flex items-center space-x-2 text-sm text-amber-200">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span>Spell Power: +{player.effects.spellDamageBoost}%</span>
              </div>
            )}
            {lastDamage !== null && (
              <div className="flex items-center space-x-2 text-sm text-amber-200">
                <Sword className="h-4 w-4 text-red-300" />
                <span>Last Damage: <span className="text-red-300 font-semibold">{lastDamage}</span></span>
              </div>
            )}
            
            {/* Abilities section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-amber-200">Abilities</h4>
              <div className="grid grid-cols-3 gap-2">
                {player.abilities.map((ability, index) => {
                  const isDisabled = (ability.currentCooldown || 0) > 0;
                  const notEnoughMana = ability.manaCost && player.mana < ability.manaCost;
                  const isPassive = (ability.cooldown === 0 && ability.manaCost === 0) || 
                    ability.name === "Mutagens" || ability.name === "Monster Lore" || 
                    ability.name === "Alchemy Mastery" || ability.name === "Totemic Strength" || 
                    ability.name === "Spirit Endurance" || ability.name === "Elemental Mastery" ||
                    ability.name === "Mana Overflow" || ability.name === "Elemental Harmony";
                  const spellBoost = player.effects.spellDamageBoost || 0;
                  const boostedPreview = getBoostedDamagePreview(ability.description, spellBoost, player);
                  
                  return (
                    <div className="relative group" key={`${player.name}-ability-${index}`}>
                      <Button 
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`flex flex-col items-center justify-center p-2 h-auto text-xs relative w-full
                          ${isDisabled || notEnoughMana || isPassive
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-amber-700'
                          }
                          ${isActive && !isDisabled && !notEnoughMana && !isPassive ? 'bg-amber-800 text-amber-100' : 'bg-stone-800/50 text-stone-300'}
                        `}
                        onClick={() => !isPassive && handleAbilityUse(playerNum, index)}
                        disabled={isDisabled || notEnoughMana || isPassive}
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
                        {isPassive && (
                          <div className="text-[9px] text-green-300/80 mt-0.5">Passive</div>
                        )}
                        {boostedPreview && !isPassive && (
                          <div className="text-[9px] text-amber-200/80 mt-0.5">→ {boostedPreview}</div>
                        )}
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
                        {boostedPreview && (
                          <div className="mt-1 text-[10px] text-purple-300 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> With Surge: {boostedPreview}
                          </div>
                        )}
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