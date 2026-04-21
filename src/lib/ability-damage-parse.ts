/**
 * Best-effort max direct damage from ability description text (for balance audits).
 * Returns null when no clear numeric hit is found.
 */
export function parseMaxDirectDamageFromDescription(description: string): number | null {
  const d = description.replace(/\u2013/g, "-");
  /** Execute / finisher text — numeric branch is not comparable to normal nukes for mana curves. */
  if (/instantly?\s+kill/i.test(d)) return null;

  const candidates: number[] = [];

  const rangeRe = /(?:deal|Deals?)\s+(\d+)\s*[-–]\s*(\d+)\s*(?:\w+\s+)?damage/gi;
  let m: RegExpExecArray | null;
  while ((m = rangeRe.exec(d)) !== null) {
    candidates.push(Math.max(parseInt(m[1], 10), parseInt(m[2], 10)));
  }

  const singleRe = /(?:deal|Deals?)\s+(\d+)\s+(?:\w+\s+)?damage/gi;
  while ((m = singleRe.exec(d)) !== null) {
    candidates.push(parseInt(m[1], 10));
  }

  const toEnemyRe = /(\d+)\s+damage\s+to\s+enemy/gi;
  while ((m = toEnemyRe.exec(d)) !== null) {
    candidates.push(parseInt(m[1], 10));
  }

  const otherwiseRe = /otherwise\s+deal\s+(\d+)\s+damage/gi;
  while ((m = otherwiseRe.exec(d)) !== null) {
    candidates.push(parseInt(m[1], 10));
  }

  const increaseDealRe = /(?:Increase|increase)[^.\d]*\d+%[^.\d]*deal\s+(\d+)\s+damage/gi;
  while ((m = increaseDealRe.exec(d)) !== null) {
    candidates.push(parseInt(m[1], 10));
  }

  const inflictRe = /Inflict\s+(\d+)\s+(?:bleed|poison)\s+damage/gi;
  while ((m = inflictRe.exec(d)) !== null) {
    candidates.push(parseInt(m[1], 10));
  }

  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}
