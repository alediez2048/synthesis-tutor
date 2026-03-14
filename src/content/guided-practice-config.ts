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
  maxAttempts: number;
}

export const GUIDED_PROBLEMS: GuidedProblemConfig[] = [
  {
    id: 0,
    type: 'split',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "See that blue block? That's one-half. Tap it and press Split. Let's see what happens!",
    maxAttempts: 3,
  },
  {
    id: 1,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 3 }],
    prompt: "Can you make a fraction that's the same size as 1/3? Use the blocks to build it!",
    maxAttempts: 3,
  },
  {
    id: 2,
    type: 'compare',
    setup: [
      { numerator: 1, denominator: 2 },
      { numerator: 3, denominator: 6 },
    ],
    prompt: "Look at these two blocks. Are they the same size? Drag them both to the comparison area!",
    maxAttempts: 2,
  },
  {
    id: 3,
    type: 'simplify',
    setup: [{ numerator: 2, denominator: 4 }],
    prompt: "Here's a trickier one. What's the simplest way to write 2/4?",
    maxAttempts: 3,
  },
];
