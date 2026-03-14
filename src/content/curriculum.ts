/**
 * Lesson registry — metadata, prerequisites, tools per lesson.
 */

import type { Fraction } from '../engine/FractionEngine';
import type { FractionBlock } from '../state/types';
import type { ExplorationRoundConfig } from './exploration-rounds';
import type { GuidedProblemConfig } from './guided-practice-config';
import { createBlock } from '../utils/blockUtils';
import {
  LESSON_1_ID,
  INITIAL_FRACTIONS as L1_INITIAL,
  EXPLORATION_ROUNDS_CONFIG as L1_ROUNDS,
  GUIDED_PROBLEMS_CONFIG as L1_GUIDED,
} from './lessons/fractions-101/config';
import { selectAssessmentProblems as selectL1Assessment } from './lessons/fractions-101/assessment-pools';
import {
  LESSON_2_ID,
  INITIAL_FRACTIONS as L2_INITIAL,
  EXPLORATION_ROUNDS_CONFIG as L2_ROUNDS,
  GUIDED_PROBLEMS_CONFIG as L2_GUIDED,
} from './lessons/adding/config';
import { selectAssessmentProblems as selectL2Assessment } from './lessons/adding/assessment-pools';

export interface LessonConfig {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  initialFractions: Fraction[];
  systemPromptModule: string;
  tools: string[];
  concepts: string[];
  explorationRounds: ExplorationRoundConfig[];
  guidedProblems: GuidedProblemConfig[];
  workspaceActions: ('split' | 'combine' | 'compare' | 'add')[];
  lastRoundTimerMs: number | null;
  passThreshold: number;
}

export function getInitialBlocks(lessonId: string, startBlockId: number): FractionBlock[] {
  const fractions = getInitialFractions(lessonId);
  return fractions.map((fraction, i) =>
    createBlock(`block-${startBlockId + i}`, fraction, 'workspace', false)
  );
}

function getInitialFractions(lessonId: string): Fraction[] {
  switch (lessonId) {
    case LESSON_1_ID:
      return L1_INITIAL;
    case LESSON_2_ID:
      return L2_INITIAL;
    default:
      return L1_INITIAL;
  }
}

export const LESSONS: LessonConfig[] = [
  {
    id: LESSON_1_ID,
    title: 'What Are Fractions?',
    description: 'Split, combine, and discover equivalent fractions',
    prerequisites: [],
    initialFractions: L1_INITIAL,
    systemPromptModule: 'lesson-1-equivalence',
    tools: [
      'check_equivalence',
      'simplify_fraction',
      'split_fraction',
      'combine_fractions',
      'find_common_denominator',
      'validate_fraction',
      'parse_student_input',
      'check_answer',
      'get_workspace_state',
    ],
    concepts: ['splitting', 'combining', 'equivalence'],
    explorationRounds: L1_ROUNDS,
    guidedProblems: L1_GUIDED,
    workspaceActions: ['split', 'combine', 'compare'],
    lastRoundTimerMs: 60_000,
    passThreshold: 0.67,
  },
  {
    id: LESSON_2_ID,
    title: 'Adding Fractions',
    description: 'Add fractions with same and different denominators',
    prerequisites: [LESSON_1_ID],
    initialFractions: L2_INITIAL,
    systemPromptModule: 'lesson-2-addition',
    tools: [
      'check_equivalence',
      'simplify_fraction',
      'split_fraction',
      'combine_fractions',
      'find_common_denominator',
      'add_fractions',
      'validate_fraction',
      'parse_student_input',
      'check_answer',
      'get_workspace_state',
    ],
    concepts: ['same-denom addition', 'common denominator', 'unlike-denom addition'],
    explorationRounds: L2_ROUNDS,
    guidedProblems: L2_GUIDED,
    workspaceActions: ['split', 'combine', 'compare', 'add'],
    lastRoundTimerMs: 45_000,
    passThreshold: 0.67,
  },
  {
    id: 'multiplying',
    title: 'Multiplying Fractions',
    description: 'Multiply fractions and whole numbers by fractions',
    prerequisites: [LESSON_2_ID],
    initialFractions: L1_INITIAL,
    systemPromptModule: 'lesson-1-equivalence',
    tools: [],
    concepts: [],
    explorationRounds: [],
    guidedProblems: [],
    workspaceActions: ['split', 'combine', 'compare'],
    lastRoundTimerMs: null,
    passThreshold: 0.67,
  },
  {
    id: 'dividing',
    title: 'Dividing Fractions',
    description: 'Divide fractions using visual models',
    prerequisites: ['multiplying'],
    initialFractions: L1_INITIAL,
    systemPromptModule: 'lesson-1-equivalence',
    tools: [],
    concepts: [],
    explorationRounds: [],
    guidedProblems: [],
    workspaceActions: ['split', 'combine', 'compare'],
    lastRoundTimerMs: null,
    passThreshold: 0.67,
  },
];

export function getLesson(id: string): LessonConfig | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonWorkspaceActions(lessonId: string): LessonConfig['workspaceActions'] {
  return getLesson(lessonId)?.workspaceActions ?? ['split', 'combine', 'compare'];
}

export function getUnlockedLessons(completedIds: string[]): LessonConfig[] {
  return LESSONS.filter((lesson) =>
    lesson.prerequisites.every((prereq) => completedIds.includes(prereq))
  );
}

export function selectAssessmentProblems(lessonId: string) {
  switch (lessonId) {
    case LESSON_1_ID:
      return selectL1Assessment();
    case LESSON_2_ID:
      return selectL2Assessment();
    default:
      return selectL1Assessment();
  }
}
