import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
  type Fraction,
  simplify,
  areEquivalent,
  split,
  combine,
  toCommonDenominator,
  isValidFraction,
  parseStudentInput,
  addFractions,
  subtractFractions,
  multiplyFractions,
  divideFractions,
} from './FractionEngine';

/** Lesson-scope valid fraction: numerator 1..100, denominator 1..12 (integers). */
const arbitraryFraction: fc.Arbitrary<Fraction> = fc.record({
  numerator: fc.integer({ min: 1, max: 100 }),
  denominator: fc.integer({ min: 1, max: 12 }),
});

describe('FractionEngine', () => {
  describe('simplify', () => {
    it('reduces 4/8 to 1/2', () => {
      expect(simplify({ numerator: 4, denominator: 8 })).toEqual({
        numerator: 1,
        denominator: 2,
      });
    });
    it('reduces 3/6 to 1/2', () => {
      expect(simplify({ numerator: 3, denominator: 6 })).toEqual({
        numerator: 1,
        denominator: 2,
      });
    });
    it('leaves 1/2 unchanged', () => {
      expect(simplify({ numerator: 1, denominator: 2 })).toEqual({
        numerator: 1,
        denominator: 2,
      });
    });
    it('preserves value: areEquivalent(f, simplify(f))', () => {
      const f: Fraction = { numerator: 6, denominator: 8 };
      expect(areEquivalent(f, simplify(f))).toBe(true);
    });
    it('throws on denominator 0', () => {
      expect(() => simplify({ numerator: 1, denominator: 0 })).toThrow('simplify: denominator must be positive');
    });
  });

  describe('areEquivalent', () => {
    it('returns true for 1/2 and 2/4', () => {
      expect(areEquivalent({ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 4 })).toBe(true);
    });
    it('returns false for 1/2 and 1/3', () => {
      expect(areEquivalent({ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 3 })).toBe(false);
    });
    it('is reflexive: f equivalent to itself', () => {
      const f: Fraction = { numerator: 3, denominator: 7 };
      expect(areEquivalent(f, f)).toBe(true);
    });
    it('is symmetric: areEquivalent(a,b) === areEquivalent(b,a)', () => {
      const a: Fraction = { numerator: 2, denominator: 5 };
      const b: Fraction = { numerator: 4, denominator: 10 };
      expect(areEquivalent(a, b)).toBe(areEquivalent(b, a));
    });
  });

  describe('split', () => {
    it('splits 1/2 into 2 parts as [1/4, 1/4]', () => {
      const result = split({ numerator: 1, denominator: 2 }, 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ numerator: 1, denominator: 4 });
      expect(result[1]).toEqual({ numerator: 1, denominator: 4 });
    });
    it('split then combine is equivalent to original', () => {
      const f: Fraction = { numerator: 1, denominator: 3 };
      const pieces = split(f, 2);
      const recombined = combine(pieces);
      expect(areEquivalent(recombined, f)).toBe(true);
    });
    it('splits 2/4 into 2 parts as [2/8, 2/8]', () => {
      const result = split({ numerator: 2, denominator: 4 }, 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ numerator: 2, denominator: 8 });
      expect(areEquivalent(combine(result), { numerator: 2, denominator: 4 })).toBe(true);
    });
    it('throws when parts < 2', () => {
      expect(() => split({ numerator: 1, denominator: 2 }, 1)).toThrow('split: parts must be >= 2');
      expect(() => split({ numerator: 1, denominator: 2 }, 0)).toThrow('split: parts must be >= 2');
    });
  });

  describe('combine', () => {
    it('combines two 1/4 into 2/4', () => {
      const result = combine([
        { numerator: 1, denominator: 4 },
        { numerator: 1, denominator: 4 },
      ]);
      expect(result).toEqual({ numerator: 2, denominator: 4 });
    });
    it('throws on empty array', () => {
      expect(() => combine([])).toThrow('combine: empty array');
    });
    it('throws on mismatched denominators', () => {
      expect(() =>
        combine([
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
        ])
      ).toThrow('combine: mismatched denominators');
    });
  });

  describe('toCommonDenominator', () => {
    it('expresses 1/2 and 1/3 with denominator 6', () => {
      const [a, b] = toCommonDenominator(
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 3 }
      );
      expect(a.denominator).toBe(6);
      expect(b.denominator).toBe(6);
      expect(a.numerator).toBe(3);
      expect(b.numerator).toBe(2);
      expect(areEquivalent(a, { numerator: 1, denominator: 2 })).toBe(true);
      expect(areEquivalent(b, { numerator: 1, denominator: 3 })).toBe(true);
    });
    it('throws when either denominator is 0', () => {
      expect(() =>
        toCommonDenominator({ numerator: 1, denominator: 0 }, { numerator: 1, denominator: 2 })
      ).toThrow('toCommonDenominator: denominators must be positive');
      expect(() =>
        toCommonDenominator({ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 0 })
      ).toThrow('toCommonDenominator: denominators must be positive');
    });
  });

  describe('isValidFraction', () => {
    it('returns true for 1/2', () => {
      expect(isValidFraction({ numerator: 1, denominator: 2 })).toBe(true);
    });
    it('returns true for 12/12 (denominator 12 allowed)', () => {
      expect(isValidFraction({ numerator: 12, denominator: 12 })).toBe(true);
    });
    it('returns false for denominator 0', () => {
      expect(isValidFraction({ numerator: 1, denominator: 0 })).toBe(false);
    });
    it('returns false for denominator 13', () => {
      expect(isValidFraction({ numerator: 1, denominator: 13 })).toBe(false);
    });
    it('returns false for numerator 0', () => {
      expect(isValidFraction({ numerator: 0, denominator: 1 })).toBe(false);
    });
    it('returns false for negative numerator', () => {
      expect(isValidFraction({ numerator: -1, denominator: 2 })).toBe(false);
    });
  });

  describe('parseStudentInput', () => {
    it('parses "1/2"', () => {
      expect(parseStudentInput('1/2')).toEqual({ numerator: 1, denominator: 2 });
    });
    it('parses "2 / 4" with spaces', () => {
      expect(parseStudentInput('2 / 4')).toEqual({ numerator: 2, denominator: 4 });
    });
    it('parses "  3/6  " trimmed', () => {
      expect(parseStudentInput('  3/6  ')).toEqual({ numerator: 3, denominator: 6 });
    });
    it('returns null for denominator 0', () => {
      expect(parseStudentInput('1/0')).toBeNull();
    });
    it('returns null for denominator > 12', () => {
      expect(parseStudentInput('1/13')).toBeNull();
    });
    it('returns null for non-fraction text', () => {
      expect(parseStudentInput('hello')).toBeNull();
      expect(parseStudentInput('')).toBeNull();
    });
    it('returns null for negative (invalid pattern or value)', () => {
      expect(parseStudentInput('-1/2')).toBeNull();
    });
    it('parses multi-digit numerator and denominator', () => {
      expect(parseStudentInput('12/4')).toEqual({ numerator: 12, denominator: 4 });
    });
  });

  describe('FractionEngine property-based', () => {
    it('areEquivalent is reflexive (10k runs)', () => {
      fc.assert(
        fc.property(arbitraryFraction, (f) => areEquivalent(f, f)),
        { numRuns: 10_000 }
      );
    });
    it('areEquivalent is symmetric (10k runs)', () => {
      fc.assert(
        fc.property(arbitraryFraction, arbitraryFraction, (a, b) => areEquivalent(a, b) === areEquivalent(b, a)),
        { numRuns: 10_000 }
      );
    });
    it('split then combine is equivalent to original (10k runs)', () => {
      const partsArb = fc.integer({ min: 2, max: 6 });
      fc.assert(
        fc.property(arbitraryFraction, partsArb, (f, parts) =>
          areEquivalent(combine(split(f, parts)), f)
        ),
        { numRuns: 10_000 }
      );
    });
    it('simplify preserves value and does not increase denominator (10k runs)', () => {
      fc.assert(
        fc.property(arbitraryFraction, (f) => {
          const s = simplify(f);
          return areEquivalent(f, s) && s.denominator <= f.denominator;
        }),
        { numRuns: 10_000 }
      );
    });
  });

  describe('addFractions', () => {
    it('adds 1/2 + 1/4 = 3/4', () => {
      const result = addFractions({ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 });
      expect(result).toEqual({ numerator: 3, denominator: 4 });
    });
    it('adds 1/3 + 1/3 = 2/3', () => {
      const result = addFractions({ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 3 });
      expect(result).toEqual({ numerator: 2, denominator: 3 });
    });
    it('is commutative', () => {
      const a = { numerator: 1, denominator: 2 };
      const b = { numerator: 1, denominator: 3 };
      expect(areEquivalent(addFractions(a, b), addFractions(b, a))).toBe(true);
    });
    it('addFractions(a,b) equivalent to combine(toCommonDenominator(a,b))', () => {
      const a = { numerator: 1, denominator: 2 };
      const b = { numerator: 1, denominator: 3 };
      const [a2, b2] = toCommonDenominator(a, b);
      expect(areEquivalent(addFractions(a, b), combine([a2, b2]))).toBe(true);
    });
    it('throws when result denominator > 12', () => {
      // 1/8 + 1/6 = 7/24, denominator 24 > 12
      expect(() =>
        addFractions({ numerator: 1, denominator: 8 }, { numerator: 1, denominator: 6 })
      ).toThrow();
    });
  });

  describe('subtractFractions', () => {
    it('subtracts 3/4 - 1/4 = 1/2', () => {
      const result = subtractFractions({ numerator: 3, denominator: 4 }, { numerator: 1, denominator: 4 });
      expect(result).toEqual({ numerator: 1, denominator: 2 });
    });
    it('returns null when result would be negative', () => {
      expect(subtractFractions({ numerator: 1, denominator: 4 }, { numerator: 1, denominator: 2 })).toBeNull();
    });
    it('addFractions(subtractFractions(a,b), b) equivalent to a when result non-negative', () => {
      const a = { numerator: 3, denominator: 4 };
      const b = { numerator: 1, denominator: 4 };
      const diff = subtractFractions(a, b);
      expect(diff).not.toBeNull();
      if (diff) {
        expect(areEquivalent(addFractions(diff, b), a)).toBe(true);
      }
    });
  });

  describe('multiplyFractions', () => {
    it('multiplies 1/2 * 2/3 = 1/3', () => {
      const result = multiplyFractions({ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 3 });
      expect(result).toEqual({ numerator: 1, denominator: 3 });
    });
    it('multiplyFractions(f, {n:1,d:1}) equivalent to f', () => {
      const f = { numerator: 3, denominator: 7 };
      expect(areEquivalent(multiplyFractions(f, { numerator: 1, denominator: 1 }), f)).toBe(true);
    });
    it('throws when result denominator > 12', () => {
      expect(() =>
        multiplyFractions({ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 5 })
      ).toThrow();
    });
  });

  describe('divideFractions', () => {
    it('divides 1/2 / 1/4 = 2', () => {
      const result = divideFractions({ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 });
      expect(result).toEqual({ numerator: 2, denominator: 1 });
    });
    it('multiplyFractions(divideFractions(a,b), b) equivalent to a', () => {
      const a = { numerator: 1, denominator: 2 };
      const b = { numerator: 1, denominator: 4 };
      const quot = divideFractions(a, b);
      expect(areEquivalent(multiplyFractions(quot, b), a)).toBe(true);
    });
    it('throws on division by zero', () => {
      expect(() => divideFractions({ numerator: 1, denominator: 2 }, { numerator: 0, denominator: 1 })).toThrow();
    });
  });
});
