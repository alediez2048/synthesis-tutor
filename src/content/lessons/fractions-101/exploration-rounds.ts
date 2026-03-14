/**
 * Exploration rounds for Lesson 1: What Are Fractions?
 */

import type { ExplorationRoundConfig } from '../../../content/exploration-rounds';

export const EXPLORATION_ROUNDS: ExplorationRoundConfig[] = [
  {
    id: 1,
    name: 'First Split',
    goal: 'Split any crystal',
    goalType: 'any_split',
    celebration: "You cast your first spell! You made smaller pieces!",
  },
  {
    id: 2,
    name: 'Fusion Spell',
    goal: 'Combine two blocks',
    goalType: 'any_combine',
    celebration: "Fusion! When pieces are the same size, they join together!",
  },
  {
    id: 3,
    name: 'Split Again',
    goal: 'Split a different way',
    goalType: 'different_split',
    celebration: "Two different splits! Each spell makes different-sized pieces.",
  },
  {
    id: 4,
    name: 'The Comparison',
    goal: 'Drag two blocks to comparison zone',
    goalType: 'equivalence_compare',
    celebration: "They're the same! Different fractions, same magical power!",
    startingBlocks: [
      { numerator: 1, denominator: 2 },
      { numerator: 2, denominator: 4 },
    ],
  },
  {
    id: 5,
    name: 'Free Exploration',
    goal: 'Open play (60s timer)',
    goalType: 'timer',
    celebration: "You've mastered the basics! Ready for a challenge?",
  },
];

export const ROUND_5_TIMER_MS = 60_000;
