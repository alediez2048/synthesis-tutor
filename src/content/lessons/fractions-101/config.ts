/**
 * Lesson 1: What Are Fractions? — Equivalence, split, combine, compare.
 */

import type { Fraction } from '../../../engine/FractionEngine';
import type { ExplorationRoundConfig } from '../../../content/exploration-rounds';
import type { GuidedProblemConfig } from '../../../content/guided-practice-config';
import { EXPLORATION_ROUNDS } from './exploration-rounds';
import { GUIDED_PROBLEMS } from './guided-problems';

export const LESSON_1_ID = 'fractions-101';

export const INITIAL_FRACTIONS: Fraction[] = [
  { numerator: 1, denominator: 1 }, // whole — matches current getInitialLessonState
];

export const EXPLORATION_ROUNDS_CONFIG: ExplorationRoundConfig[] = EXPLORATION_ROUNDS;

export const GUIDED_PROBLEMS_CONFIG: GuidedProblemConfig[] = GUIDED_PROBLEMS;
