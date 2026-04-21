import { describe, expect, it } from "vitest";
import { abilityPressureScore } from "./ability-economy";

describe("abilityPressureScore", () => {
  it("rises with damage and falls with longer cooldown", () => {
    expect(abilityPressureScore(100, 4)).toBeGreaterThan(abilityPressureScore(100, 9));
    expect(abilityPressureScore(60, 4)).toBeGreaterThan(abilityPressureScore(50, 4));
  });
});
