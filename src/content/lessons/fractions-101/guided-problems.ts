/**
 * Guided practice for Lesson 1: What Are Fractions?
 */

import type { GuidedProblemConfig } from '../../../content/guided-practice-config';

export const GUIDED_PROBLEMS: GuidedProblemConfig[] = [
  {
    id: 0,
    type: 'split',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "See that crystal? That's one-half. Tap it and press Split Crystal!",
    hint: "Tap the crystal to select it, then press the Split Crystal button below!",
    maxAttempts: 3,
  },
  {
    id: 1,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 3 }],
    prompt: "Can you make a fraction with the same magical power as 1/3? Try splitting it!",
    hint: "Split the 1/3 crystal into smaller pieces. The pieces together still equal 1/3!",
    maxAttempts: 3,
  },
  {
    id: 2,
    type: 'compare',
    setup: [
      { numerator: 1, denominator: 2 },
      { numerator: 3, denominator: 6 },
    ],
    prompt: "Are these two crystals the same size? Drag them both to the Spell Altar to find out!",
    hint: "Drag each crystal to the Comparison Portal below the workspace!",
    maxAttempts: 2,
  },
  {
    id: 3,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "Last challenge! Can you make something equal to 1/2 but with different numbers?",
    hint: "Try splitting the 1/2 crystal. The pieces together will still equal 1/2 but with new numbers!",
    maxAttempts: 3,
  },
];
