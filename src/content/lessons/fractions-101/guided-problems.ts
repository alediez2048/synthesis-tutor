/**
 * Guided practice for Lesson 1: What Are Fractions?
 */

import type { GuidedProblemConfig } from '../../../content/guided-practice-config';

export const GUIDED_PROBLEMS: GuidedProblemConfig[] = [
  {
    id: 0,
    type: 'split',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "See that crystal? That's one-half. Cast a break spell on it — tap it and press Split Crystal!",
    hint: "Tap the crystal to select it, then press the Split Crystal button!",
    maxAttempts: 3,
  },
  {
    id: 1,
    type: 'compare',
    setup: [
      { numerator: 1, denominator: 2 },
      { numerator: 3, denominator: 6 },
    ],
    prompt: "Do these two crystals have the same magical power? Drag them both to the Spell Altar!",
    hint: "Drag each crystal down to the Spell Altar to compare their sizes!",
    maxAttempts: 3,
  },
  {
    id: 2,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 3 }],
    prompt: "Can you make a crystal with the same magical power as 1/3 but with different numbers?",
    hint: "Cast a break spell on the 1/3 crystal! The pieces together still equal 1/3!",
    maxAttempts: 3,
  },
  {
    id: 3,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 2 }],
    prompt: "Final challenge! Build a crystal equal to 1/2 using smaller pieces. You've got this!",
    hint: "Split the 1/2 crystal into pieces. Together they'll still equal 1/2 but with new numbers!",
    maxAttempts: 3,
  },
];
