import { describe, it, expect } from 'vitest';
import { createDefaultEffects, type Player } from '@/components/game/abilities';
import {
  passiveAttackWhileLowHp,
  passiveBonusSpellDamageFraction,
  passiveCooldownTrimSecondsPerPulse,
  passiveDamageReductionWhileHealthyFraction,
  passiveEvasionPercentPerPulse,
  passiveHarmonyGains,
  passiveHpBurstHeal,
  passiveLifestealBasicPercent,
  passiveManaBurstGain,
  passiveReflectPercentFromAttacks,
  passiveShieldBurstGain,
  passiveSpellDamageWhileHighHealth,
  passiveSpellDamageWhileHighMana,
} from './passive-runtime';

function mockPlayer(descriptions: string[]): Player {
  return {
    name: 'Test',
    className: 'Test',
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 100,
    attackMin: 1,
    attackMax: 2,
    isActive: true,
    abilities: descriptions.map((description, i) => ({
      name: `P${i}`,
      iconName: 'Circle',
      description,
      cooldown: 0,
      manaCost: 0,
    })),
    effects: createDefaultEffects(),
  };
}

describe('passive-runtime', () => {
  it('parses HP burst with real-time pulse wording', () => {
    const p = mockPlayer(['Passive: Regenerate 11 health each passive pulse.']);
    expect(passiveHpBurstHeal(p)).toBe(11);
  });

  it('still parses legacy every-turn HP wording', () => {
    const p = mockPlayer(['Passive: Regenerate 9 health every turn']);
    expect(passiveHpBurstHeal(p)).toBe(9);
  });

  it('parses mana burst with pulse wording', () => {
    const p = mockPlayer(['Passive: Gain +8 mana each passive pulse.']);
    expect(passiveManaBurstGain(p)).toBe(8);
  });

  it('still parses legacy start-of-turn mana wording', () => {
    const p = mockPlayer(['Passive: Gain +12 mana at the start of your turn.']);
    expect(passiveManaBurstGain(p)).toBe(12);
  });

  it('parses shield burst with pulse wording', () => {
    const p = mockPlayer(['Passive: Gain a shield that blocks 15 damage each passive pulse.']);
    expect(passiveShieldBurstGain(p)).toBe(15);
  });

  it('parses harmony with pulse wording', () => {
    const p = mockPlayer([
      'Passive: Each passive pulse gain 3% attack and 2% spell damage (stacks)',
    ]);
    expect(passiveHarmonyGains(p)).toEqual({ attack: 3, spell: 2 });
  });

  it('still parses legacy harmony wording', () => {
    const p = mockPlayer(['Passive: Every turn gain 2% attack and 1% spell damage']);
    expect(passiveHarmonyGains(p)).toEqual({ attack: 2, spell: 1 });
  });

  it('parses spell damage while high mana', () => {
    const p = mockPlayer(['Passive: Increase spell damage by 14% while above 50% mana.']);
    expect(passiveSpellDamageWhileHighMana(p)).toEqual({ boost: 14, threshold: 50 });
  });

  it('parses spell damage while high health', () => {
    const p = mockPlayer(['Passive: Increase spell damage by 9% while above 60% health.']);
    expect(passiveSpellDamageWhileHighHealth(p)).toEqual({ boost: 9, threshold: 60 });
  });

  it('parses attack while low HP', () => {
    const p = mockPlayer(['Passive: Increase attack by 12% while under 40% health.']);
    expect(passiveAttackWhileLowHp(p)).toEqual({ boost: 12, threshold: 40 });
  });

  it('parses damage reduction while healthy', () => {
    const p = mockPlayer(['Passive: Reduce damage taken by 10% while above 52% health.']);
    const q = { ...p, health: 80, maxHealth: 100 };
    expect(passiveDamageReductionWhileHealthyFraction(q)).toBeCloseTo(0.1);
    const low = { ...p, health: 40, maxHealth: 100 };
    expect(passiveDamageReductionWhileHealthyFraction(low)).toBe(0);
  });

  it('parses reflect from attacks', () => {
    const p = mockPlayer(['Passive: Reflect 15% of damage taken from attacks.']);
    expect(passiveReflectPercentFromAttacks(p)).toBe(15);
  });

  it('parses evasion pulse', () => {
    const p = mockPlayer(['Passive: Gain 7% evasion each passive pulse.']);
    expect(passiveEvasionPercentPerPulse(p)).toBe(7);
  });

  it('parses lifesteal on basics', () => {
    const p = mockPlayer(['Passive: Heal for 8% of damage dealt with basic attacks.']);
    expect(passiveLifestealBasicPercent(p)).toBe(8);
  });

  it('parses cooldown trim per pulse', () => {
    const p = mockPlayer(['Passive: Reduce all ability cooldowns by 1 second each passive pulse.']);
    expect(passiveCooldownTrimSecondsPerPulse(p)).toBe(1);
  });

  it('combines conditional spell passives into one fraction', () => {
    const p = mockPlayer([
      'Passive: Increase spell damage by 10% while under 50% health.',
      'Passive: Increase spell damage by 5% while above 60% mana.',
    ]);
    const q = { ...p, health: 40, maxHealth: 100, mana: 80, maxMana: 100 };
    expect(passiveBonusSpellDamageFraction(q)).toBeCloseTo(0.15);
  });
});
