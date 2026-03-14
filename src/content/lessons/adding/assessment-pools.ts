/**
 * Assessment pools for Lesson 2: Adding Fractions.
 * Uses A1/A2/A3 with addition-specific problems.
 */

import type {
  A1Recognition,
  A2Construction,
  A3Generalization,
  AssessmentProblem,
} from '../../../state/types';

const a1Sets: Omit<A1Recognition, 'id' | 'type'>[] = [
  {
    // "What is 1/4 + 1/4?"
    target: { numerator: 2, denominator: 4 },
    options: [
      { fraction: { numerator: 2, denominator: 4 }, correct: true },
      { fraction: { numerator: 2, denominator: 8 }, correct: false },
      { fraction: { numerator: 1, denominator: 4 }, correct: false },
      { fraction: { numerator: 1, denominator: 8 }, correct: false },
    ],
    maxAttempts: 2,
  },
  {
    // "What is 1/3 + 1/3?"
    target: { numerator: 2, denominator: 3 },
    options: [
      { fraction: { numerator: 2, denominator: 3 }, correct: true },
      { fraction: { numerator: 2, denominator: 6 }, correct: false },
      { fraction: { numerator: 1, denominator: 3 }, correct: false },
      { fraction: { numerator: 1, denominator: 6 }, correct: false },
    ],
    maxAttempts: 2,
  },
  {
    // "What is 1/2 + 1/4?"
    target: { numerator: 3, denominator: 4 },
    options: [
      { fraction: { numerator: 3, denominator: 4 }, correct: true },
      { fraction: { numerator: 2, denominator: 6 }, correct: false },
      { fraction: { numerator: 1, denominator: 2 }, correct: false },
      { fraction: { numerator: 2, denominator: 4 }, correct: false },
    ],
    maxAttempts: 2,
  },
];

const a2Sets: Omit<A2Construction, 'id' | 'type'>[] = [
  {
    // "Add 1/3 + 1/3 — build 2/3"
    target: { numerator: 2, denominator: 3 },
    startingBlock: { numerator: 1, denominator: 3 },
    maxAttempts: 3,
  },
  {
    // "Add 1/4 + 2/4 — build 3/4"
    target: { numerator: 3, denominator: 4 },
    startingBlock: { numerator: 1, denominator: 4 },
    maxAttempts: 3,
  },
];

const a3Sets: Omit<A3Generalization, 'id' | 'type'>[] = [
  {
    // "Find 2 different ways to make 1/2 by adding fractions"
    target: { numerator: 1, denominator: 2 },
    requiredCount: 2,
  },
  {
    // "Find 2 different ways to make 3/4 by adding fractions"
    target: { numerator: 3, denominator: 4 },
    requiredCount: 2,
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function selectAssessmentProblems(): AssessmentProblem[] {
  const a1 = pickRandom(a1Sets);
  const a2 = pickRandom(a2Sets);
  const a3 = pickRandom(a3Sets);

  return [
    { id: 'a1', type: 'recognition', ...a1 },
    { id: 'a2', type: 'construction', ...a2 },
    { id: 'a3', type: 'generalization', ...a3 },
  ];
}
