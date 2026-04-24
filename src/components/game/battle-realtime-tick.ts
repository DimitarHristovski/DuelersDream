import type { Player } from './abilities';
import { getRoleCombatRegen } from './class-categories';
import {
  passiveCooldownTrimSecondsPerPulse,
  passiveEvasionPercentPerPulse,
  passiveHarmonyGains,
  passiveHpBurstHeal,
  passiveManaBurstGain,
  passiveShieldBurstGain,
} from '@/lib/passive-runtime';

/** How often passive surge effects (vitality, mana overflow, harmony, shields) tick in real time. */
const PASSIVE_BURST_SEC = 5;

function tickAbilityCooldowns(p: Player): Player {
  return {
    ...p,
    abilities: p.abilities.map((a) => {
      const cd = a.currentCooldown ?? 0;
      if (cd <= 0) return a;
      return { ...a, currentCooldown: Math.max(0, cd - 1) };
    }),
  };
}

/**
 * One fighter’s periodic processing (formerly half of switchTurns).
 * Effect/buff durations are in seconds and tick down every real-time second.
 */
function applyPeriodicForSide(
  self: Player,
  other: Player,
  manaRegenPerSec: number,
  hpRegenPerSec: number,
  tickIndex: number,
  log: (msg: string) => void
): { self: Player; other: Player } {
  const burst = tickIndex > 0 && tickIndex % PASSIVE_BURST_SEC === 0;
  const prev = self;
  let outAbilities = prev.abilities;
  let newMana = Math.min(prev.maxMana, prev.mana + manaRegenPerSec);
  if (newMana > prev.mana) {
    log(`${prev.name} regenerates ${manaRegenPerSec} mana.`);
  }

  const updatedEffects = { ...prev.effects };

  if (updatedEffects.attackBoostDuration > 0) {
    updatedEffects.attackBoostDuration = Math.max(0, updatedEffects.attackBoostDuration - 1);
    if (updatedEffects.attackBoostDuration === 0) {
      updatedEffects.attackBoost = 0;
      log(`${prev.name}'s attack boost has worn off.`);
    }
  }
  if (updatedEffects.stunDuration > 0) {
    updatedEffects.stunDuration = Math.max(0, updatedEffects.stunDuration - 1);
    if (updatedEffects.stunDuration === 0) {
      updatedEffects.stunned = false;
      log(`${prev.name} is no longer stunned!`);
    }
  }
  if (updatedEffects.attackReductionDuration > 0) {
    updatedEffects.attackReductionDuration = Math.max(0, updatedEffects.attackReductionDuration - 1);
    if (updatedEffects.attackReductionDuration === 0) {
      updatedEffects.attackReduction = 0;
      log(`${prev.name}'s attack reduction has worn off.`);
    }
  }
  if (updatedEffects.shieldDuration > 0) {
    updatedEffects.shieldDuration = Math.max(0, updatedEffects.shieldDuration - 1);
    if (updatedEffects.shieldDuration === 0) {
      updatedEffects.shield = 0;
      log(`${prev.name}'s shield has worn off.`);
    }
  }
  if (updatedEffects.evasionDuration > 0) {
    updatedEffects.evasionDuration = Math.max(0, updatedEffects.evasionDuration - 1);
    if (updatedEffects.evasionDuration === 0) {
      updatedEffects.evasion = 0;
      log(`${prev.name}'s evasion has worn off.`);
    }
  }
  if (updatedEffects.untargetableDuration > 0) {
    updatedEffects.untargetableDuration = Math.max(0, updatedEffects.untargetableDuration - 1);
    if (updatedEffects.untargetableDuration === 0) {
      updatedEffects.untargetable = false;
      log(`${prev.name} emerges from the shadows.`);
    }
  }

  let opponent = other;

  if (prev.effects.ambushPending && prev.effects.ambushDelay <= 0) {
    const minD = prev.effects.ambushMin || 60;
    const maxD = prev.effects.ambushMax || 90;
    const damage = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
    opponent = { ...opponent, health: Math.max(0, opponent.health - damage) };
    log(`${prev.name} strikes from the shadows for ${damage} damage!`);
  }

  if (updatedEffects.ambushDelay > 0) {
    updatedEffects.ambushDelay = Math.max(0, updatedEffects.ambushDelay - 1);
  }
  if (prev.effects.ambushPending && prev.effects.ambushDelay <= 0) {
    updatedEffects.ambushPending = false;
    updatedEffects.ambushMin = 0;
    updatedEffects.ambushMax = 0;
  }

  if (updatedEffects.repelAbilitiesDuration > 0) {
    updatedEffects.repelAbilitiesDuration = Math.max(0, updatedEffects.repelAbilitiesDuration - 1);
    if (updatedEffects.repelAbilitiesDuration === 0) {
      updatedEffects.repelAbilities = false;
      log(`${prev.name}'s repelling shield fades.`);
    }
  }
  if (updatedEffects.markDuration > 0) {
    updatedEffects.markDuration = Math.max(0, updatedEffects.markDuration - 1);
    if (updatedEffects.markDuration === 0) {
      updatedEffects.marked = false;
      updatedEffects.markDamageIncrease = 0;
      log(`${prev.name} is no longer marked.`);
    }
  }
  if (updatedEffects.bleedDuration > 0) {
    updatedEffects.bleedDuration = Math.max(0, updatedEffects.bleedDuration - 1);
    if (updatedEffects.bleedDuration === 0) {
      updatedEffects.bleeding = 0;
      log(`${prev.name} stops bleeding.`);
    }
  }
  if (updatedEffects.weaponEnhancementDuration > 0) {
    updatedEffects.weaponEnhancementDuration = Math.max(0, updatedEffects.weaponEnhancementDuration - 1);
    if (updatedEffects.weaponEnhancementDuration === 0) {
      updatedEffects.weaponEnhancement = 0;
      updatedEffects.weaponEnhancementElement = '';
      log(`${prev.name}'s weapon enhancement has worn off.`);
    }
  }
  if (updatedEffects.spellDamageBoostDuration > 0) {
    updatedEffects.spellDamageBoostDuration = Math.max(0, updatedEffects.spellDamageBoostDuration - 1);
    if (updatedEffects.spellDamageBoostDuration === 0) {
      updatedEffects.spellDamageBoost = 0;
      log(`${prev.name}'s spell damage boost has worn off.`);
    }
  }
  if (updatedEffects.damageReductionDuration > 0) {
    updatedEffects.damageReductionDuration = Math.max(0, updatedEffects.damageReductionDuration - 1);
    if (updatedEffects.damageReductionDuration === 0) {
      updatedEffects.damageReduction = 0;
      log(`${prev.name}'s damage reduction has worn off.`);
    }
  }
  if (updatedEffects.nextHitBonusDuration > 0) {
    updatedEffects.nextHitBonusDuration = Math.max(0, updatedEffects.nextHitBonusDuration - 1);
    if (updatedEffects.nextHitBonusDuration === 0) {
      updatedEffects.nextHitBonus = 0;
      log(`${prev.name}'s next hit bonus has worn off.`);
    }
  }

  let interimHealth = prev.health;

  if (updatedEffects.regeneration && updatedEffects.regeneration > 0 && prev.health < prev.maxHealth) {
    const perSec = Math.max(1, Math.floor(updatedEffects.regeneration / PASSIVE_BURST_SEC));
    const healed = Math.min(perSec, prev.maxHealth - prev.health);
    interimHealth = prev.health + healed;
    if (healed > 0) log(`${prev.name} regenerates ${healed} health.`);
  }

  const passiveHeal = passiveHpBurstHeal(prev);
  if (burst && passiveHeal > 0 && interimHealth < prev.maxHealth) {
    const healed = Math.min(passiveHeal, prev.maxHealth - interimHealth);
    if (healed > 0) {
      interimHealth += healed;
      log(`${prev.name}'s passive vitality restores ${healed} health.`);
    }
  }

  // Role-based passive recovery (melee / ranged / caster), every real-time second
  if (hpRegenPerSec > 0 && interimHealth < prev.maxHealth) {
    const gained = Math.min(hpRegenPerSec, prev.maxHealth - interimHealth);
    if (gained > 0) {
      interimHealth += gained;
      log(`${prev.name} restores ${gained} health.`);
    }
  }

  if (prev.effects.summonedCreature && prev.effects.summonedCreature.damage > 0) {
    const petDamage = prev.effects.summonedCreature.damage;
    opponent = {
      ...opponent,
      health: Math.max(1, opponent.health - petDamage),
    };
    log(`${prev.name}'s wolf bites ${opponent.name} for ${petDamage} damage!`);
  }

  if (prev.effects.summonedCreatures && prev.effects.summonedCreatures.length > 0) {
    let totalDamage = 0;
    const activeCreatures = prev.effects.summonedCreatures.filter((creature) => creature.turnsLeft > 0);
    activeCreatures.forEach((creature) => {
      let creatureDamage = creature.damage;
      if (prev.effects.summonedCreatureDamageBoost && prev.effects.summonedCreatureDamageBoost > 0) {
        creatureDamage = Math.floor(creatureDamage * (1 + prev.effects.summonedCreatureDamageBoost / 100));
      }
      totalDamage += creatureDamage;
    });
    if (totalDamage > 0) {
      opponent = {
        ...opponent,
        health: Math.max(1, opponent.health - totalDamage),
      };
      log(`${prev.name}'s summoned creatures deal ${totalDamage} total damage to ${opponent.name}!`);
    }
    updatedEffects.summonedCreatures = prev.effects.summonedCreatures
      .map((creature) => ({ ...creature, turnsLeft: creature.turnsLeft - 1 }))
      .filter((creature) => creature.turnsLeft > 0);
  }

  if (updatedEffects.bleeding > 0) {
    const bleedDamage = updatedEffects.bleedDamage || 6;
    const newHealth = Math.max(1, interimHealth - bleedDamage);
    log(`${prev.name} takes ${bleedDamage} bleeding damage!`);
    return {
      self: {
        ...prev,
        health: newHealth,
        mana: newMana,
        effects: updatedEffects,
        abilities: prev.abilities,
        isActive: true,
      },
      other: opponent,
    };
  }

  if (updatedEffects.poisoned > 0) {
    const poisonDamage = updatedEffects.poisonDamage || 8;
    const newHealth = Math.max(1, interimHealth - poisonDamage);
    log(`${prev.name} takes ${poisonDamage} poison damage!`);
    return {
      self: {
        ...prev,
        health: newHealth,
        mana: newMana,
        effects: updatedEffects,
        abilities: prev.abilities,
        isActive: true,
      },
      other: opponent,
    };
  }

  if (burst) {
    const manaBurst = passiveManaBurstGain(prev);
    if (manaBurst > 0) {
      const extraMana = Math.min(manaBurst, prev.maxMana - newMana);
      if (extraMana > 0) {
        newMana += extraMana;
        log(`${prev.name}'s passive mana surge grants +${extraMana} mana!`);
      }
    }

    const harmony = passiveHarmonyGains(prev);
    if (harmony) {
      const attackGain = harmony.attack;
      const spellGain = harmony.spell;
      updatedEffects.attackBoost = (updatedEffects.attackBoost || 0) + attackGain;
      updatedEffects.spellDamageBoost = (updatedEffects.spellDamageBoost || 0) + spellGain;
      log(
        `${prev.name}'s elemental harmony increases attack by +${attackGain}% and spell damage by +${spellGain}%!`
      );
    }

    const shieldGain = passiveShieldBurstGain(prev);
    if (shieldGain > 0) {
      const cap = Math.floor(prev.maxHealth * 0.35);
      const next = Math.min(cap, (updatedEffects.shield || 0) + shieldGain);
      const added = next - (updatedEffects.shield || 0);
      if (added > 0) {
        updatedEffects.shield = next;
        updatedEffects.shieldDuration = Math.max(updatedEffects.shieldDuration || 0, PASSIVE_BURST_SEC + 1);
        log(`${prev.name}'s passive wards gain ${added} shield.`);
      }
    }

    const evPulse = passiveEvasionPercentPerPulse(prev);
    if (evPulse > 0) {
      updatedEffects.evasion = Math.max(updatedEffects.evasion || 0, evPulse);
      updatedEffects.evasionDuration = Math.max(updatedEffects.evasionDuration || 0, PASSIVE_BURST_SEC + 2);
      log(`${prev.name}'s passive footing holds at ${evPulse}% evasion.`);
    }

    const trimCd = passiveCooldownTrimSecondsPerPulse(prev);
    if (trimCd > 0) {
      outAbilities = prev.abilities.map((ab) => {
        const cd = ab.currentCooldown ?? 0;
        if (cd <= 0) return ab;
        return { ...ab, currentCooldown: Math.max(0, cd - trimCd) };
      });
      log(`${prev.name}'s passive cadence trims ability cooldowns by ${trimCd}s.`);
    }
  }

  return {
    self: {
      ...prev,
      health: interimHealth,
      mana: newMana,
      effects: updatedEffects,
      abilities: outAbilities,
      isActive: true,
    },
    other: opponent,
  };
}

/**
 * One real-time second: cooldowns + both fighters’ periodic effects (no alternating turns).
 */
export function tickRealtimeSecond(
  p1: Player,
  p2: Player,
  tickIndex: number,
  log: (msg: string) => void
): [Player, Player] {
  let a = tickAbilityCooldowns(p1);
  let b = tickAbilityCooldowns(p2);

  const reg1 = getRoleCombatRegen(a.className);
  const reg2 = getRoleCombatRegen(b.className);

  const r1 = applyPeriodicForSide(a, b, reg1.manaPerSec, reg1.hpPerSec, tickIndex, log);
  a = r1.self;
  b = r1.other;

  const r2 = applyPeriodicForSide(b, a, reg2.manaPerSec, reg2.hpPerSec, tickIndex, log);
  return [r2.other, r2.self];
}
