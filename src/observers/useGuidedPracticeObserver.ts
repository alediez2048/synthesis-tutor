/**
 * Guided practice observer: GP-1 through GP-4.
 * Sets up problems, validates answers, triggers re-model on failure.
 */

import { useEffect, useRef } from 'react';
import { areEquivalent, combine } from '../engine/FractionEngine';
import type { LessonState, LessonAction } from '../state/types';
import { getLesson } from '../content/curriculum';
import { GUIDED_DEMO_SCRIPTS } from '../content/guided-demo-scripts';

interface GuidedPracticeObserverOptions {
  state: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  playPop: () => void;
  playSnap: (pitch?: number) => void;
  playCorrect: () => void;
  playIncorrect: () => void;
}

export function useGuidedPracticeObserver({
  state,
  dispatch,
  playPop,
  playCorrect,
  playIncorrect,
}: GuidedPracticeObserverOptions): void {
  const prevPhaseRef = useRef(state.phase);
  const prevProblemIndexRef = useRef(state.guidedProblemIndex);
  const hasInitializedRef = useRef(false);
  const prevBlocksRef = useRef(state.blocks);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lesson = getLesson(state.lessonId);
  const guidedProblems = lesson?.guidedProblems ?? [];

  // Clean up success timeout on phase change
  useEffect(() => {
    if (state.phase !== 'guided' && successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, [state.phase]);

  // Initialize workspace when entering guided
  useEffect(() => {
    if (state.phase !== 'guided') {
      hasInitializedRef.current = false;
      prevPhaseRef.current = state.phase;
      return;
    }
    if (prevPhaseRef.current !== 'guided') {
      hasInitializedRef.current = true;
      // Blocks + guidedPrompt are already set by the reducer (SKIP_TO_GUIDED / ADVANCE_ROUND)
      // Only dispatch INIT if blocks weren't set (e.g. edge case)
      dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: 0 });
      const config = guidedProblems[0];
      if (config) {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: `Time for practice! Problem 1 of ${guidedProblems.length}: ${config.prompt}`,
          isStreaming: false,
        });
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, dispatch]);

  // Set up workspace when advancing to next problem
  useEffect(() => {
    if (state.phase !== 'guided') return;
    if (state.guidedStep !== 'problem') return;

    const idx = state.guidedProblemIndex;
    if (idx !== prevProblemIndexRef.current && idx < guidedProblems.length) {
      prevProblemIndexRef.current = idx;
      dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: idx });
      const config = guidedProblems[idx];
      if (config) {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: `Problem ${idx + 1} of ${guidedProblems.length}: ${config.prompt}`,
          isStreaming: false,
        });
      }
    }
  }, [state.phase, state.guidedProblemIndex, state.guidedStep, dispatch]);

  // Validate workspace actions against current problem
  useEffect(() => {
    if (state.phase !== 'guided') return;
    if (state.guidedStep !== 'problem') return;
    if (state.isDemoActive) return;

    const config = guidedProblems[state.guidedProblemIndex];
    if (!config) return;

    const prev = prevBlocksRef.current;
    const curr = state.blocks;
    prevBlocksRef.current = curr;

    if (prev === curr) return;

    const workspaceBlocks = curr.filter((b) => b.position === 'workspace');
    const comparisonBlocks = curr.filter((b) => b.position === 'comparison');

    let correct = false;
    const setupTarget = config.setup[0];

    if (config.type === 'split') {
      // Any valid split: more blocks than setup, and they all recombine to the setup fraction
      if (workspaceBlocks.length > config.setup.length && setupTarget) {
        try {
          const combined = combine(workspaceBlocks.map((b) => b.fraction));
          correct = areEquivalent(combined, setupTarget);
        } catch {
          correct = false;
        }
      }
    } else if (config.type === 'build-equivalent') {
      // Combined workspace is equivalent to target but with different representation
      if (workspaceBlocks.length >= 1 && setupTarget) {
        try {
          const result = combine(workspaceBlocks.map((b) => b.fraction));
          const different =
            result.numerator !== setupTarget.numerator ||
            result.denominator !== setupTarget.denominator;
          correct = areEquivalent(result, setupTarget) && different;
        } catch {
          correct = false;
        }
      }
    } else if (config.type === 'compare') {
      // Both blocks in comparison zone and equivalent
      if (comparisonBlocks.length >= 2) {
        const [a, b] = comparisonBlocks;
        if (a && b) {
          correct = areEquivalent(a.fraction, b.fraction);
        }
      }
    } else if (config.type === 'simplify') {
      // Combined workspace is equivalent to setup but with smaller denominator
      if (workspaceBlocks.length >= 1 && setupTarget) {
        try {
          const result = combine(workspaceBlocks.map((b) => b.fraction));
          correct =
            areEquivalent(result, setupTarget) &&
            result.denominator < setupTarget.denominator;
        } catch {
          correct = false;
        }
      }
    }

    if (correct) {
      playCorrect();
      dispatch({ type: 'GUIDED_SOLVED' });
      dispatch({ type: 'TUTOR_RESPONSE', content: "You got it!", isStreaming: false });

      // Pause 1.5s for "Correct!" celebration, then advance
      const capturedIndex = state.guidedProblemIndex;
      successTimeoutRef.current = setTimeout(() => {
        successTimeoutRef.current = null;
        if (capturedIndex >= guidedProblems.length - 1) {
          dispatch({ type: 'PHASE_TRANSITION', to: 'complete' });
        } else {
          dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
        }
      }, 1500);
    } else if (config.type === 'split' || config.type === 'build-equivalent' || config.type === 'simplify') {
      // Only count as an attempt if block count changed from setup (student actually tried)
      const setupBlockCount = config.setup.length;
      if (workspaceBlocks.length === setupBlockCount && comparisonBlocks.length === 0) return;

      const newAttempts = state.guidedAttempts + 1;
      dispatch({ type: 'GUIDED_ATTEMPT' });

      // Max attempts reached — auto-advance, mark as incorrect
      if (newAttempts >= config.maxAttempts) {
        playIncorrect();
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: "Let's move on — you'll get it next time!",
          isStreaming: false,
        });
        successTimeoutRef.current = setTimeout(() => {
          successTimeoutRef.current = null;
          const capturedIndex = state.guidedProblemIndex;
          if (capturedIndex >= guidedProblems.length - 1) {
            dispatch({ type: 'PHASE_TRANSITION', to: 'complete' });
          } else {
            dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
          }
        }, 1500);
        return;
      }

      // Demo re-model after 2 failures
      if (newAttempts >= 2) {
        const demoScript = GUIDED_DEMO_SCRIPTS[state.guidedProblemIndex];
        if (demoScript) {
          // Reset workspace first so demo finds the right block
          dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: state.guidedProblemIndex });
          dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
          setTimeout(() => {
            // Re-read blocks after INIT reset
            if (demoScript.type === 'split') {
              dispatch({ type: 'DEMO_SPLIT', blockId: `block-${state.nextBlockId}`, parts: demoScript.parts });
              playPop();
            }
            setTimeout(() => {
              dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
              dispatch({
                type: 'TUTOR_RESPONSE',
                content: "Watch how I did it. Now you try!",
                isStreaming: false,
              });
              dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: state.guidedProblemIndex });
            }, 600);
          }, 800);
          return;
        }
      }

      // Contextual hint on failure
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: config.hint || "Not quite — try again!",
        isStreaming: false,
      });
    }
  }, [
    state.phase,
    state.blocks,
    state.guidedProblemIndex,
    state.guidedStep,
    state.guidedAttempts,
    state.isDemoActive,
    dispatch,
    playCorrect,
    playPop,
    playSnap,
    playIncorrect,
  ]);

}
