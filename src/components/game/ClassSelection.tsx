import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sword,
  Heart,
  Zap,
  Sparkles,
  User,
  Star,
  ArrowRight,
  Search,
  Clock,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PLAYER_CLASSES, getIconByName } from './class-data';
import { motion } from 'framer-motion';
import { computePowerScore } from '@/lib/combat-meta';
import { CLASS_ROLES, ALL_CLASSES_ORDERED, pickRandomAiClass, type RoleKey } from './class-categories';
import { getBalancedPlayerClass } from './class-role-balance';

interface ClassSelectionProps {
  player1Class: keyof typeof PLAYER_CLASSES;
  setPlayer1Class: React.Dispatch<React.SetStateAction<keyof typeof PLAYER_CLASSES>>;
  player1Name: string;
  setPlayer1Name: React.Dispatch<React.SetStateAction<string>>;
  /** Called when the user enters the arena so the parent can use the same class in `startGame`. */
  onOpponentClassLockedIn: (aiClass: keyof typeof PLAYER_CLASSES) => void;
  startGame: () => void;
}

export { CLASS_ROLES, ALL_CLASSES_ORDERED };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function roleForClass(className: string): RoleKey | 'Other' {
  const roles: RoleKey[] = ['Melee', 'Ranged', 'Caster'];
  for (const r of roles) {
    if ((CLASS_ROLES[r] as readonly string[]).includes(className)) return r;
  }
  return 'Other';
}

export const ClassSelection = ({
  player1Class,
  setPlayer1Class,
  player1Name,
  setPlayer1Name,
  onOpponentClassLockedIn,
  startGame,
}: ClassSelectionProps) => {
  const [roleFilter, setRoleFilter] = useState<'all' | RoleKey>('all');
  const [search, setSearch] = useState('');
  const [showVersus, setShowVersus] = useState(false);
  const [opponentPreviewClass, setOpponentPreviewClass] = useState<keyof typeof PLAYER_CLASSES | null>(null);
  const [hoveredAbility, setHoveredAbility] = useState<string | null>(null);

  const filteredClassNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_CLASSES_ORDERED.filter((name) => {
      if (!(name in PLAYER_CLASSES)) return false;
      if (roleFilter !== 'all' && !(CLASS_ROLES[roleFilter] as readonly string[]).includes(name)) {
        return false;
      }
      if (q && !name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [roleFilter, search]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showVersus) {
      timer = setTimeout(() => startGame(), 3000);
    }
    return () => clearTimeout(timer);
  }, [showVersus, startGame]);

  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = getIconByName(iconName);
    return <IconComponent className={className} />;
  };

  const renderAbilityBadge = (
    ability: {
      name: string;
      description: string;
      cooldown: number;
      manaCost?: number;
      iconName: string;
    },
    index: number
  ) => {
    const uniqueId = `ability-${index}-${ability.name.replace(/\s+/g, '-').toLowerCase()}`;
    const isHovered = hoveredAbility === uniqueId;

    return (
      <div
        key={uniqueId}
        className="relative"
        onMouseEnter={() => setHoveredAbility(uniqueId)}
        onMouseLeave={() => setHoveredAbility(null)}
      >
        <div
          className={`flex items-center gap-2 p-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${
            ability.manaCost
              ? 'bg-duel-ember/30 text-amber-100/95 border border-duel-flame/35'
              : 'bg-duel-wine/25 text-violet-100/90 border border-duel-wine/40'
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/25 border border-white/10">
            {renderIcon(ability.iconName, 'h-4 w-4 text-duel-brass')}
          </span>
          <span className="truncate flex-1 min-w-0">{ability.name}</span>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline" className="inline-flex items-center text-[10px] px-1.5 py-0.5 border-duel-brass/30 text-duel-parchment gap-0.5">
              <Clock className="h-3 w-3 opacity-90" />
              {ability.cooldown}s
            </Badge>
            {ability.manaCost !== undefined && (
              <Badge variant="secondary" className="inline-flex items-center text-[10px] px-1.5 py-0.5 bg-duel-ink/50 gap-0.5 border-0">
                <Zap className="h-3 w-3 text-amber-400" />
                {ability.manaCost}
              </Badge>
            )}
          </div>
        </div>
        {isHovered && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 w-64 bg-black text-white text-xs rounded-lg shadow-xl border border-neutral-600">
            <div className="flex items-center mb-2 text-white">
              {renderIcon(ability.iconName, 'h-4 w-4 mr-2 text-amber-300')}
              <p className="font-semibold">{ability.name}</p>
            </div>
            <p className="text-zinc-300 mb-2 leading-snug">{ability.description}</p>
            <div className="flex items-center justify-between text-zinc-200 border-t border-neutral-600 pt-2 mt-1">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-zinc-400" /> {ability.cooldown}s CD
              </span>
              {ability.manaCost !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3 w-3 text-zinc-400" /> {ability.manaCost} MP
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClassCard = (className: keyof typeof PLAYER_CLASSES, isSelected: boolean) => {
    const raw = PLAYER_CLASSES[className];
    if (!raw) return null;
    const classData = getBalancedPlayerClass(String(className), raw);
    const power = computePowerScore(classData);
    const role = roleForClass(String(className));

    return (
      <motion.div variants={itemVariants} initial="hidden" animate="visible" key={String(className)} className="w-full">
        <Card
          className={`relative cursor-pointer transition-all duration-300 overflow-hidden group border backdrop-blur-sm ${
            isSelected
              ? 'ring-2 ring-duel-brass/70 bg-duel-ink/95 border-duel-brass/50 shadow-lg shadow-black/50 scale-[1.02]'
              : 'border-stone-700/50 bg-duel-ink/70 hover:border-duel-brass/35 hover:bg-duel-panel/90'
          }`}
          onClick={() => setPlayer1Class(className)}
        >
          {isSelected && (
            <div className="absolute top-0 right-0 bg-duel-brass text-duel-void p-1 z-10 rounded-bl-md">
              <Star className="h-3 w-3" />
            </div>
          )}

          <CardHeader className="p-3 pb-1 bg-gradient-to-r from-duel-ink/95 to-duel-void/95 border-b border-duel-brass/15">
            <CardTitle className="text-base flex items-center justify-between gap-1 font-display">
              <span className="flex items-center min-w-0 text-duel-parchment">
                {renderIcon(raw.abilities[0]?.iconName || 'sword', 'h-4 w-4 mr-1.5 text-duel-brass shrink-0')}
                <span className="truncate">{String(className)}</span>
              </span>
              <span className="flex gap-1 shrink-0">
                <Badge variant="outline" className="text-[10px] border-duel-brass/30 text-duel-mist">
                  {role}
                </Badge>
                <Badge variant="secondary" className="text-[10px] bg-duel-elevated text-duel-brass border-0">
                  ★{power}
                </Badge>
              </span>
            </CardTitle>
            <CardDescription className="text-xs line-clamp-2 h-8 text-duel-mist">{raw.description}</CardDescription>
          </CardHeader>

          <CardContent className="p-3 pt-2">
            <div className="flex justify-between mb-2 text-stone-200">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-rose-400 mr-1" />
                <span className="text-sm font-medium">{classData.health}</span>
              </div>
              <div className="flex items-center">
                <Sword className="h-4 w-4 text-stone-400 mr-1" />
                <span className="text-sm font-medium">
                  {classData.attackMin}-{classData.attackMax}
                </span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-amber-400/90 mr-1" />
                <span className="text-sm font-medium">{classData.mana}</span>
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <h4 className="text-xs font-semibold text-duel-mist flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-duel-brass/90" />
                Abilities
              </h4>
              <div className="flex flex-wrap gap-1">
                {raw.abilities.map((ability, index) => renderAbilityBadge(ability, index))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const handleBattleStart = () => {
    const ai = pickRandomAiClass(player1Class);
    setOpponentPreviewClass(ai);
    onOpponentClassLockedIn(ai);
    setShowVersus(true);
  };

  if (showVersus && opponentPreviewClass) {
    const player1Data = getBalancedPlayerClass(String(player1Class), PLAYER_CLASSES[player1Class]);
    const player2Data = getBalancedPlayerClass(String(opponentPreviewClass), PLAYER_CLASSES[opponentPreviewClass]);

    return (
      <div className="max-w-4xl w-full rounded-2xl border border-duel-brass/25 bg-duel-ink/95 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        <div className="relative h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 flex">
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-1/2 h-full flex flex-col items-center justify-center p-4"
            >
              <div className="text-4xl sm:text-5xl font-bold text-duel-parchment mb-4 font-display tracking-tight">{player1Name}</div>
              <div className="text-2xl text-duel-brass mb-6">{String(player1Class)}</div>
              <div className="flex flex-col items-center text-stone-300">
                <div className="mb-3 flex items-center">
                  <Heart className="h-6 w-6 text-rose-500 mr-2" />
                  <span className="text-2xl">{player1Data.health} HP</span>
                </div>
                <div className="mb-3 flex items-center">
                  <Sword className="h-6 w-6 text-slate-400 mr-2" />
                  <span className="text-xl">
                    {player1Data.attackMin}-{player1Data.attackMax} ATK
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="rounded-full h-24 w-24 flex items-center justify-center bg-gradient-to-br from-duel-brass to-duel-flame text-duel-void text-4xl font-black font-display shadow-xl shadow-black/50 border border-duel-brass/40">
                VS
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-1/2 h-full flex flex-col items-center justify-center p-4"
            >
              <div className="text-3xl sm:text-5xl font-bold text-duel-parchment mb-4 tracking-tight font-display text-center px-2">{`${String(opponentPreviewClass)} AI`}</div>
              <div className="text-2xl text-rose-300/90 mb-6">{String(opponentPreviewClass)}</div>
              <div className="flex flex-col items-center text-stone-300">
                <div className="mb-3 flex items-center">
                  <Heart className="h-6 w-6 text-rose-500 mr-2" />
                  <span className="text-2xl">{player2Data.health} HP</span>
                </div>
                <div className="mb-3 flex items-center">
                  <Sword className="h-6 w-6 text-slate-400 mr-2" />
                  <span className="text-xl">
                    {player2Data.attackMin}-{player2Data.attackMax} ATK
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          >
            <div className="text-xl text-duel-brass font-display font-medium mb-2">Entering arena…</div>
            <div className="w-64 bg-duel-elevated rounded-full h-2 overflow-hidden border border-duel-brass/20">
              <motion.div
                className="bg-gradient-to-r from-duel-brass to-duel-flame h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full space-y-8 rounded-2xl border border-duel-brass/20 bg-gradient-to-br from-duel-ink/90 via-duel-void/95 to-duel-ink/90 p-6 md:p-8 shadow-2xl shadow-black/50">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-duel-parchment">Choose your fighter</h2>
        <p className="text-duel-mist max-w-xl mx-auto text-sm md:text-base">
          Every match rolls a random AI opponent — pick a class, then step into the arena.
        </p>
      </motion.div>

      <div className="rounded-xl border border-duel-brass/15 bg-duel-void/60 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="player1-name" className="text-duel-mist flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-duel-brass/80" />
              Your name
            </Label>
            <Input
              id="player1-name"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Player 1"
              className="mt-1.5 bg-duel-ink border-duel-brass/25 text-duel-parchment placeholder:text-duel-mist/50 focus-visible:ring-duel-brass/40"
            />
          </div>
          <div className="text-right">
            <div className="text-lg font-display font-semibold text-duel-brass">{String(player1Class)}</div>
            <div className="text-xs text-duel-mist">Selected</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-duel-mist" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classes…"
              className="pl-9 bg-duel-ink border-duel-brass/25 text-duel-parchment placeholder:text-duel-mist/50 focus-visible:ring-duel-brass/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'Melee', 'Ranged', 'Caster'] as const).map((r) => (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={roleFilter === r ? 'default' : 'outline'}
                onClick={() => setRoleFilter(r === 'all' ? 'all' : (r as RoleKey))}
                className={
                  roleFilter === r
                    ? 'bg-duel-brass text-duel-void hover:bg-amber-400 font-medium'
                    : 'border-duel-brass/25 text-duel-mist hover:bg-duel-brass/10 hover:text-duel-parchment'
                }
              >
                {r === 'all' ? 'All' : r}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[min(62vh,720px)] pr-3">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4"
          >
            {filteredClassNames.map((className) =>
              renderClassCard(className as keyof typeof PLAYER_CLASSES, className === player1Class)
            )}
          </motion.div>
        </ScrollArea>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center pt-2"
      >
        <Button
          onClick={handleBattleStart}
          size="lg"
          className="font-display tracking-wide px-10 py-6 text-lg rounded-xl bg-gradient-to-r from-duel-brass to-amber-600 text-duel-void hover:from-amber-400 hover:to-duel-flame shadow-lg shadow-black/40 border border-duel-brass/30"
          disabled={!player1Class}
        >
          <Sword className="h-5 w-5 mr-2" />
          Enter arena
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};
