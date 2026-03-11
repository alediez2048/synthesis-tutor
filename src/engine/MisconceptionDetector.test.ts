/**
 * ENG-019: Truth table tests for MisconceptionDetector.
 * All inputs are wrong answers (areEquivalent(parsed, target) === false).
 */

import { describe, it, expect } from 'vitest';
import { detectMisconception } from './MisconceptionDetector';

describe('MisconceptionDetector', () => {
  describe('flipped_fraction', () => {
    it('detects 3/1 as flipped 1/3', () => {
      const result = detectMisconception(
        { numerator: 3, denominator: 1 },
        { numerator: 1, denominator: 3 }
      );
      expect(result.type).toBe('flipped_fraction');
    });

    it('detects 2/1 as flipped 1/2', () => {
      const result = detectMisconception(
        { numerator: 2, denominator: 1 },
        { numerator: 1, denominator: 2 }
      );
      expect(result.type).toBe('flipped_fraction');
    });

    it('detects 4/3 as flipped 3/4', () => {
      const result = detectMisconception(
        { numerator: 4, denominator: 3 },
        { numerator: 3, denominator: 4 }
      );
      expect(result.type).toBe('flipped_fraction');
    });

    it('detects 4/2 vs 1/2 as flipped (simplified: 2/1 vs 1/2)', () => {
      const result = detectMisconception(
        { numerator: 4, denominator: 2 },
        { numerator: 1, denominator: 2 }
      );
      expect(result.type).toBe('flipped_fraction');
    });

    it('detects 12/1 vs 1/12 as flipped (large fractions)', () => {
      const result = detectMisconception(
        { numerator: 12, denominator: 1 },
        { numerator: 1, denominator: 12 }
      );
      expect(result.type).toBe('flipped_fraction');
    });
  });

  describe('used_whole_number', () => {
    it('detects 2/1 vs 1/3 as used_whole_number (not a flip of target)', () => {
      const result = detectMisconception(
        { numerator: 2, denominator: 1 },
        { numerator: 1, denominator: 3 }
      );
      expect(result.type).toBe('used_whole_number');
    });

    it('detects 5/1 vs 1/2 as used_whole_number', () => {
      const result = detectMisconception(
        { numerator: 5, denominator: 1 },
        { numerator: 1, denominator: 2 }
      );
      expect(result.type).toBe('used_whole_number');
    });

    it('1/1 vs 1/2 is same_numerator not used_whole_number (numerator not > 1)', () => {
      const result = detectMisconception(
        { numerator: 1, denominator: 1 },
        { numerator: 1, denominator: 2 }
      );
      expect(result.type).toBe('same_numerator');
      expect(result.type).not.toBe('used_whole_number');
    });
  });

  describe('same_denominator', () => {
    it('detects 3/4 vs 1/4 as same_denominator', () => {
      const result = detectMisconception(
        { numerator: 3, denominator: 4 },
        { numerator: 1, denominator: 4 }
      );
      expect(result.type).toBe('same_denominator');
    });

    it('detects 1/6 vs 5/6 as same_denominator', () => {
      const result = detectMisconception(
        { numerator: 1, denominator: 6 },
        { numerator: 5, denominator: 6 }
      );
      expect(result.type).toBe('same_denominator');
    });
  });

  describe('same_numerator', () => {
    it('detects 1/3 vs 1/4 as same_numerator', () => {
      const result = detectMisconception(
        { numerator: 1, denominator: 3 },
        { numerator: 1, denominator: 4 }
      );
      expect(result.type).toBe('same_numerator');
    });

    it('detects 2/5 vs 2/3 as same_numerator', () => {
      const result = detectMisconception(
        { numerator: 2, denominator: 5 },
        { numerator: 2, denominator: 3 }
      );
      expect(result.type).toBe('same_numerator');
    });
  });

  describe('off_by_one', () => {
    it('same_denominator takes priority over off_by_one (2/4 vs 3/4)', () => {
      const result = detectMisconception(
        { numerator: 2, denominator: 4 },
        { numerator: 3, denominator: 4 }
      );
      expect(result.type).toBe('same_denominator');
    });

    it('same_numerator takes priority over off_by_one (1/5 vs 1/6)', () => {
      const result = detectMisconception(
        { numerator: 1, denominator: 5 },
        { numerator: 1, denominator: 6 }
      );
      expect(result.type).toBe('same_numerator');
    });

    it('returns off_by_one when same den, num off by 1, and same_numerator does not apply', () => {
      // 2/7 vs 3/7: same den, num off by 1 → same_denominator fires first (not off_by_one)
      const result = detectMisconception(
        { numerator: 2, denominator: 7 },
        { numerator: 3, denominator: 7 }
      );
      expect(result.type).toBe('same_denominator');
    });
  });

  describe('random_guess', () => {
    it('detects 5/7 vs 1/2 as random_guess', () => {
      const result = detectMisconception(
        { numerator: 5, denominator: 7 },
        { numerator: 1, denominator: 2 }
      );
      expect(result.type).toBe('random_guess');
    });

    it('detects 3/11 vs 2/5 as random_guess', () => {
      const result = detectMisconception(
        { numerator: 3, denominator: 11 },
        { numerator: 2, denominator: 5 }
      );
      expect(result.type).toBe('random_guess');
    });
  });

  describe('priority order', () => {
    it('flipped takes priority over used_whole_number (3/1 vs 1/3)', () => {
      const result = detectMisconception(
        { numerator: 3, denominator: 1 },
        { numerator: 1, denominator: 3 }
      );
      expect(result.type).toBe('flipped_fraction');
    });

    it('same_denominator takes priority over off_by_one (3/4 vs 1/4)', () => {
      const result = detectMisconception(
        { numerator: 3, denominator: 4 },
        { numerator: 1, denominator: 4 }
      );
      expect(result.type).toBe('same_denominator');
    });
  });

  describe('edge cases', () => {
    it('simplified forms in flipped: 4/2 vs 2/4 → flipped_fraction', () => {
      // 4/2 -> 2/1, 2/4 -> 1/2; 2===2 and 1===1
      const result = detectMisconception(
        { numerator: 4, denominator: 2 },
        { numerator: 2, denominator: 4 }
      );
      expect(result.type).toBe('flipped_fraction');
    });

    it('1/1 vs 1/2 → same_numerator (not whole number)', () => {
      const result = detectMisconception(
        { numerator: 1, denominator: 1 },
        { numerator: 1, denominator: 2 }
      );
      expect(result.type).toBe('same_numerator');
    });

    it('returns description for each type', () => {
      const result = detectMisconception(
        { numerator: 3, denominator: 1 },
        { numerator: 1, denominator: 3 }
      );
      expect(result.description).toContain('flipped');
      expect(result.description).toContain('3/1');
      expect(result.description).toContain('1/3');
    });
  });
});
