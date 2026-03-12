/**
 * ENG-018: Deterministic misconception detection for wrong fraction answers.
 * Used by check_answer tool so Claude can scaffold by misconception type.
 */

import { simplify } from './FractionEngine.js';
import type { Fraction } from './FractionEngine.js';

export type MisconceptionType =
  | 'flipped_fraction'
  | 'used_whole_number'
  | 'same_denominator'
  | 'same_numerator'
  | 'off_by_one'
  | 'random_guess';

export interface MisconceptionResult {
  type: MisconceptionType;
  description: string;
}

/**
 * Identify the most likely misconception when a student's answer is wrong.
 * PRECONDITION: parsed and target are valid fractions, and areEquivalent(parsed, target) === false.
 * This function MUST NOT check correctness — that's FractionEngine's job.
 */
export function detectMisconception(
  parsed: Fraction,
  target: Fraction
): MisconceptionResult {
  const simplifiedTarget = simplify(target);
  const simplifiedParsed = simplify(parsed);

  if (
    simplifiedParsed.numerator === simplifiedTarget.denominator &&
    simplifiedParsed.denominator === simplifiedTarget.numerator
  ) {
    return {
      type: 'flipped_fraction',
      description: `Student may have flipped the fraction — gave ${parsed.numerator}/${parsed.denominator} instead of ${target.numerator}/${target.denominator}`,
    };
  }

  if (parsed.denominator === 1 && parsed.numerator > 1) {
    return {
      type: 'used_whole_number',
      description: `Student gave a whole number (${parsed.numerator}) instead of a fraction`,
    };
  }

  if (
    parsed.denominator === target.denominator &&
    parsed.numerator !== target.numerator
  ) {
    return {
      type: 'same_denominator',
      description: `Student kept the denominator (${parsed.denominator}) but changed the numerator`,
    };
  }

  if (
    parsed.numerator === target.numerator &&
    parsed.denominator !== target.denominator
  ) {
    return {
      type: 'same_numerator',
      description: `Student kept the numerator (${parsed.numerator}) but changed the denominator`,
    };
  }

  if (
    Math.abs(parsed.numerator - target.numerator) === 1 &&
    parsed.denominator === target.denominator
  ) {
    return {
      type: 'off_by_one',
      description: 'Student is close — off by one in the numerator',
    };
  }
  if (
    parsed.numerator === target.numerator &&
    Math.abs(parsed.denominator - target.denominator) === 1
  ) {
    return {
      type: 'off_by_one',
      description: 'Student is close — off by one in the denominator',
    };
  }

  return {
    type: 'random_guess',
    description: `Student's answer (${parsed.numerator}/${parsed.denominator}) doesn't match a known pattern`,
  };
}
