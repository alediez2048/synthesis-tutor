/**
 * Shared types for Synthesis Tutor. This file is the contract between engine and UI.
 * Re-export Fraction from engine as single source of truth.
 */

import type { Fraction } from '../engine/FractionEngine';

export type { Fraction };

export type Phase = 'intro' | 'explore' | 'guided' | 'assess' | 'complete';

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

export interface LessonState {
  phase: Phase;
  stepIndex: number;
  blocks: FractionBlock[];
  score: { correct: number; total: number };
  hintCount: number;
  chatMessages: ChatMessage[];
  assessmentPool: AssessmentProblem[];
  conceptsDiscovered: string[];
  isDragging: boolean;
  nextBlockId: number;
  isLoading: boolean;
  isStreaming: boolean;
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
  | { type: 'DISCOVER_CONCEPT'; concept: string };
