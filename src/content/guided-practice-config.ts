/**
 * Guided practice problem definitions (GP-1 through GP-4).
 * PRD Section 7.3.
 */

import type { Fraction } from '../engine/FractionEngine';

export type GuidedProblemType =
  | 'split' // GP-1: split 1/2 into 2
  | 'build-equivalent' // GP-2: build equivalent to 1/3
  | 'compare' // GP-3: compare 1/2 and 3/6
  | 'simplify'; // GP-4: simplify 2/4 to 1/2

export interface GuidedProblemConfig {
  id: number;
  type: GuidedProblemType;
  setup: Fraction[];
  prompt: string;
  hint: string;
  maxAttempts: number;
}
