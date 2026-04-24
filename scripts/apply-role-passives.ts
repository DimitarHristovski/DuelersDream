/**
 * Rewrites class-data passives (except Witcher, TaurenChieftain, Godslayer, Archon) using
 * per-class themed passives in per-class-passives.ts. Strips "Ultimate:" from actives.
 * Run: npx tsx scripts/apply-role-passives.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PER_CLASS_PASSIVES } from "./per-class-passives";
import { PLAYER_CLASSES, type PlayerClass, type PlayerClassAbility } from "../src/components/game/class-data";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/components/game/class-data.ts");

const LOCKED = new Set(["Witcher", "TaurenChieftain", "Godslayer", "Archon"]);

function isPassiveRow(a: PlayerClassAbility): boolean {
  return (a.cooldown === 0 && a.manaCost === 0) || a.name === "Spirit Endurance";
}

const ARCHON_ABILITIES: PlayerClassAbility[] = [
  {
    name: "Apotheosis",
    iconName: "Crown",
    description:
      "Ultimate: Deal 88–108 radiant damage, dispel 1 positive effect, and gain +18% damage & +18% damage reduction for 2 turns.",
    cooldown: 9,
    manaCost: 58,
  },
  {
    name: "Perfect Form",
    iconName: "Shield",
    description: "Passive: The first harmful effect on you each turn has its duration reduced by 1.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Decree",
    iconName: "ScrollText",
    description: "Passive: Your dispels remove 1 additional positive effect.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Seraphic Flow",
    iconName: "Wand2",
    description: "Passive: While above 60% mana, your spell damage is increased by 10%.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Aegis of Order",
    iconName: "ShieldCheck",
    description:
      "Passive: The first hit you take each turn is reduced by 30 damage and you gain 10 mana.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Judicial Pressure",
    iconName: "Gavel",
    description: "Passive: Enemy abilities cost +5 mana.",
    cooldown: 0,
    manaCost: 0,
  },
];

const WITCHER_ABILITIES: PlayerClassAbility[] = [
  {
    name: "Blood Frenzy",
    iconName: "Flame",
    description: "Attack twice for 40-52 damage each, but take 15 self-damage",
    cooldown: 7,
    manaCost: 50,
  },
  {
    name: "Igni Sign",
    iconName: "Flame",
    description: "Deal 52–68 fire damage",
    cooldown: 5,
    manaCost: 45,
  },
  {
    name: "Rally",
    iconName: "Heart",
    description: "Restore 55 health points",
    cooldown: 3,
    manaCost: 5,
  },
  {
    name: "Mutagens",
    iconName: "Beaker",
    description: "Passive: Increase attack by 28% while above 50% health.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Monster Killer",
    iconName: "BookOpen",
    description: "Passive: Increase spell damage by 28% while under 50% health.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Alchemy Mastery",
    iconName: "FlaskRound",
    description: "Passive: All healing received is 35% stronger while under 50% health.",
    cooldown: 0,
    manaCost: 0,
  },
];

const TAUREN_ABILITIES: PlayerClassAbility[] = [
  {
    name: "Shield Bash",
    iconName: "Shield",
    description: "deal 58-72 damage",
    cooldown: 5,
    manaCost: 56,
  },
  {
    name: "Rage",
    iconName: "Flame",
    description: "Increase attack by 18% deal 38 damage",
    cooldown: 8,
    manaCost: 50,
  },
  {
    name: "Prophetic Mark",
    iconName: "Crosshair",
    description: "permanently counterattack 22% of damage taken",
    cooldown: 14,
    manaCost: 55,
  },
  {
    name: "Totemic Strength",
    iconName: "Megaphone",
    description: "Passive: Regenerate 20 health everyturn",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Spirit Endurance",
    iconName: "Heart",
    description: "Passive: Reincarnation ",
    cooldown: 100,
    manaCost: 0,
  },
  {
    name: "Gods's Wrath",
    iconName: "Flame",
    description: "Passive: When losing health, increase attack by 1% (stacks)",
    cooldown: 0,
    manaCost: 0,
  },
];

const GODSLAYER_ABILITIES: PlayerClassAbility[] = [
  {
    name: "Divine Execution",
    iconName: "Skull",
    description: "If enemy is under 11% health: instantly kill; otherwise deal 80 damage.",
    cooldown: 5,
    manaCost: 42,
  },
  {
    name: "Executioner's Zeal",
    iconName: "Flame",
    description: "Passive: Each basic attack reduces Divine Execution’s cooldown by 1.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Oath of Finality",
    iconName: "Heart",
    description: "Passive: When you drop below 100% HP,spell damage is increased by 30%.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Relentless Verdict",
    iconName: "Sword",
    description: "Passive: If Divine Execution fails to kill, your next attack deals 55% damage.",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Godbreaker’s Might",
    iconName: "Star",
    description: "Passive: Each enemy ability used against you increases Divine Execution’s damage by 12 (stacks).",
    cooldown: 0,
    manaCost: 0,
  },
  {
    name: "Gods's Wrath",
    iconName: "Flame",
    description: "Passive: When losing health, increase attack by 10% (stacks)",
    cooldown: 0,
    manaCost: 0,
  },
];

function stripActiveDescription(desc: string): string {
  return desc.replace(/^Ultimate:\s*/i, "").trim();
}

function classPassives(className: string): PlayerClassAbility[] {
  const row = PER_CLASS_PASSIVES[className];
  if (!row) {
    throw new Error(`PER_CLASS_PASSIVES missing entry for: ${className}`);
  }
  return row;
}

function buildAbilities(className: string, cls: PlayerClass): PlayerClassAbility[] {
  if (className === "Witcher") return WITCHER_ABILITIES;
  if (className === "TaurenChieftain") return TAUREN_ABILITIES;
  if (className === "Godslayer") return GODSLAYER_ABILITIES;
  if (className === "Archon") return ARCHON_ABILITIES;

  const actives = cls.abilities
    .filter((a) => !isPassiveRow(a))
    .slice(0, 3)
    .map((a) => ({
      ...a,
      description: stripActiveDescription(a.description),
    }));
  return [...actives, ...classPassives(className)];
}

function fmtAbility(a: PlayerClassAbility): string {
  const desc = JSON.stringify(a.description);
  return `      {
        name: ${JSON.stringify(a.name)},
        iconName: ${JSON.stringify(a.iconName)},
        description: ${desc},
        cooldown: ${a.cooldown},
        manaCost: ${a.manaCost},
      }`;
}

function fmtClass(name: string, cls: PlayerClass): string {
  const key = /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : JSON.stringify(name);
  const abs = buildAbilities(name, cls).map(fmtAbility).join(",\n");
  return `  ${key}: {
    health: ${cls.health},
    attackMin: ${cls.attackMin},
    attackMax: ${cls.attackMax},
    mana: ${cls.mana},
    maxMana: ${cls.maxMana},
    description: ${JSON.stringify(cls.description)},
    abilities: [
${abs}
    ],
  }`;
}

for (const k of Object.keys(PLAYER_CLASSES)) {
  if (LOCKED.has(k)) continue;
  if (!PER_CLASS_PASSIVES[k]) {
    throw new Error(`Add PER_CLASS_PASSIVES["${k}"] in scripts/per-class-passives.ts`);
  }
}

const header = readFileSync(OUT, "utf8").split("export const PLAYER_CLASSES")[0]!;
const keys = Object.keys(PLAYER_CLASSES).sort((a, b) => a.localeCompare(b));
const body = keys.map((k) => fmtClass(k, PLAYER_CLASSES[k]!)).join(",\n");
writeFileSync(OUT, `${header}export const PLAYER_CLASSES: Record<string, PlayerClass> = {\n${body}\n};\n`);
console.log("Wrote", OUT);
