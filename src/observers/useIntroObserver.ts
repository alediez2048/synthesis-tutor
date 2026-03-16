/**
 * Direct Instruction: Intro phase observer.
 * Runs I Do (modeling) demo: Sam visually demonstrates a split before the student tries.
 * On first student split in intro, transitions to explore.
 */

import { useEffect, useRef } from 'react';
import type { LessonState, LessonAction } from '../state/types';

const INTRO_DEMO_DELAY_MS = 2000;
const INTRO_DEMO_ANIMATION_MS = 400;
const INTRO_POST_DEMO_MESSAGE =
  "Watch — I just split that whole block into two pieces. Each piece is one-half. Now you try!";

interface IntroObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  playPop: () => void;
  isLoading: boolean;
}

export function useIntroObserver({
  state,
  dispatch,
  playPop,
  isLoading,
}: IntroObserverOptions): void {
  const hasRunDemoRef = useRef(false);
  const prevBlocksRef = useRef(state.blocks);
  const prevPhaseRef = useRef(state.phase);

  // Reset when leaving intro
  useEffect(() => {
    if (state.phase !== 'intro') {
      hasRunDemoRef.current = false;
      prevPhaseRef.current = state.phase;
    }
  }, [state.phase]);

  // I Do: Run demo split after delay when in intro
  useEffect(() => {
    if (state.phase !== 'intro') return;
    if (hasRunDemoRef.current) return;
    if (isLoading) return;

    const block0 = state.blocks.find((b) => b.id === 'block-0');
    if (!block0 || block0.fraction.numerator !== 1 || block0.fraction.denominator !== 1) return;

    const t = setTimeout(() => {
      hasRunDemoRef.current = true;
      dispatch({ type: 'DEMO_SPLIT', blockId: 'block-0', parts: 2 });
      playPop();

      const t2 = setTimeout(() => {
        dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: INTRO_POST_DEMO_MESSAGE,
          isStreaming: false,
        });
      }, INTRO_DEMO_ANIMATION_MS);

      return () => clearTimeout(t2);
    }, INTRO_DEMO_DELAY_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.blocks, isLoading, dispatch, playPop]);

  // On first student split in intro: transition to explore
  useEffect(() => {
    if (state.phase !== 'intro') return;
    if (state.isDemoActive) return;

    const prev = prevBlocksRef.current;
    const curr = state.blocks;
    prevBlocksRef.current = curr;

    if (prev === curr) return;

    // Student split: blocks increased (1 -> 2+)
    if (curr.length > prev.length && prev.length >= 1) {
      dispatch({ type: 'COMPLETE_INTRO' });
    }
  }, [state.phase, state.blocks, state.isDemoActive, dispatch]);
}
