import { useState } from 'react';
import { Shield, Sword, Heart, Clock, Zap, Info, AlertCircle, Skull, ChevronRight, Trophy, Droplet, Sparkles, FlaskRound, Beaker, BookOpen, Keyboard, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Player } from './abilities';
import { PLAYER_CLASSES, getIconByName } from './class-data';
import { isPassiveAbility } from '@/lib/is-passive-ability';
import {
  passiveAttackWhileLowHp,
  passiveConditionalAttackBoost,
  passiveCooldownTrimSecondsPerPulse,
  passiveDamageReductionWhileHealthy,
  passiveEvasionPercentPerPulse,
  passiveHarmonyGains,
  passiveHpBurstHeal,
  passiveLifestealBasicPercent,
  passiveManaBurstGain,
  passiveReflectPercentFromAttacks,
  passiveShieldBurstGain,
  passiveSpellDamageWhileHighHealth,
  passiveSpellDamageWhileHighMana,
  passiveSpellDamageWhileLow,
} from '@/lib/passive-runtime';
import { motion, AnimatePresence } from 'framer-motion';
import { BattlefieldPanel } from './BattlefieldPanel';

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
  handleAttack: () => void;
  handleAbilityUse: (playerNum: 1 | 2, abilityIndex: number) => void;
  resetGame: () => void;
  gameStats: GameStats;
  aiThinking?: boolean;
  /** When true, basic attack is automatic for human turns; no Basic Attack button. */
  basicAttackAutomatic?: boolean;
}

export const BattleArenaUI = ({
  player1,
  player2,
  gameOver,
  winner,
  battleLog,
  handleAttack,
  handleAbilityUse,
  resetGame,
  gameStats,
  aiThinking = false,
  basicAttackAutomatic = true,
}: BattleArenaUIProps) => {
  const [logOpen, setLogOpen] = useState(false);

  const anyHumanPlayer = !player1.isComputer || !player2.isComputer;

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

    let totalSpellBoost = spellBoost || 0;
    const spellLow = passiveSpellDamageWhileLow(player);
    if (spellLow) {
      const healthPercent = (player.health / player.maxHealth) * 100;
      if (healthPercent < spellLow.threshold) {
        totalSpellBoost += spellLow.boost;
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
    const isActive = !gameOver && !player.isComputer;
    const sideTheme =
      playerNum === 1
        ? {
            ring: 'from-amber-300 via-yellow-200 to-amber-100',
            card: 'from-duel-parchment/95 via-stone-50/98 to-stone-100/90',
            header: 'from-amber-100/95 to-yellow-50/85',
            border: 'border-amber-300/90',
            accent: 'text-amber-950',
            accentSoft: 'text-amber-900/90',
            skillIconBg: 'from-amber-100 to-yellow-50',
            skillIconFg: 'text-amber-900',
            skillBtn: 'border-amber-200 bg-white hover:bg-amber-50/95 hover:border-amber-400',
            skillBtnActive: 'border-amber-500 bg-amber-50 shadow-md',
          }
        : {
            ring: 'from-rose-400 via-red-200 to-rose-100',
            card: 'from-rose-50/95 via-stone-50/95 to-stone-100/90',
            header: 'from-rose-100/95 to-red-50/85',
            border: 'border-rose-300/90',
            accent: 'text-rose-950',
            accentSoft: 'text-rose-900/90',
            skillIconBg: 'from-rose-100 to-red-50',
            skillIconFg: 'text-rose-900',
            skillBtn: 'border-rose-200 bg-white hover:bg-rose-50/95 hover:border-rose-400',
            skillBtnActive: 'border-rose-500 bg-rose-50 shadow-md',
          };

    // Compute boosted attack range for UI display
    const attackBoostPercent = player.effects.attackBoost || 0;
    const boostedAttackMin = Math.floor(player.attackMin * (1 + attackBoostPercent / 100));
    const boostedAttackMax = Math.floor(player.attackMax * (1 + attackBoostPercent / 100));

    const lastDamage = getLastDamageDealt(player.name);

    return (
      <div className={`relative h-full ${isActive ? 'z-10' : 'z-0'}`}>
        {isActive && (
          <div
            className={`absolute -inset-[3px] rounded-2xl bg-gradient-to-br ${sideTheme.ring} opacity-90 blur-[1px] -z-10`}
          />
        )}

        <Card
          className={`h-full border-2 ${sideTheme.border} shadow-lg shadow-slate-200/50 bg-gradient-to-br ${sideTheme.card}`}
        >
          <CardHeader className={`pb-2 rounded-t-xl border-b border-slate-200/60 bg-gradient-to-r ${sideTheme.header}`}>
            <CardTitle className={`font-display flex justify-between items-center ${sideTheme.accent}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${sideTheme.skillIconBg} shadow-inner border border-white/80`}
                >
                  {(() => {
                    try {
                      const classData = PLAYER_CLASSES[player.className as keyof typeof PLAYER_CLASSES];
                      if (classData && classData.abilities && classData.abilities[0]) {
                        return renderIcon(classData.abilities[0].iconName, `h-5 w-5 ${sideTheme.skillIconFg}`);
                      }
                      return <Sword className={`h-5 w-5 ${sideTheme.skillIconFg}`} />;
                    } catch (error) {
                      console.error('Error rendering icon:', error);
                      return <Sword className={`h-5 w-5 ${sideTheme.skillIconFg}`} />;
                    }
                  })()}
                </span>
                <span className="truncate font-semibold tracking-tight">{player.name}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                {player.isComputer && (
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 font-medium">
                    AI
                  </Badge>
                )}
                {isActive && (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-800 border-emerald-300 font-medium shadow-sm"
                  >
                    You
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription className={`${sideTheme.accentSoft} text-xs mt-1`}>
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
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>Health</span>
                  </div>
                  <span
                    className={`tabular-nums ${player.health < player.maxHealth * 0.3 ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}
                  >
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-rose-100 border border-rose-200/80 overflow-hidden shadow-inner">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                      player.health < player.maxHealth * 0.3
                        ? 'bg-gradient-to-r from-rose-500 to-orange-400 animate-pulse'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Mana bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-indigo-500" />
                    <span>Mana</span>
                  </div>
                  <span className="tabular-nums text-indigo-700">{player.mana}/{player.maxMana}</span>
                </div>
                <div className="relative h-3 rounded-full bg-indigo-100 border border-indigo-200/80 overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
                    style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                  />
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
                  <Badge variant="outline" className="bg-sky-100 text-sky-900 border-sky-300 py-1 font-medium">
                    <Shield className="h-3 w-3 mr-1 text-sky-600" />
                    Shield {player.effects.shield}%
                  </Badge>
                )}
                {player.effects.damageBoost > 0 && (
                  <Badge variant="outline" className="bg-rose-100 text-rose-900 border-rose-300 py-1 font-medium">
                    <Sword className="h-3 w-3 mr-1 text-rose-600" />
                    +{player.effects.damageBoost}% DMG
                  </Badge>
                )}
                {player.effects.attackBoost > 0 && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-900 border-orange-300 py-1 font-medium">
                    <Sword className="h-3 w-3 mr-1 text-orange-600" />
                    +{player.effects.attackBoost}% ATK
                  </Badge>
                )}
                {player.effects.spellDamageBoost > 0 && (
                  <Badge variant="outline" className="bg-violet-100 text-violet-900 border-violet-300 py-1 font-medium">
                    <Sparkles className="h-3 w-3 mr-1 text-violet-600" />
                    +{player.effects.spellDamageBoost}% SPELL
                  </Badge>
                )}
                {player.effects.poisoned > 0 && (
                  <Badge variant="outline" className="bg-lime-100 text-lime-900 border-lime-300 py-1 font-medium flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-lime-700" /> Poisoned ({player.effects.poisoned})
                  </Badge>
                )}
                {player.effects.bleeding > 0 && (
                  <Badge variant="outline" className="bg-red-100 text-red-900 border-red-300 py-1 font-medium">
                    Bleeding ({player.effects.bleeding})
                  </Badge>
                )}
                {player.effects.evading && (
                  <Badge variant="outline" className="bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 py-1 font-medium">
                    Evading
                  </Badge>
                )}
                {player.effects.untargetable && (
                  <Badge variant="outline" className="bg-slate-200 text-slate-800 border-slate-400 py-1 font-medium">
                    Untargetable ({player.effects.untargetableDuration})
                  </Badge>
                )}
                {player.effects.stunned && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-400 py-1 font-medium animate-pulse">
                    Stunned
                  </Badge>
                )}
                {player.effects.regeneration > 0 && (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 py-1 font-medium">
                    Regen ({player.effects.regeneration})
                  </Badge>
                )}
                {player.effects.attackReduction > 0 && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 py-1 font-medium">
                    -{player.effects.attackReduction}% ATK
                  </Badge>
                )}
                {player.effects.summonedCreature && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-900 border-purple-300 py-1 font-medium">
                    Summon ({player.effects.summonedCreature.turnsLeft})
                  </Badge>
                )}
                {player.effects.summonedCreatureDamageBoost > 0 && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-900 border-purple-300 py-1 font-medium">
                    Necromancy Boost ({player.effects.summonedCreatureDamageBoostDuration})
                  </Badge>
                )}
                {player.effects.repelAbilities && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-300 py-1 font-medium">
                    Repel ({player.effects.repelAbilitiesDuration})
                  </Badge>
                )}
              </div>
            )}
            
            {/* Passive Abilities Status */}
            {(() => {
              const hasPassiveAbilities = player.abilities.some((ability) => isPassiveAbility(ability));
              
              if (!hasPassiveAbilities) return null;
              
              const healthPercent = (player.health / player.maxHealth) * 100;
              
              const atkPassive = passiveConditionalAttackBoost(player);
              let mutagensActive = false;
              let mutagensBoost = 0;
              let mutagensThreshold = 50;
              if (atkPassive) {
                mutagensBoost = atkPassive.boost;
                mutagensThreshold = atkPassive.threshold;
                mutagensActive = healthPercent > mutagensThreshold;
              }

              const spellLowPassive = passiveSpellDamageWhileLow(player);
              let spellLowActive = false;
              let spellLowBoost = 0;
              let spellLowThreshold = 50;
              if (spellLowPassive) {
                spellLowBoost = spellLowPassive.boost;
                spellLowThreshold = spellLowPassive.threshold;
                spellLowActive = healthPercent < spellLowThreshold;
              }

              const manaPercent = player.maxMana > 0 ? (player.mana / player.maxMana) * 100 : 0;
              const spellHighManaPassive = passiveSpellDamageWhileHighMana(player);
              let spellHighManaActive = false;
              if (spellHighManaPassive) {
                spellHighManaActive = manaPercent > spellHighManaPassive.threshold;
              }
              const spellHighHpPassive = passiveSpellDamageWhileHighHealth(player);
              let spellHighHpActive = false;
              if (spellHighHpPassive) {
                spellHighHpActive = healthPercent > spellHighHpPassive.threshold;
              }

              const atkLowPassive = passiveAttackWhileLowHp(player);
              let atkLowActive = false;
              if (atkLowPassive) {
                atkLowActive = healthPercent < atkLowPassive.threshold;
              }

              const drPassive = passiveDamageReductionWhileHealthy(player);
              let drPassiveActive = false;
              if (drPassive) {
                drPassiveActive = healthPercent > drPassive.threshold;
              }

              const thornsPct = passiveReflectPercentFromAttacks(player);
              const siphonPct = passiveLifestealBasicPercent(player);
              const evaPulse = passiveEvasionPercentPerPulse(player);
              const cadenceTrim = passiveCooldownTrimSecondsPerPulse(player);

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
              
              const passiveHealBurst = passiveHpBurstHeal(player);
              const totemicStrengthActive = passiveHealBurst > 0;
              const totemicStrengthHeal = passiveHealBurst;
              
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
              
              const manaOverflowGain = passiveManaBurstGain(player);
              const manaOverflowActive = manaOverflowGain > 0;

              const harmony = passiveHarmonyGains(player);
              let elementalHarmonyActive = false;
              let elementalHarmonyAttackGain = 0;
              let elementalHarmonySpellGain = 0;
              if (harmony) {
                elementalHarmonyAttackGain = harmony.attack;
                elementalHarmonySpellGain = harmony.spell;
                elementalHarmonyActive = true;
              }

              const shieldPassiveGain = passiveShieldBurstGain(player);
              const shieldPassiveActive = shieldPassiveGain > 0;
              
              return (
                <Collapsible className="space-y-1">
                <CollapsibleTrigger className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-semibold shadow-sm [&[data-state=open]>svg]:rotate-90 ${playerNum === 1 ? 'border-amber-200 bg-amber-50/80 text-amber-950 hover:bg-amber-50' : 'border-rose-200 bg-rose-50/80 text-rose-950 hover:bg-rose-50'}`}>
                  <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${playerNum === 1 ? 'text-amber-700' : 'text-rose-700'}`} />
                  <Wand2 className={`h-3.5 w-3.5 ${playerNum === 1 ? 'text-amber-600' : 'text-rose-600'}`} />
                  Passives &amp; auras
                </CollapsibleTrigger>
                <CollapsibleContent>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mutagensActive && (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 py-1 font-medium">
                      <Beaker className="h-3 w-3 mr-1 text-emerald-600" />
                      Attack passive (+{mutagensBoost}% ATK)
                    </Badge>
                  )}
                  {spellLowActive && (
                    <Badge variant="outline" className="bg-violet-100 text-violet-900 border-violet-300 py-1 font-medium">
                      <BookOpen className="h-3 w-3 mr-1 text-violet-600" />
                      Spell surge (+{spellLowBoost}% SPELL)
                    </Badge>
                  )}
                  {spellHighManaPassive && spellHighManaActive && (
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-900 border-indigo-300 py-1 font-medium">
                      <Sparkles className="h-3 w-3 mr-1 text-indigo-600" />
                      Reservoir (+{spellHighManaPassive.boost}% SPELL)
                    </Badge>
                  )}
                  {spellHighHpPassive && spellHighHpActive && (
                    <Badge variant="outline" className="bg-cyan-100 text-cyan-900 border-cyan-300 py-1 font-medium">
                      <Sparkles className="h-3 w-3 mr-1 text-cyan-600" />
                      Luminous (+{spellHighHpPassive.boost}% SPELL)
                    </Badge>
                  )}
                  {atkLowPassive && atkLowActive && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-900 border-orange-300 py-1 font-medium">
                      <Sword className="h-3 w-3 mr-1 text-orange-600" />
                      Desperation (+{atkLowPassive.boost}% ATK)
                    </Badge>
                  )}
                  {drPassive && drPassiveActive && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-900 border-slate-300 py-1 font-medium">
                      <Shield className="h-3 w-3 mr-1 text-slate-600" />
                      Bulwark (-{drPassive.percent}% taken)
                    </Badge>
                  )}
                  {thornsPct > 0 && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-950 border-amber-300 py-1 font-medium">
                      <Zap className="h-3 w-3 mr-1 text-amber-700" />
                      Thorns ({thornsPct}% reflect)
                    </Badge>
                  )}
                  {siphonPct > 0 && (
                    <Badge variant="outline" className="bg-rose-100 text-rose-900 border-rose-300 py-1 font-medium">
                      <Droplet className="h-3 w-3 mr-1 text-rose-600" />
                      Siphon basics ({siphonPct}%)
                    </Badge>
                  )}
                  {evaPulse > 0 && (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 py-1 font-medium">
                      <Zap className="h-3 w-3 mr-1 text-emerald-600" />
                      Footing ({evaPulse}% eva pulse)
                    </Badge>
                  )}
                  {cadenceTrim > 0 && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-300 py-1 font-medium">
                      <Clock className="h-3 w-3 mr-1 text-blue-600" />
                      Cadence (-{cadenceTrim}s CD / surge)
                    </Badge>
                  )}
                  {alchemyMasteryActive && (
                    <Badge variant="outline" className="bg-sky-100 text-sky-900 border-sky-300 py-1 font-medium">
                      <FlaskRound className="h-3 w-3 mr-1 text-sky-600" />
                      Alchemy Mastery (+{alchemyMasteryBoost}% HEAL)
                    </Badge>
                  )}
                  {totemicStrengthActive && (
                    <Badge variant="outline" className="bg-teal-100 text-teal-900 border-teal-300 py-1 font-medium">
                      <Heart className="h-3 w-3 mr-1 text-teal-600" />
                      Vitality (+{totemicStrengthHeal} HP / burst)
                    </Badge>
                  )}
                  {shieldPassiveActive && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-900 border-slate-300 py-1 font-medium">
                      <Shield className="h-3 w-3 mr-1 text-slate-600" />
                      Ward refresh (+{shieldPassiveGain})
                    </Badge>
                  )}
                  {spiritEnduranceActive && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 py-1 font-medium">
                      <Skull className="h-3 w-3 mr-1 text-amber-700" />
                      Spirit Endurance ready
                    </Badge>
                  )}
                  {!spiritEnduranceActive && spiritEnduranceAbility && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 py-1 font-medium">
                      <Skull className="h-3 w-3 mr-1 text-slate-500" />
                      Spirit Endurance ({spiritEnduranceCooldown}s)
                    </Badge>
                  )}
                  {elementalMasteryActive && (
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-900 border-indigo-300 py-1 font-medium">
                      <Shield className="h-3 w-3 mr-1 text-indigo-600" />
                      Elemental Mastery
                    </Badge>
                  )}
                  {manaOverflowActive && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-900 border-purple-300 py-1 font-medium">
                      <Zap className="h-3 w-3 mr-1 text-purple-600" />
                      Mana Overflow (+{manaOverflowGain} MP)
                    </Badge>
                  )}
                  {elementalHarmonyActive && (
                    <Badge variant="outline" className="bg-cyan-100 text-cyan-900 border-cyan-300 py-1 font-medium">
                      <Sparkles className="h-3 w-3 mr-1 text-cyan-600" />
                      Elemental Harmony (+{elementalHarmonyAttackGain}% ATK, +{elementalHarmonySpellGain}% SPELL)
                    </Badge>
                  )}
                </div>
                </CollapsibleContent>
                </Collapsible>
              );
            })()}
            
            <div className={`flex items-center gap-2 text-sm rounded-lg border px-2.5 py-2 ${playerNum === 1 ? 'text-amber-950 bg-amber-50/90 border-amber-200/80' : 'text-rose-950 bg-rose-50/90 border-rose-200/80'}`}>
              <Sword className={`h-4 w-4 shrink-0 ${playerNum === 1 ? 'text-amber-700' : 'text-rose-700'}`} />
              <span>
                Attack: {player.attackMin}-{player.attackMax}
                {attackBoostPercent > 0 && (
                  <>
                    {' '}(<span className={`font-semibold ${playerNum === 1 ? 'text-amber-800' : 'text-rose-800'}`}>{boostedAttackMin}-{boostedAttackMax}</span>)
                  </>
                )}
              </span>
            </div>
            {player.effects.spellDamageBoost > 0 && (
              <div className={`flex items-center gap-2 text-sm rounded-lg border px-2.5 py-2 ${playerNum === 1 ? 'text-amber-950 bg-amber-50 border-amber-200/80' : 'text-rose-950 bg-rose-50 border-rose-200/80'}`}>
                <Sparkles className={`h-4 w-4 shrink-0 ${playerNum === 1 ? 'text-amber-700' : 'text-rose-700'}`} />
                <span>Spell power: +{player.effects.spellDamageBoost}%</span>
              </div>
            )}
            {lastDamage !== null && (
              <div className="flex items-center gap-2 text-sm text-slate-700 rounded-lg bg-rose-50 border border-rose-200/80 px-2.5 py-2">
                <Sword className="h-4 w-4 text-rose-500 shrink-0" />
                <span>
                  Last hit: <span className="text-rose-700 font-bold tabular-nums">{lastDamage}</span>
                </span>
              </div>
            )}
            
            {/* Abilities — skill tiles with icons & key hints */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-sm font-semibold flex items-center gap-1.5 ${playerNum === 1 ? 'text-amber-950' : 'text-rose-950'}`}>
                  <Wand2 className={`h-4 w-4 ${playerNum === 1 ? 'text-amber-700' : 'text-rose-700'}`} />
                  Skills
                </h4>
                {!player.isComputer && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Keyboard className="h-3 w-3" />
                    {playerNum === 1 ? '1–6' : '6–9'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {player.abilities.map((ability, index) => {
                  const isDisabled = (ability.currentCooldown || 0) > 0;
                  const notEnoughMana = ability.manaCost && player.mana < ability.manaCost;
                  const isPassive = isPassiveAbility(ability);
                  const spellBoost = player.effects.spellDamageBoost || 0;
                  const boostedPreview = getBoostedDamagePreview(ability.description, spellBoost, player);
                  const slotKey = playerNum === 1 ? String(index + 1) : String(index + 6);
                  const canUse = isActive && !isDisabled && !notEnoughMana && !isPassive;
                  
                  return (
                    <div className="relative group" key={`${player.name}-ability-${index}`}>
                      <Button 
                        variant="outline"
                        size="sm"
                        className={`flex flex-col items-stretch p-0 h-auto min-h-[112px] relative w-full overflow-hidden rounded-xl border-2 transition-all
                          ${isPassive || player.isComputer ? 'opacity-60 cursor-not-allowed' : ''}
                          ${canUse ? `${sideTheme.skillBtnActive} ${sideTheme.skillBtn}` : `${sideTheme.skillBtn}`}
                          ${isDisabled || notEnoughMana ? 'opacity-55' : ''}
                        `}
                        onClick={() => !isPassive && !player.isComputer && handleAbilityUse(playerNum, index)}
                        disabled={isDisabled || notEnoughMana || isPassive || player.isComputer}
                      >
                        <div className="flex items-start justify-between gap-1 px-2 pt-1.5 w-full">
                          <kbd className="pointer-events-none inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-slate-300 bg-slate-100 px-1 font-mono text-[10px] font-bold text-slate-600 shadow-sm">
                            {slotKey}
                          </kbd>
                          <div className="flex flex-col items-end gap-1 min-w-0">
                            {!isPassive && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100/95 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 border border-slate-200/90 shadow-sm">
                                <Clock className="h-2.5 w-2.5 shrink-0 opacity-80" />
                                {ability.cooldown}s
                              </span>
                            )}
                            {isPassive ? (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100/95 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-900 border border-emerald-200/90">
                                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                                Passive
                              </span>
                            ) : ability.manaCost ? (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-800 border border-indigo-200">
                                <Zap className="h-2.5 w-2.5 shrink-0" />
                                {ability.manaCost}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-900 border border-amber-200/90">
                                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${sideTheme.skillIconBg} border-2 border-white/90 shadow-md ring-2 ring-black/[0.06]`}>
                          {(() => {
                            try {
                              if (ability.iconName) {
                                const IconComponent = getIconByName(ability.iconName);
                                return <IconComponent className={`h-8 w-8 ${sideTheme.skillIconFg}`} strokeWidth={1.75} />;
                              }
                              return <Sword className={`h-8 w-8 ${sideTheme.skillIconFg}`} strokeWidth={1.75} />;
                            } catch (error) {
                              console.error('Error rendering ability icon:', error);
                              return <Sword className={`h-8 w-8 ${sideTheme.skillIconFg}`} strokeWidth={1.75} />;
                            }
                          })()}
                        </div>
                        <div className="px-1.5 pb-1.5 pt-0.5 text-center w-full">
                          <div className="text-[10px] font-semibold text-slate-800 leading-tight line-clamp-2 min-h-[2.25rem]">
                            {ability.name}
                          </div>
                          {boostedPreview && !isPassive && (
                            <div className="text-[9px] text-violet-700 font-medium mt-0.5">→ {boostedPreview}</div>
                          )}
                        </div>
                        {(ability.currentCooldown || 0) > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[1px] rounded-xl">
                            <Badge className="bg-slate-800 text-white border border-slate-600 shadow-md text-[10px] px-2 py-0.5 gap-1">
                              <Clock className="h-3 w-3" /> {ability.currentCooldown}s
                            </Badge>
                          </div>
                        )}
                        {notEnoughMana && !isDisabled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-amber-50/90 backdrop-blur-[1px] rounded-xl">
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] px-2 py-0.5 gap-1">
                              <AlertCircle className="h-3 w-3" /> No mana
                            </Badge>
                          </div>
                        )}
                      </Button>
                      
                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 w-52 bg-black text-white text-xs rounded-lg border border-neutral-600 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <p className="font-semibold mb-1 flex items-center gap-1.5 text-white">
                          {(() => {
                            try {
                              if (ability.iconName) {
                                const Icon = getIconByName(ability.iconName);
                                return <Icon className="h-4 w-4 text-amber-300 shrink-0" />;
                              }
                              return null;
                            } catch {
                              return null;
                            }
                          })()}
                          {ability.name}
                        </p>
                        <p className="text-[10px] text-zinc-300 leading-snug">{ability.description}</p>
                        <div className="flex justify-between mt-2 pt-2 border-t border-neutral-600">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-200">
                            <Clock className="h-3 w-3 text-zinc-400" /> {ability.cooldown}s CD
                          </span>
                          {ability.manaCost && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-200">
                              <Zap className="h-3 w-3 text-zinc-400" /> {ability.manaCost} MP
                            </span>
                          )}
                        </div>
                        {boostedPreview && (
                          <div className="mt-2 text-[10px] text-zinc-200 flex items-center gap-1 font-medium">
                            <Sparkles className="h-3 w-3 text-amber-300" /> Surge: {boostedPreview}
                          </div>
                        )}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full border-8 border-transparent border-t-black drop-shadow-sm" />
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
        className={`text-sm rounded-lg px-3 py-2 my-1 border shadow-sm ${
          isDamage 
            ? 'bg-rose-950/50 text-rose-100 border-rose-800/50 border-l-4 border-l-rose-500' 
            : isHealing 
              ? 'bg-emerald-950/50 text-emerald-100 border-emerald-800/50 border-l-4 border-l-emerald-500' 
              : isEffect
                ? 'bg-violet-950/40 text-violet-100 border-violet-800/40 border-l-4 border-l-violet-500'
                : 'bg-stone-900/60 text-stone-200 border-stone-700/50 border-l-4 border-l-duel-brass/60'
        }`}
      >
        {log}
      </motion.div>
    );
  };

  // Render stats card
  const renderGameStats = () => (
    <div className="rounded-xl p-4 shadow-md border border-duel-brass/20 bg-gradient-to-br from-duel-void/90 to-duel-ink/95">
      <h3 className="text-duel-parchment font-display font-bold text-lg mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-duel-brass/15 border border-duel-brass/35">
          <Info className="h-4 w-4 text-duel-brass" />
        </span>
        Battle statistics
      </h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-emerald-950/40 border border-emerald-700/40 p-3 rounded-xl">
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">{gameStats.wins}</p>
          <p className="text-[10px] text-emerald-500/90 uppercase tracking-wider font-semibold">Wins</p>
        </div>
        <div className="bg-rose-950/40 border border-rose-700/40 p-3 rounded-xl">
          <p className="text-2xl font-bold text-rose-400 tabular-nums">{gameStats.losses}</p>
          <p className="text-[10px] text-rose-400/90 uppercase tracking-wider font-semibold">Losses</p>
        </div>
        <div className="bg-duel-brass/10 border border-duel-brass/30 p-3 rounded-xl">
          <p className="text-2xl font-bold text-duel-brass tabular-nums">{gameStats.gamesPlayed}</p>
          <p className="text-[10px] text-duel-mist uppercase tracking-wider font-semibold">Total</p>
        </div>
      </div>
      {gameStats.lastGameResult && (
        <div className="mt-3 text-center rounded-lg border border-duel-brass/15 bg-duel-void/80 p-2">
          <p className="text-sm text-duel-mist">
            Last victor: <span className="font-bold text-duel-brass">{gameStats.lastGameResult}</span>
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
  
  const recentEvents = battleLog.slice(0, 3);

  return (
    <div className="max-w-7xl w-full space-y-6 rounded-2xl border border-duel-brass/20 bg-duel-ink/75 backdrop-blur-md p-4 md:p-6 shadow-2xl shadow-black/40">
      {/* Game board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Player 1 card */}
        <div className="md:col-span-4">
          {renderPlayerCard(player1, 1)}
        </div>

        {/* Middle: battlefield + log */}
        <div className="md:col-span-4 flex flex-col gap-3 min-h-0">
          <BattlefieldPanel
            player1={player1}
            player2={player2}
            battleLog={battleLog}
            aiThinking={aiThinking}
            gameOver={gameOver}
            basicAttackAutomatic={basicAttackAutomatic}
          />

          <div className="flex flex-col flex-1 min-h-0 rounded-xl shadow-lg border border-duel-brass/20 bg-gradient-to-b from-duel-void/95 to-duel-ink/98 overflow-hidden">
            <div className="bg-gradient-to-r from-duel-brass/10 to-duel-wine/10 border-b border-duel-brass/20 p-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-display font-bold text-duel-parchment flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-duel-brass" />
                Recent events
              </h3>
              <Sheet open={logOpen} onOpenChange={setLogOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-duel-brass/30 bg-duel-ink text-duel-parchment text-xs h-8 hover:bg-duel-brass/15">
                    Full log ({battleLog.length})
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md bg-duel-ink border-duel-brass/25 text-duel-parchment">
                  <SheetHeader>
                    <SheetTitle className="text-duel-parchment font-display">Full battle log</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-3">
                    <div className="space-y-1">
                      {battleLog.map((log, index) => renderLogEntry(log, index))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex-grow overflow-hidden p-2 relative min-h-[140px] bg-duel-void/40">
              <AnimatePresence>
                {recentEvents.length > 0 ? (
                  <div className="space-y-1">
                    {recentEvents.map((log, index) => renderLogEntry(log, index))}
                  </div>
                ) : (
                  <div className="text-center text-duel-mist p-4 italic text-sm flex flex-col items-center gap-2">
                    <Sword className="h-8 w-8 text-duel-brass/40" />
                    Prepare for battle…
                  </div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-duel-ink/95 to-transparent pointer-events-none" />
            </div>

            <div className="p-3 border-t border-duel-brass/15 bg-duel-ink/90">
              {gameOver ? (
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full bg-duel-brass text-duel-void hover:bg-amber-400 border-duel-brass font-display tracking-wide"
                >
                  Return to Selection
                </Button>
              ) : basicAttackAutomatic ? (
                anyHumanPlayer ? (
                  <p className="text-center text-xs sm:text-sm text-duel-mist leading-relaxed px-1 flex flex-wrap items-center justify-center gap-1">
                    <Keyboard className="h-3.5 w-3.5 text-duel-brass/80 shrink-0" />
                    <span>
                      <span className="font-semibold text-duel-brass">You</span>: <kbd className="px-1 rounded border border-duel-brass/30 bg-duel-void text-[10px] text-duel-parchment">1–6</kbd>{' '}
                      skills · <kbd className="px-1 rounded border border-duel-brass/30 bg-duel-void text-[10px] text-duel-parchment">Space</kbd> strike — AI opponent
                    </span>
                  </p>
                ) : (
                  <p className="text-center text-xs text-duel-mist/80 italic">
                    {aiThinking ? 'AI is acting…' : 'AI vs AI'}
                  </p>
                )
              ) : (
                <Button
                  onClick={handleAttack}
                  className={`w-full font-display tracking-wide ${
                    anyHumanPlayer
                      ? 'bg-gradient-to-r from-duel-brass to-duel-flame hover:from-amber-400 hover:to-duel-flame text-duel-void'
                      : 'bg-duel-elevated cursor-not-allowed text-duel-mist'
                  } shadow-md border border-duel-brass/30 flex items-center justify-center`}
                  disabled={gameOver}
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
              <div className="rounded-xl overflow-hidden border border-duel-brass/35 bg-gradient-to-br from-duel-ink via-duel-void to-duel-ink shadow-lg">
                <div className="bg-gradient-to-r from-duel-brass/20 to-duel-wine/20 p-3 border-b border-duel-brass/25">
                  <h3 className="text-xl font-display font-bold text-duel-parchment flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-duel-brass" />
                    Battle concluded
                  </h3>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="bg-duel-void border-2 border-duel-brass/40 p-3 rounded-2xl shadow-inner">
                    {winner.health > winner.maxHealth * 0.7 ? (
                      <Sword className="h-12 w-12 text-duel-brass" />
                    ) : winner.health > winner.maxHealth * 0.3 ? (
                      <Shield className="h-12 w-12 text-emerald-500" />
                    ) : (
                      <Skull className="h-12 w-12 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-duel-parchment text-lg">
                      <span className="font-bold text-duel-brass">{winner.name}</span> wins!
                    </p>
                    <p className="text-duel-mist">
                      Remaining health: <span className="font-bold text-emerald-400 tabular-nums">{winner.health}</span>
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