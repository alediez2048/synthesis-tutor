/**
 * Tutorial flow state and advancement.
 * Manages step progression; auto-advances on block select (step 3) and split (step 4).
 */

import { useCallback } from "react";
import type { LessonState, LessonAction } from "../state/types";
import { TUTORIAL_STEPS } from "../content/tutorial-steps";

export interface UseTutorialFlowReturn {
  step: number;
  config: (typeof TUTORIAL_STEPS)[number];
  advance: () => void;
  complete: () => void;
  skip: () => void;
  isLastStep: boolean;
}

export function useTutorialFlow(
  state: LessonState,
  dispatch: React.Dispatch<LessonAction>,
  onComplete: () => void
): UseTutorialFlowReturn {
  const step = state.tutorialStep;
  const config = TUTORIAL_STEPS[step] ?? TUTORIAL_STEPS[0]!;
  const isLastStep = step === TUTORIAL_STEPS.length - 1;

  const advance = useCallback(() => {
    if (step >= TUTORIAL_STEPS.length - 1) {
      onComplete();
    } else {
      dispatch({ type: "TUTORIAL_STEP", step: step + 1 });
    }
  }, [step, dispatch, onComplete]);

  const complete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const skip = useCallback(() => {
    dispatch({ type: "COMPLETE_TUTORIAL" });
  }, [dispatch]);

  return {
    step,
    config,
    advance,
    complete,
    skip,
    isLastStep,
  };
}
