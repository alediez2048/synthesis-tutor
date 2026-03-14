/**
 * Lesson 2: Adding Fractions — Same-denom, common denominator, unlike-denom.
 */

import type { Fraction } from '../../../engine/FractionEngine';
import type { ExplorationRoundConfig } from '../../../content/exploration-rounds';
import type { GuidedProblemConfig } from '../../../content/guided-practice-config';
import { EXPLORATION_ROUNDS } from './exploration-rounds';
import { GUIDED_PROBLEMS } from './guided-problems';

export const LESSON_2_ID = 'adding';

export const INITIAL_FRACTIONS: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 4 },
];

export const EXPLORATION_ROUNDS_CONFIG: ExplorationRoundConfig[] = EXPLORATION_ROUNDS;

export const GUIDED_PROBLEMS_CONFIG: GuidedProblemConfig[] = GUIDED_PROBLEMS;
