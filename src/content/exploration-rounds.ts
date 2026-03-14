/**
 * Exploration phase round configuration. Each round has a mini-goal,
 * celebration message, and block setup rules.
 */

import type { Fraction } from '../engine/FractionEngine';

export interface ExplorationRoundConfig {
  id: number;
  name: string;
  goal: string;
  celebration: string;
}

export const EXPLORATION_ROUNDS: ExplorationRoundConfig[] = [
  {
    id: 1,
    name: 'First Split',
    goal: 'Split any crystal',
    celebration: "You cast your first spell! You made smaller pieces!",
  },
  {
    id: 2,
    name: 'Split Again',
    goal: 'Split a different way',
    celebration: "Two different splits! Each spell makes different-sized pieces.",
  },
  {
    id: 3,
    name: 'Fusion Spell',
    goal: 'Combine two blocks',
    celebration: "Fusion! When pieces are the same size, they join together!",
  },
  {
    id: 4,
    name: 'The Comparison',
    goal: 'Drag two blocks to comparison zone',
    celebration: "They're the same! Different fractions, same magical power!",
  },
  {
    id: 5,
    name: 'Free Exploration',
    goal: 'Open play (60s timer)',
    celebration: "You've mastered the basics! Ready for a challenge?",
  },
];

export const ROUND_4_STARTING_BLOCKS: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 2, denominator: 4 },
];

export const ROUND_5_TIMER_MS = 60_000;
