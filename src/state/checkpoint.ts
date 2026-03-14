/**
 * ENG-025: Checkpoint + Recovery — sessionStorage persistence.
 * Per PRD Section 9.
 */

import type { LessonState } from './types';

const LEGACY_KEY = 'fraction-quest-checkpoint';

function getStorageKey(lessonId?: string): string {
  return lessonId ? `fraction-quest-checkpoint-${lessonId}` : LEGACY_KEY;
}
const SCHEMA_VERSION = 2; // bumped to invalidate stale checkpoints from pre-multi-lesson
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

interface Checkpoint {
  version: number;
  timestamp: number;
  state: LessonState;
}

/**
 * Save current state to sessionStorage.
 * Called on significant actions only (not every keystroke).
 */
export function saveCheckpoint(state: LessonState): void {
  try {
    const checkpoint: Checkpoint = {
      version: SCHEMA_VERSION,
      timestamp: Date.now(),
      state,
    };
    sessionStorage.setItem(getStorageKey(state.lessonId), JSON.stringify(checkpoint));
  } catch {
    // sessionStorage full or unavailable — silently fail
  }
}

/**
 * Load checkpoint from sessionStorage.
 * Returns null if no valid checkpoint exists.
 * Resets transient fields (isDragging, isLoading, isStreaming) on restore.
 */
export function loadCheckpoint(lessonId?: string): LessonState | null {
  try {
    const raw = sessionStorage.getItem(getStorageKey(lessonId));
    if (!raw) return null;
    const checkpoint: Checkpoint = JSON.parse(raw);
    if (checkpoint.version !== SCHEMA_VERSION) {
      clearCheckpoint();
      return null;
    }
    if (Date.now() - checkpoint.timestamp > MAX_AGE_MS) {
      clearCheckpoint();
      return null;
    }
    return {
      ...checkpoint.state,
      lessonId: checkpoint.state.lessonId ?? 'fractions-101',
      isDragging: false,
      isLoading: false,
      isStreaming: false,
      isDemoActive: false,
      tutorialComplete: checkpoint.state.tutorialComplete ?? false,
      tutorialStep: checkpoint.state.tutorialStep ?? 0,
      explorationRound: checkpoint.state.explorationRound ?? 1,
      guidedProblemIndex: checkpoint.state.guidedProblemIndex ?? 0,
      guidedStep: checkpoint.state.guidedStep ?? 'problem',
      guidedAttempts: checkpoint.state.guidedAttempts ?? 0,
      cfuQuestion: checkpoint.state.cfuQuestion ?? null,
      cfuExpectedAnswer: checkpoint.state.cfuExpectedAnswer ?? null,
    };
  } catch {
    clearCheckpoint();
    return null;
  }
}

/**
 * Remove checkpoint from sessionStorage.
 */
export function clearCheckpoint(lessonId?: string): void {
  try {
    sessionStorage.removeItem(getStorageKey(lessonId));
  } catch {
    // silently fail
  }
}
