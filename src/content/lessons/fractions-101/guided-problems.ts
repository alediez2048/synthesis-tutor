/**
 * Guided practice for Lesson 1: What Are Fractions?
 */

import type { GuidedProblemConfig } from '../../../content/guided-practice-config';

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
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "Last challenge! Can you make something equal to 1/2 but with different numbers? Try splitting!",
    maxAttempts: 3,
  },
];
