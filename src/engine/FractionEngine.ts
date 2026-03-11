/**
 * Fraction Engine — pure, deterministic fraction math.
 * This module is the sole authority on mathematical correctness for the tutor.
 */

export interface Fraction {
  numerator: number;
  denominator: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return (Math.abs(Math.floor(a)) * Math.abs(Math.floor(b))) / gcd(a, b);
}

/**
 * Reduce fraction to lowest terms via GCD.
 * Throws if denominator <= 0 (invalid Fraction — programming error).
 */
export function simplify(f: Fraction): Fraction {
  const d = Math.floor(f.denominator);
  if (d <= 0) throw new Error('simplify: denominator must be positive');
  const g = gcd(f.numerator, f.denominator);
  const num = Math.floor(f.numerator / g);
  const den = Math.floor(f.denominator / g);
  return { numerator: num, denominator: den };
}

/**
 * Equivalence check using cross-multiplication. No floating-point.
 */
export function areEquivalent(a: Fraction, b: Fraction): boolean {
  return (
    a.numerator * b.denominator === b.numerator * a.denominator
  );
}

/**
 * Split a fraction into N equal pieces. Each piece is f/parts.
 * combine(split(f, n)) is equivalent to f.
 * Throws if parts < 2 (programming error).
 */
export function split(f: Fraction, parts: number): Fraction[] {
  const n = Math.floor(parts);
  if (n < 2) throw new Error('split: parts must be >= 2');
  const den = f.denominator * n;
  const piece: Fraction = { numerator: f.numerator, denominator: den };
  return Array.from({ length: n }, () => ({ ...piece }));
}

/**
 * Sum fractions with the same denominator. Throws on empty array or mismatched denominators.
 */
export function combine(fractions: Fraction[]): Fraction {
  if (fractions.length === 0) {
    throw new Error('combine: empty array');
  }
  const den = fractions[0].denominator;
  let sumNum = 0;
  for (const fr of fractions) {
    if (fr.denominator !== den) {
      throw new Error('combine: mismatched denominators');
    }
    sumNum += fr.numerator;
  }
  return { numerator: sumNum, denominator: den };
}

/**
 * Express both fractions with the same denominator (LCD).
 * Returns [a', b'] equivalent to a and b with a'.denominator === b'.denominator.
 */
export function toCommonDenominator(a: Fraction, b: Fraction): [Fraction, Fraction] {
  const l = lcm(a.denominator, b.denominator);
  if (l === 0) throw new Error('toCommonDenominator: denominators must be positive');
  const aNum = a.numerator * (l / a.denominator);
  const bNum = b.numerator * (l / b.denominator);
  return [
    { numerator: aNum, denominator: l },
    { numerator: bNum, denominator: l },
  ];
}

/**
 * Guard: positive integers, denominator between 1 and 12 inclusive.
 */
export function isValidFraction(f: Fraction): boolean {
  const n = Math.floor(f.numerator);
  const d = Math.floor(f.denominator);
  return (
    Number.isFinite(f.numerator) &&
    Number.isFinite(f.denominator) &&
    n === f.numerator &&
    d === f.denominator &&
    n >= 1 &&
    d >= 1 &&
    d <= 12
  );
}

const FRACTION_INPUT_REGEX = /^(\d+)\s*\/\s*(\d+)$/;

/**
 * Parse student input "n/d" into a Fraction, or null if invalid.
 * Rejects denominator 0, denominator > 12, or non-positive.
 */
export function parseStudentInput(raw: string): Fraction | null {
  const trimmed = raw.trim();
  const match = trimmed.match(FRACTION_INPUT_REGEX);
  if (!match) return null;
  const numerator = parseInt(match[1], 10);
  const denominator = parseInt(match[2], 10);
  if (denominator === 0 || denominator > 12 || numerator < 1 || denominator < 1) {
    return null;
  }
  return { numerator, denominator };
}
