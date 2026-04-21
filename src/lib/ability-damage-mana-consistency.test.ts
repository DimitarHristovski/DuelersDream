import { describe, expect, it } from "vitest";
import { PLAYER_CLASSES } from "@/components/game/class-data";
import { parseMaxDirectDamageFromDescription } from "./ability-damage-parse";

/**
 * Balance rules for direct-hit actives (see `ability-economy.ts` for pressure score):
 * 1) More damage → at least as much mana as any strictly weaker hit.
 * 2) Same or more damage with a shorter cooldown → at least as much mana as the slower one
 *    (longer CD may cost less mana for a comparable hit).
 */
describe("class-data damage vs mana vs cooldown (active skills)", () => {
  it("within each class: (1) lower max hit never costs more mana than a strictly stronger hit; (2) same or higher max hit with shorter cooldown never costs less mana than the slower one", () => {
    const violations: string[] = [];

    for (const [className, cls] of Object.entries(PLAYER_CLASSES)) {
      const rows = cls.abilities
        .filter((a) => {
          if (/summon/i.test(a.name)) return false;
          const maxDmg = parseMaxDirectDamageFromDescription(a.description);
          return (
            maxDmg !== null &&
            maxDmg > 0 &&
            (a.cooldown > 0 || a.manaCost > 0)
          );
        })
        .map((a) => ({
          name: a.name,
          mana: a.manaCost,
          cd: a.cooldown,
          maxDmg: parseMaxDirectDamageFromDescription(a.description)!,
        }));

      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows.length; j++) {
          if (i === j) continue;
          const A = rows[i]!;
          const B = rows[j]!;
          if (A.maxDmg < B.maxDmg && A.mana > B.mana) {
            violations.push(
              `${className}: "${A.name}" (${A.maxDmg} dmg, ${A.mana} mana, ${A.cd}s cd) vs "${B.name}" (${B.maxDmg} dmg, ${B.mana} mana, ${B.cd}s cd) — weaker hit costs more mana`
            );
          }
          if (A.maxDmg >= B.maxDmg && A.cd < B.cd && A.mana < B.mana) {
            violations.push(
              `${className}: "${A.name}" (${A.maxDmg} dmg, ${A.mana} mana, ${A.cd}s cd) vs "${B.name}" (${B.maxDmg} dmg, ${B.mana} mana, ${B.cd}s cd) — shorter cooldown should cost at least as much mana`
            );
          }
        }
      }
    }

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
