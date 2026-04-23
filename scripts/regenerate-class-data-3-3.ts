/**
 * One-shot generator: rewrites PLAYER_CLASSES (except Godslayer, Archon) to 3 actives + 3 passives.
 * Run from repo root: npx tsx scripts/regenerate-class-data-3-3.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PLAYER_CLASSES, type PlayerClass, type PlayerClassAbility } from "../src/components/game/class-data";
import { parseMaxDirectDamageFromDescription } from "../src/lib/ability-damage-parse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/components/game/class-data.ts");
const SKIP = new Set(["Godslayer", "Archon"]);

function isPassiveRow(a: PlayerClassAbility): boolean {
  return (a.cooldown === 0 && a.manaCost === 0) || a.name === "Spirit Endurance";
}

function scoreActive(a: PlayerClassAbility): number {
  if (/execute|divine execution/i.test(a.name)) return 9000 + a.manaCost * 2;
  const d = a.description;
  const twice = d.match(/(\d+)\s*[-–]\s*(\d+)\s*damage each/i);
  if (twice) {
    const hi = Math.max(parseInt(twice[1], 10), parseInt(twice[2], 10));
    return hi * 2 * 20 + a.manaCost;
  }
  const ww = d.match(/Whirlwind\s+(\d+)/i);
  if (ww) return parseInt(ww[1], 10) * 25 + a.manaCost;
  const summ = d.match(/deals?\s+(\d+)\s*damage per turn/i);
  if (summ) return parseInt(summ[1], 10) * 40 + a.manaCost + (a.cooldown < 10 ? 20 : 0);
  const pct = d.match(/(\d+)%\s*more damage everyturn/i);
  if (pct) return 800 + parseInt(pct[1], 10);
  const parsed = parseMaxDirectDamageFromDescription(d);
  if (parsed !== null) return parsed * 20 + a.manaCost - a.cooldown * 0.3;
  const heal = d.match(/Restore\s+(\d+)\s*health/i);
  if (heal) return parseInt(heal[1], 10) * 4 + a.manaCost;
  const hpPct = d.match(/restore\s+(\d+)%\s*health/i);
  if (hpPct) return parseInt(hpPct[1], 10) * 25;
  const shield = d.match(/blocks?\s+(\d+)\s*damage/i);
  if (shield) return parseInt(shield[1], 10) * 6 + a.manaCost;
  const atk = d.match(/Increase attack by (\d+)/i);
  if (atk) return parseInt(atk[1], 10) * 8 + a.manaCost;
  const spell = d.match(/Increase spell damage by (\d+)/i);
  if (spell) return parseInt(spell[1], 10) * 8 + a.manaCost;
  if (/untargetable|Repel abilities|counterattack/i.test(d)) return 350 + a.manaCost;
  if (/Fire three quick shots/i.test(d)) return 80 + a.manaCost;
  return 50 + a.manaCost + (6 - Math.min(6, a.cooldown)) * 2;
}

function passiveFromDropped(className: string, a: PlayerClassAbility, idx: number): PlayerClassAbility {
  const base = a.name.replace(/\s*\(Innate\)\s*$/i, "").trim();
  const snippet = a.description.replace(/\s+/g, " ").trim().replace(/^Passive:\s*/i, "");
  const designedNames = [
    `${base} Discipline`,
    `${base} Doctrine`,
    `${base} Legacy`,
  ];
  const chosenName = designedNames[idx % designedNames.length];
  return {
    name: chosenName,
    iconName: a.iconName || "Sparkles",
    description: `Passive: ${className} training in ${base} becomes instinct, granting steady combat value. (${snippet.slice(0, 88)}${snippet.length > 88 ? "…" : ""})`,
    cooldown: 0,
    manaCost: 0,
  };
}

function redesignExistingPassive(className: string, p: PlayerClassAbility, idx: number): PlayerClassAbility {
  const rawName = p.name.replace(/\s*\(Innate\)\s*$/i, "").trim();
  const descBody = p.description
    .replace(/^Passive Ultimate:\s*/i, "")
    .replace(/^Passive:\s*/i, "")
    .replace(/^Latent echo of [^—-]+[—-]\s*/i, "")
    .trim();

  // Keep known passives with gameplay hooks stable.
  const keepName = new Set([
    "Mutagens",
    "Monster Lore",
    "Monster Killer",
    "Alchemy Mastery",
    "Totemic Strength",
    "Spirit Endurance",
    "Gods's Wrath",
    "Elemental Mastery",
    "Mana Overflow",
    "Elemental Harmony",
    "Executioner's Zeal",
    "Oath of Finality",
    "Relentless Verdict",
    "Godbreaker’s Might",
    "Perfect Form",
    "Decree",
    "Seraphic Flow",
    "Aegis of Order",
    "Judicial Pressure",
    "Necromancy Mastery",
  ]);
  if (keepName.has(rawName)) {
    return { ...p, name: rawName, description: `Passive: ${descBody}` };
  }

  const redesignedNames = [`${rawName} Doctrine`, `${rawName} Legacy`, `${rawName} Mastery`];
  return {
    ...p,
    name: redesignedNames[idx % redesignedNames.length],
    description: `Passive: ${className} discipline centered on ${rawName}; ${descBody}`,
  };
}

function rebalance(className: string, cls: PlayerClass): PlayerClassAbility[] {
  const passivesIn = cls.abilities.filter(isPassiveRow);
  const activesIn = cls.abilities.filter((x) => !isPassiveRow(x));
  const ranked = [...activesIn].sort((a, b) => scoreActive(b) - scoreActive(a));
  const top3 = ranked.slice(0, 3);
  const dropped = ranked.slice(3);
  const passives: PlayerClassAbility[] = [];
  for (const p of passivesIn) {
    if (passives.length >= 3) break;
    passives.push(redesignExistingPassive(className, p, passives.length));
  }
  let i = 0;
  while (passives.length < 3 && i < dropped.length) {
    passives.push(passiveFromDropped(className, dropped[i]!, passives.length));
    i++;
  }
  while (passives.length < 3) {
    passives.push({
      name: `Combat Instinct ${passives.length + 1}`,
      iconName: "Shield",
      description: "Passive: Years of dueling sharpen minor resistances and focus.",
      cooldown: 0,
      manaCost: 0,
    });
  }
  // Mark one active and one passive as ultimates for clearer identity.
  const actives = [...top3];
  const passivePack = passives.slice(0, 3);
  if (actives[0] && !/^Ultimate:/i.test(actives[0].description)) {
    actives[0] = { ...actives[0], description: `Ultimate: ${actives[0].description}` };
  }
  const passiveUltimateIdx = passivePack.findIndex((p) => /reincarnation|immunity|permanent|stacks/i.test(p.description));
  const chosenPassiveIdx = passiveUltimateIdx >= 0 ? passiveUltimateIdx : 0;
  if (passivePack[chosenPassiveIdx] && !/^Passive Ultimate:/i.test(passivePack[chosenPassiveIdx].description)) {
    passivePack[chosenPassiveIdx] = {
      ...passivePack[chosenPassiveIdx],
      description: `Passive Ultimate: ${passivePack[chosenPassiveIdx].description.replace(/^Passive:\s*/i, "")}`,
    };
  }

  return [...actives, ...passivePack];
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
  const abs = (SKIP.has(name) ? cls.abilities : rebalance(name, cls)).map(fmtAbility).join(",\n");
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

const header = readFileSync(OUT, "utf8").split("export const PLAYER_CLASSES")[0]!;
const keys = Object.keys(PLAYER_CLASSES).sort((a, b) => a.localeCompare(b));
const body = keys.map((k) => fmtClass(k, PLAYER_CLASSES[k]!)).join(",\n");
writeFileSync(OUT, `${header}export const PLAYER_CLASSES: Record<string, PlayerClass> = {\n${body}\n};\n`);
console.log("Wrote", OUT);
