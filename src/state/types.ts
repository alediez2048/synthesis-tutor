/**
 * Shared types for Synthesis Tutor. This file is the contract between engine and UI.
 * Re-export Fraction from engine as single source of truth.
 */

import type { Fraction } from '../engine/FractionEngine';

export type { Fraction };

export type Phase = 'intro' | 'tutorial' | 'explore' | 'guided' | 'assess' | 'complete';

export interface FractionBlock {
  id: string;
  fraction: Fraction;
  color: string;
  position: 'workspace' | 'comparison';
  isSelected: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'tutor' | 'student';
  content: string;
  timestamp?: number;
}

export interface A1Recognition {
  id: 'a1';
  type: 'recognition';
  target: Fraction;
  options: { fraction: Fraction; correct: boolean }[];
  maxAttempts: number;
}

export interface A2Construction {
  id: 'a2';
  type: 'construction';
  target: Fraction;
  startingBlock: Fraction;
  maxAttempts: number;
}

export interface A3Generalization {
  id: 'a3';
  type: 'generalization';
  target: Fraction;
  requiredCount: number;
}

export type AssessmentProblem = A1Recognition | A2Construction | A3Generalization;

export interface PlayerProgress {
  completedLessons: string[];
  currentLesson: string | null;
  scores: Record<string, { correct: number; total: number }>;
}

export interface LessonState {
  lessonId: string;
  phase: Phase;
  stepIndex: number;
  blocks: FractionBlock[];
  score: { correct: number; total: number };
  hintCount: number;
  chatMessages: ChatMessage[];
  assessmentPool: AssessmentProblem[];
  assessmentStep: number;
  assessmentAttempts: number;
  assessmentResults: boolean[];
  conceptsDiscovered: string[];
  explorationRound: number;
  explorationRoundProgress?: { round1SplitParts?: number };
  isDragging: boolean;
  nextBlockId: number;
  isLoading: boolean;
  isStreaming: boolean;
  tutorialComplete: boolean;
  tutorialStep: number;
  isDemoActive: boolean;
  guidedProblemIndex: number;
  guidedStep: 'problem' | 'cfu';
  guidedAttempts: number;
  cfuQuestion: string | null;
  cfuExpectedAnswer: number | null;
}

export type LessonAction =
  | { type: 'SPLIT_BLOCK'; blockId: string; parts: number }
  | { type: 'COMBINE_BLOCKS'; blockIds: [string, string] }
  | { type: 'COMPARE_BLOCKS'; blockIds: [string, string] }
  | { type: 'STUDENT_RESPONSE'; value: string }
  | { type: 'ADVANCE_SCRIPT' }
  | { type: 'REQUEST_HINT' }
  | { type: 'RESET_WORKSPACE' }
  | { type: 'PHASE_TRANSITION'; to: Phase }
  | { type: 'SELECT_BLOCK'; blockId: string }
  | { type: 'DESELECT_ALL' }
  | { type: 'DRAG_START'; blockId: string }
  | { type: 'DRAG_END' }
  | { type: 'TUTOR_RESPONSE'; content: string; isStreaming: boolean }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'DISCOVER_CONCEPT'; concept: string }
  | { type: 'INIT_ASSESSMENT'; pool: AssessmentProblem[] }
  | { type: 'ASSESSMENT_ANSWER'; correct: boolean }
  | { type: 'ADVANCE_ASSESSMENT' }
  | { type: 'RESET_ASSESSMENT_WORKSPACE' }
  | { type: 'RETRY_MISSED' }
  | { type: 'LOOP_TO_PRACTICE' }
  | { type: 'RESTART_LESSON' }
  | { type: 'FULL_RESET' }
  | { type: 'RETURN_TO_WORKSPACE'; blockId: string }
  | { type: 'TUTORIAL_STEP'; step: number }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'ADVANCE_ROUND'; round1SplitParts?: number }
  | { type: 'ADD_BLOCK'; fraction: Fraction }
  | { type: 'DEMO_SPLIT'; blockId: string; parts: number }
  | { type: 'DEMO_COMBINE'; blockIds: [string, string] }
  | { type: 'SET_DEMO_ACTIVE'; active: boolean }
  | { type: 'COMPLETE_INTRO' }
  | { type: 'SET_GUIDED_PROBLEM'; index: number; step: 'problem' | 'cfu' }
  | { type: 'GUIDED_ATTEMPT' }
  | { type: 'ADVANCE_GUIDED_PROBLEM' }
  | { type: 'SET_CFU_QUESTION'; question: string; expectedAnswer: number }
  | { type: 'CLEAR_CFU' }
  | { type: 'RESET_GUIDED_WORKSPACE'; blocks: FractionBlock[] }
  | { type: 'INIT_GUIDED_PROBLEM'; problemIndex: number }
  | { type: 'SKIP_TO_GUIDED' }
  | { type: 'START_LESSON'; lessonId: string }
  | { type: 'ADD_BLOCKS'; blockIds: [string, string] };
