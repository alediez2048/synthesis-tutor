/**
 * Direct Instruction: Tutorial demo observer.
 * Step 2: demo split (whole → two halves).
 * Step 5: demo combine (two quarters → one half).
 */

import { useEffect, useRef } from 'react';
import type { LessonState, LessonAction } from '../state/types';

const DEMO_DELAY_MS = 1500;
const DEMO_ANIMATION_MS = 400;
/** Auto-advance step 6 if user is stuck for this long */
const STEP6_TIMEOUT_MS = 15000;

const ALTAR_DEMO_DELAY_MS = 1200;
const ALTAR_RESULT_PAUSE_MS = 2500;

interface TutorialDemoObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  playPop: () => void;
  playSnap: (ratio: number) => void;
  playCorrect: () => void;
  playIncorrect: () => void;
}

export function useTutorialDemoObserver({
  state,
  dispatch,
  playPop,
  playSnap,
  playCorrect,
  playIncorrect,
}: TutorialDemoObserverOptions): void {
  const hasDemoSplitRef = useRef(false);
  const hasDemoCombineRef = useRef(false);
  const hasAltarMatchRef = useRef(false);
  const hasAltarMismatchRef = useRef(false);

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

  // Step 5: Demo combine — reset to two 1/2s, fuse them into 1/1
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 5) return;
    if (hasDemoCombineRef.current) return;

    const t = setTimeout(() => {
      hasDemoCombineRef.current = true;
      // Reset workspace to exactly two 1/2 blocks for a clean demo
      dispatch({
        type: 'TUTORIAL_SET_BLOCKS',
        fractions: [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 2 },
        ],
      });

      // Combine them after a brief pause
      setTimeout(() => {
        const idA = `block-${state.nextBlockId}`;
        const idB = `block-${state.nextBlockId + 1}`;
        dispatch({ type: 'DEMO_COMBINE', blockIds: [idA, idB] });
        playSnap(1);

        setTimeout(() => {
          dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
          // Skip step 6 (user combine) — go straight to step 7
          // The demo already showed combining; no need for user to repeat
          dispatch({ type: 'TUTORIAL_STEP', step: 7 });
        }, DEMO_ANIMATION_MS);
      }, ALTAR_DEMO_DELAY_MS);
    }, DEMO_DELAY_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.tutorialStep, state.nextBlockId, dispatch, playSnap]);

  // Step 6 safety valve: auto-advance if user is stuck
  // Handles ALL edge cases — wrong block pairs, confusing state, etc.
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 6) return;

    const t = setTimeout(() => {
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: "No worries — combining takes practice! Let's keep going.",
        isStreaming: false,
      });
      dispatch({ type: 'TUTORIAL_STEP', step: 7 });
    }, STEP6_TIMEOUT_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.tutorialStep, dispatch]);

  // Reset altar demo flags
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 9) {
      hasAltarMatchRef.current = false;
    }
  }, [state.phase, state.tutorialStep]);

  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 10) {
      hasAltarMismatchRef.current = false;
    }
  }, [state.phase, state.tutorialStep]);

  // Step 9: Demo — place 1/2 and 2/4 on altar (equivalent → golden glow)
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 9) return;
    if (hasAltarMatchRef.current) return;

    const t = setTimeout(() => {
      hasAltarMatchRef.current = true;
      dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
      // Set up 1/2 and 2/4 blocks
      dispatch({
        type: 'TUTORIAL_SET_BLOCKS',
        fractions: [
          { numerator: 1, denominator: 2 },
          { numerator: 2, denominator: 4 },
        ],
      });

      // Move them to the altar after a brief pause
      setTimeout(() => {
        const nextId = state.nextBlockId;
        const idA = `block-${nextId}`;
        const idB = `block-${nextId + 1}`;
        dispatch({ type: 'COMPARE_BLOCKS', blockIds: [idA, idB] });
        playCorrect();

        // Let the golden glow animation play, then advance
        setTimeout(() => {
          dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
        }, ALTAR_RESULT_PAUSE_MS);
      }, ALTAR_DEMO_DELAY_MS);
    }, DEMO_DELAY_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.tutorialStep, state.blocks, state.nextBlockId, dispatch, playCorrect]);

  // Step 10: Demo — place 1/2 and 1/3 on altar (not equivalent → red shake)
  useEffect(() => {
    if (state.phase !== 'tutorial' || state.tutorialStep !== 10) return;
    if (hasAltarMismatchRef.current) return;

    const t = setTimeout(() => {
      hasAltarMismatchRef.current = true;
      dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
      // Return any comparison blocks first, then set up new blocks
      state.blocks
        .filter((b) => b.position === 'comparison')
        .forEach((b) => dispatch({ type: 'RETURN_TO_WORKSPACE', blockId: b.id }));

      dispatch({
        type: 'TUTORIAL_SET_BLOCKS',
        fractions: [
          { numerator: 1, denominator: 2 },
          { numerator: 1, denominator: 3 },
        ],
      });

      // Move them to the altar
      setTimeout(() => {
        const nextId = state.nextBlockId;
        const idA = `block-${nextId}`;
        const idB = `block-${nextId + 1}`;
        dispatch({ type: 'COMPARE_BLOCKS', blockIds: [idA, idB] });
        playIncorrect();

        // Let the red shake animation play, then advance
        setTimeout(() => {
          dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
        }, ALTAR_RESULT_PAUSE_MS);
      }, ALTAR_DEMO_DELAY_MS);
    }, DEMO_DELAY_MS);

    return () => clearTimeout(t);
  }, [state.phase, state.tutorialStep, state.blocks, state.nextBlockId, dispatch, playIncorrect]);
}
