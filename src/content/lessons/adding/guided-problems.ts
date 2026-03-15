/**
 * Guided practice for Lesson 2: Adding Fractions.
 */

import type { GuidedProblemConfig } from '../../../content/guided-practice-config';

export const GUIDED_PROBLEMS: GuidedProblemConfig[] = [
  {
    id: 0,
    type: 'split',
    setup: [{ numerator: 1, denominator: 2 }, { numerator: 1, denominator: 4 }],
    prompt: "Let's add 1/2 and 1/4. Select both blocks and tap Add!",
    hint: "Tap both crystals to select them, then press the Add button!",
    maxAttempts: 3,
  },
  {
    id: 1,
    type: 'build-equivalent',
    setup: [{ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 6 }],
    prompt: "Add 1/3 and 1/6. What do you get?",
    hint: "Select both crystals and tap Add to combine their magical power!",
    maxAttempts: 3,
  },
  {
    id: 2,
    type: 'compare',
    setup: [{ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 4 }],
    prompt: "Add 1/2 + 1/2. Then add 2/4 + 2/4. Are they the same?",
    hint: "Try adding each pair, then drag the results to the Spell Altar to compare!",
    maxAttempts: 2,
  },
  {
    id: 3,
    type: 'simplify',
    setup: [{ numerator: 1, denominator: 4 }, { numerator: 2, denominator: 4 }],
    prompt: "Add 1/4 + 2/4. What's the simplest form?",
    hint: "Select both crystals and tap Add. Can you simplify the result?",
    maxAttempts: 3,
  },
];
