/**
 * Re-modeling demo scripts for guided practice.
 * When student fails 2x, Sam demonstrates the correct method.
 */

export type DemoScriptType = 'split' | 'combine';

export interface DemoScriptSplit {
  type: 'split';
  blockFraction: { numerator: number; denominator: number };
  parts: number;
}

export interface DemoScriptCombine {
  type: 'combine';
  fractions: Array<{ numerator: number; denominator: number }>;
}

export type DemoScript = DemoScriptSplit | DemoScriptCombine;

/** Demo script per guided problem index (GP-2 and GP-4 have demos). */
export const GUIDED_DEMO_SCRIPTS: Record<number, DemoScript | undefined> = {
  1: {
    type: 'split',
    blockFraction: { numerator: 1, denominator: 3 },
    parts: 2,
  },
  3: {
    type: 'split',
    blockFraction: { numerator: 1, denominator: 2 },
    parts: 2,
  },
};
