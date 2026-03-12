/**
 * ENG-025: Checkpoint + Recovery — sessionStorage persistence.
 * Per PRD Section 9.
 */

import type { LessonState } from './types';

const STORAGE_KEY = 'fraction-quest-checkpoint';
const SCHEMA_VERSION = 1;
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
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checkpoint));
  } catch {
    // sessionStorage full or unavailable — silently fail
  }
}

/**
 * Load checkpoint from sessionStorage.
 * Returns null if no valid checkpoint exists.
 * Resets transient fields (isDragging, isLoading, isStreaming) on restore.
 */
export function loadCheckpoint(): LessonState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
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
      isDragging: false,
      isLoading: false,
      isStreaming: false,
    };
  } catch {
    clearCheckpoint();
    return null;
  }
}

/**
 * Remove checkpoint from sessionStorage.
 */
export function clearCheckpoint(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}
