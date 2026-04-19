import { describe, it, expect } from 'vitest';
import { computePowerScore } from './combat-meta';
import { PLAYER_CLASSES } from '@/components/game/class-data';

describe('combat-meta', () => {
  it('power score is in a reasonable band across roster', () => {
    const scores = Object.keys(PLAYER_CLASSES).map((k) =>
      computePowerScore(PLAYER_CLASSES[k as keyof typeof PLAYER_CLASSES])
    );
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    expect(max - min).toBeLessThan(140);
    expect(min).toBeGreaterThan(300);
  });

  it('computePowerScore scales with stats', () => {
    const scaled = { ...PLAYER_CLASSES.Warrior, health: PLAYER_CLASSES.Warrior.health + 200 };
    expect(computePowerScore(scaled)).toBeGreaterThan(computePowerScore(PLAYER_CLASSES.Warrior));
  });
});
