/**
 * Exploration rounds for Lesson 2: Adding Fractions.
 * Placeholder — addition-specific rounds (e.g., add same-denom, add unlike-denom).
 */

import type { ExplorationRoundConfig } from '../../../content/exploration-rounds';

export const EXPLORATION_ROUNDS: ExplorationRoundConfig[] = [
  {
    id: 1,
    name: 'Add Same Size',
    goal: 'Add two fractions with the same denominator',
    goalType: 'any_add',
    celebration: "You added them! Same-sized pieces combine together!",
  },
  {
    id: 2,
    name: 'Find Common Size',
    goal: 'Add fractions with different denominators',
    goalType: 'unlike_add',
    celebration: "You found a common size! That's the key to adding.",
    startingBlocks: [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 },
    ],
  },
  {
    id: 3,
    name: 'Free Addition',
    goal: 'Open play with Add button',
    goalType: 'timer',
    celebration: "You're getting the hang of adding fractions!",
  },
];

export const ROUND_3_TIMER_MS = 45_000;
