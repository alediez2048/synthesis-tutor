/**
 * ENG-015: Extract fraction mentions (e.g. 1/2, 3/4) from tutor text for workspace highlights.
 */

export interface FractionRef {
  numerator: number;
  denominator: number;
}

const FRACTION_PATTERN = /(\d+)\s*\/\s*(\d+)/g;

/**
 * Parse text for fraction patterns n/d. Returns only valid lesson fractions:
 * numerator > 0, denominator 1–12.
 */
export function parseFractionReferences(text: string): FractionRef[] {
  const fractions: FractionRef[] = [];
  let match: RegExpExecArray | null;
  FRACTION_PATTERN.lastIndex = 0;
  while ((match = FRACTION_PATTERN.exec(text)) !== null) {
    const numerator = parseInt(match[1], 10);
    const denominator = parseInt(match[2], 10);
    if (numerator > 0 && denominator > 0 && denominator <= 12) {
      fractions.push({ numerator, denominator });
    }
  }
  return fractions;
}
