/**
 * Direct Instruction: Tutorial demo observer.
 * Step 2: demo split (whole → two halves).
 * Step 5: demo combine (two quarters → one half).
 */

import { useEffect, useRef } from 'react';
import type { LessonState, LessonAction } from '../state/types';

const DEMO_DELAY_MS = 1500;
const DEMO_ANIMATION_MS = 400;

interface TutorialDemoObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  playPop: () => void;
  playSnap: (ratio: number) => void;
}

export function useTutorialDemoObserver({
  state,
  dispatch,
  playPop,
  playSnap,
}: TutorialDemoObserverOptions): void {
  const hasDemoSplitRef = useRef(false);
  const hasDemoCombineRef = useRef(false);

  // Reset demo flags when leaving relevant steps
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 2) {
      hasDemoSplitRef.current = false;
    }
  }, [state.phase, state.tutorialStep]);

  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 5) {
      hasDemoCombineRef.current = false;
    }
  }, [state.phase, state.tutorialStep]);

  // Step 2: Demo split — whole crystal → two halves
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 2) return;
    if (hasDemoSplitRef.current) return;

    const block0 = state.blocks.find((b) => b.id === 'block-0');
    if (!block0 || block0.fraction.numerator !== 1 || block0.fraction.denominator !== 1) return;

    const t = setTimeout(() => {
      hasDemoSplitRef.current = true;
      dispatch({ type: 'DEMO_SPLIT', blockId: 'block-0', parts: 2 });
      playPop();

      setTimeout(() => {
        dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
      }, DEMO_ANIMATION_MS);
    }, DEMO_DELAY_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.tutorialStep, state.blocks, dispatch, playPop]);

  // Step 5: Demo combine — fuse two same-sized pieces
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 5) return;
    if (hasDemoCombineRef.current) return;

    // Find two blocks with the same denominator (prefer smallest pieces first)
    const sorted = [...state.blocks].sort(
      (a, b) => b.fraction.denominator - a.fraction.denominator
    );
    let pair: [string, string] | null = null;
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].fraction.denominator === sorted[j].fraction.denominator) {
          pair = [sorted[i].id, sorted[j].id];
          break;
        }
      }
      if (pair) break;
    }
    if (!pair) return;

    const capturedPair = pair;
    const t = setTimeout(() => {
      hasDemoCombineRef.current = true;
      dispatch({ type: 'DEMO_COMBINE', blockIds: capturedPair });
      playSnap(0.5);

      setTimeout(() => {
        dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
        dispatch({ type: 'TUTORIAL_STEP', step: 6 });
      }, DEMO_ANIMATION_MS);
    }, DEMO_DELAY_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.tutorialStep, state.blocks, dispatch, playSnap]);
}
