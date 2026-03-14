/**
 * Direct Instruction: Tutorial demo observer.
 * When tutorial reaches step 2 (before student taps), run I Do demo: split the crystal.
 */

import { useEffect, useRef } from 'react';
import type { LessonState, LessonAction } from '../state/types';

const TUTORIAL_DEMO_DELAY_MS = 1500;
const TUTORIAL_DEMO_ANIMATION_MS = 400;

interface TutorialDemoObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  playPop: () => void;
}

export function useTutorialDemoObserver({
  state,
  dispatch,
  playPop,
}: TutorialDemoObserverOptions): void {
  const hasRunDemoRef = useRef(false);

  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 2) {
      hasRunDemoRef.current = false;
    }
  }, [state.phase, state.tutorialStep]);

  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 2) return;
    if (hasRunDemoRef.current) return;

    const block0 = state.blocks.find((b) => b.id === 'block-0');
    if (!block0 || block0.fraction.numerator !== 1 || block0.fraction.denominator !== 1) return;

    const t = setTimeout(() => {
      hasRunDemoRef.current = true;
      dispatch({ type: 'DEMO_SPLIT', blockId: 'block-0', parts: 2 });
      playPop();

      setTimeout(() => {
        dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
      }, TUTORIAL_DEMO_ANIMATION_MS);
    }, TUTORIAL_DEMO_DELAY_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.tutorialStep, state.blocks, dispatch, playPop]);
}
