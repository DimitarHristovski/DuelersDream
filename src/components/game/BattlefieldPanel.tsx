import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Sparkles, Timer } from 'lucide-react';
import { getIconByName, PLAYER_CLASSES } from './class-data';
import type { Player } from './abilities';

interface BattlefieldPanelProps {
  player1: Player;
  player2: Player;
  battleLog: string[];
  aiThinking: boolean;
  gameOver: boolean;
  basicAttackAutomatic?: boolean;
}

export function BattlefieldPanel({
  player1,
  player2,
  battleLog,
  aiThinking,
  gameOver,
  basicAttackAutomatic = true,
}: BattlefieldPanelProps) {
  const [shake, setShake] = useState<'left' | 'right' | null>(null);
  const [floatTip, setFloatTip] = useState<{ id: number; side: 'left' | 'right'; amount: number } | null>(null);

  useEffect(() => {
    const line = battleLog[0];
    if (!line) return;

    const attackRe = /^(.+?)\s+attacks\s+(.+?)\s+for\s+(\d+)\s+damage/i.exec(line);
    if (attackRe) {
      const defender = attackRe[2].trim();
      const amount = parseInt(attackRe[3], 10);
      const id = Date.now();
      if (defender === player2.name) {
        setShake('right');
        window.setTimeout(() => setShake(null), 420);
        setFloatTip({ id, side: 'right', amount });
      } else if (defender === player1.name) {
        setShake('left');
        window.setTimeout(() => setShake(null), 420);
        setFloatTip({ id, side: 'left', amount });
      }
    }
  }, [battleLog, player1.name, player2.name]);

  useEffect(() => {
    if (!floatTip) return;
    const t = window.setTimeout(() => setFloatTip(null), 650);
    return () => clearTimeout(t);
  }, [floatTip]);

  const anyHuman = !player1.isComputer || !player2.isComputer;

  let banner = '';
  if (gameOver) banner = 'Battle ended';
  else if (aiThinking) banner = 'AI is acting…';
  else if (anyHuman) banner = 'Real-time — both fighters act';
  else banner = 'AI duel';

  const c1 = PLAYER_CLASSES[player1.className as keyof typeof PLAYER_CLASSES];
  const c2 = PLAYER_CLASSES[player2.className as keyof typeof PLAYER_CLASSES];
  const Icon1 = c1?.abilities?.[0]?.iconName ? getIconByName(c1.abilities[0].iconName) : Swords;
  const Icon2 = c2?.abilities?.[0]?.iconName ? getIconByName(c2.abilities[0].iconName) : Swords;

  return (
    <div className="relative overflow-hidden rounded-xl border border-duel-brass/25 bg-gradient-to-b from-duel-ink/95 via-duel-void/98 to-duel-ink/95 shadow-lg shadow-black/30">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23c9a227' fill-opacity='0.15'%3E%3Cpath d='M0 0h40v40H0zM40 40h40v40H40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative px-3 py-3">
        <div
          className={`mb-3 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold tracking-wide shadow-sm font-display ${
            anyHuman && !gameOver
              ? 'border-duel-brass/35 bg-duel-brass/10 text-duel-parchment'
              : 'border-stone-700 bg-duel-void/80 text-duel-mist'
          }`}
        >
          {aiThinking ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse text-duel-brass" />
              {banner}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              {!gameOver && <Timer className="h-4 w-4 text-duel-brass shrink-0" />}
              {banner}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-4 min-h-[120px]">
          <motion.div
            animate={shake === 'left' ? { x: [0, -10, 8, -5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 flex-col items-center gap-1.5 opacity-100"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-100/95 to-duel-parchment shadow-md shadow-amber-900/20">
              <Icon1 className="h-8 w-8 text-amber-800" />
            </div>
            <span className="max-w-[100px] truncate text-center text-xs font-semibold text-duel-parchment">{player1.name}</span>
          </motion.div>

          <div className="flex flex-col items-center pb-6">
            <div className="rounded-full bg-duel-void border border-duel-brass/40 p-2 shadow-inner shadow-black/40">
              <Swords className="h-7 w-7 text-duel-brass" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-duel-brass/80 mt-1 font-semibold font-display">Arena</span>
          </div>

          <motion.div
            animate={shake === 'right' ? { x: [0, -10, 8, -5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-1 flex-col items-center gap-1.5 opacity-100"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-rose-400/70 bg-gradient-to-br from-rose-100/95 to-stone-100 shadow-md shadow-rose-900/25">
              <Icon2 className="h-8 w-8 text-rose-800" />
            </div>
            <span className="max-w-[100px] truncate text-center text-xs font-semibold text-duel-parchment">{player2.name}</span>
          </motion.div>
        </div>

        <AnimatePresence>
          {floatTip && (
            <motion.div
              key={floatTip.id}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: -28, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.55 }}
              className={`pointer-events-none absolute text-lg font-black text-rose-600 drop-shadow-sm ${
                floatTip.side === 'left' ? 'left-[18%]' : 'right-[18%]'
              } bottom-16`}
            >
              −{floatTip.amount}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-2 text-center text-[10px] text-duel-mist/90 leading-relaxed px-1">
          {basicAttackAutomatic
            ? 'You: Space · 1–4 · auto basic attacks · AI opponent'
            : 'You: Space · 1–4'}
        </p>
      </div>
    </div>
  );
}
