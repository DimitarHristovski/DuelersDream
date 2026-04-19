import { Swords, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GamePhase = 'selection' | 'battle';

interface GameHeaderProps {
  phase: GamePhase;
  gamesPlayed: number;
  wins: number;
  losses: number;
  onResetStats: () => void;
}

export function GameHeader({ phase, gamesPlayed, wins, losses, onResetStats }: GameHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-duel-brass/25 bg-duel-void/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-duel-brass/50 to-transparent" />
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-duel-brass/40 bg-gradient-to-br from-duel-ink to-duel-void shadow-inner shadow-black/40">
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(201,162,39,0.15),transparent_55%)]" />
            <Swords className="relative h-7 w-7 text-duel-brass drop-shadow-[0_0_12px_rgba(201,162,39,0.35)]" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.35em] text-duel-brass/90 font-medium">Real-time arena</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-duel-parchment truncate">
              Duelers Dream
            </h1>
            <p className="text-xs text-duel-mist mt-0.5 hidden sm:block">
              {phase === 'battle' ? 'Battle in progress — outlast the AI' : 'Choose a class · random AI opponent each match'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div
            className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              phase === 'battle'
                ? 'border-stone-600/80 bg-duel-ink/80 text-stone-200'
                : 'border-duel-brass/20 bg-duel-ink/60 text-stone-300'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 text-duel-brass">
              <Trophy className="h-4 w-4" />
              <span className="tabular-nums font-semibold">{wins}</span>
              <span className="text-duel-mist text-xs font-normal">wins</span>
            </span>
            <span className="text-duel-elevated w-px h-4" />
            <span className="tabular-nums text-stone-400">
              {losses} losses · {gamesPlayed} fought
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetStats}
            disabled={gamesPlayed === 0}
            className="border-duel-brass/30 text-duel-parchment/90 hover:bg-duel-brass/10 hover:text-duel-parchment disabled:opacity-40"
          >
            Reset stats
          </Button>
        </div>
      </div>
    </header>
  );
}
