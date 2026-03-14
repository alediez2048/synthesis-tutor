/**
 * Persistent progress across lessons — localStorage.
 * Completed lessons and scores persist across browser sessions.
 */

import type { PlayerProgress } from './types';
import { getLesson } from '../content/curriculum';

const STORAGE_KEY = 'fraction-quest-progress';
const SCHEMA_VERSION = 1;

interface StoredProgress {
  version: number;
  data: PlayerProgress;
}

const DEFAULT_PROGRESS: PlayerProgress = {
  completedLessons: [],
  currentLesson: null,
  scores: {},
};

function loadRaw(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const stored: StoredProgress = JSON.parse(raw);
    if (stored.version !== SCHEMA_VERSION) return DEFAULT_PROGRESS;
    return {
      ...DEFAULT_PROGRESS,
      ...stored.data,
      completedLessons: stored.data.completedLessons ?? [],
      currentLesson: stored.data.currentLesson ?? null,
      scores: stored.data.scores ?? {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function save(progress: PlayerProgress): void {
  try {
    const stored: StoredProgress = {
      version: SCHEMA_VERSION,
      data: progress,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function getProgress(): PlayerProgress {
  return loadRaw();
}

export function saveProgress(progress: PlayerProgress): void {
  save(progress);
}

export function markLessonComplete(
  lessonId: string,
  score: { correct: number; total: number }
): void {
  const progress = loadRaw();
  const completed = progress.completedLessons.includes(lessonId)
    ? progress.completedLessons
    : [...progress.completedLessons, lessonId];
  const scores = {
    ...progress.scores,
    [lessonId]: score,
  };
  save({ ...progress, completedLessons: completed, scores });
}

export function isLessonUnlocked(lessonId: string): boolean {
  const progress = loadRaw();
  const lesson = getLesson(lessonId);
  if (!lesson) return false;
  return lesson.prerequisites.every((prereq) => progress.completedLessons.includes(prereq));
}
