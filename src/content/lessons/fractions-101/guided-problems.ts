/**
 * Guided practice for Lesson 1: What Are Fractions?
 */

import type { GuidedProblemConfig } from '../../../content/guided-practice-config';

export const GUIDED_PROBLEMS: GuidedProblemConfig[] = [
  {
    id: 0,
    type: 'split',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "See that block? That's one-half. Tap it and press Split!",
    hint: "Tap the block to select it, then press the Split button!",
    maxAttempts: 3,
  },
  {
    id: 1,
    type: 'compare',
    setup: [
      { numerator: 1, denominator: 2 },
      { numerator: 3, denominator: 6 },
    ],
    prompt: "Are these two blocks the same size? Drag them both to the comparison area!",
    hint: "Drag each block down to the comparison area to compare their sizes!",
    maxAttempts: 3,
  },
  {
    id: 2,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 3 }],
    prompt: "Can you make a block the same size as 1/3 but with different numbers?",
    hint: "Split the 1/3 block! The pieces together still equal 1/3!",
    maxAttempts: 3,
  },
  {
    id: 3,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "Final challenge! Build a block equal to 1/2 using smaller pieces. You've got this!",
    hint: "Split the 1/2 block into pieces. Together they'll still equal 1/2 but with new numbers!",
    maxAttempts: 3,
  },
];
