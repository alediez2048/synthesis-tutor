/**
 * Guided practice observer: GP-1 through GP-4.
 * Sets up problems, validates answers, runs CFU, triggers re-model on failure.
 */

import { useEffect, useRef } from 'react';
import { areEquivalent, combine } from '../engine/FractionEngine';
import type { LessonState, LessonAction } from '../state/types';
import { getLesson } from '../content/curriculum';
import { GUIDED_DEMO_SCRIPTS } from '../content/guided-demo-scripts';

const CFU_QUESTIONS: { question: string; expectedAnswer: number }[] = [
  {
    question: "If I split 1/2 into 3 pieces, how many pieces will I have?",
    expectedAnswer: 3,
  },
  {
    question: "If I split 1/3 into 2 pieces, how many pieces will I have?",
    expectedAnswer: 2,
  },
  {
    question: "If I combine two 1/4 pieces, what fraction do I get?",
    expectedAnswer: 2, // 2/4 numerator, or we could accept "1/2" - use numeric for simplicity
  },
];

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
  playSnap,
  playCorrect,
  playIncorrect,
}: GuidedPracticeObserverOptions): void {
  const prevPhaseRef = useRef(state.phase);
  const prevProblemIndexRef = useRef(state.guidedProblemIndex);
  const hasInitializedRef = useRef(false);
  const prevBlocksRef = useRef(state.blocks);
  const prevChatLengthRef = useRef(state.chatMessages.length);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lesson = getLesson(state.lessonId);
  const guidedProblems = lesson?.guidedProblems ?? [];

  function parseCFUAnswer(text: string, expected: number): boolean {
    const normalized = text.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (num === expected) return true;
    const words: Record<number, string> = {
      1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
    };
    const word = words[expected];
    return normalized.includes(String(expected)) || (word !== undefined && normalized.includes(word));
  }

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

      // Pause 1.5s for "Correct!" celebration, then advance
      const capturedIndex = state.guidedProblemIndex;
      successTimeoutRef.current = setTimeout(() => {
        successTimeoutRef.current = null;
        const cfq = CFU_QUESTIONS[capturedIndex];
        if (cfq && capturedIndex < guidedProblems.length - 1) {
          dispatch({ type: 'SET_CFU_QUESTION', question: cfq.question, expectedAnswer: cfq.expectedAnswer });
          dispatch({
            type: 'TUTOR_RESPONSE',
            content: cfq.question,
            isStreaming: false,
          });
        } else {
          if (capturedIndex >= guidedProblems.length - 1) {
            dispatch({ type: 'PHASE_TRANSITION', to: 'complete' });
          } else {
            dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
          }
        }
      }, 1500);
    } else if (config.type === 'split' || config.type === 'build-equivalent' || config.type === 'simplify') {
      // Only count as an attempt if block count changed from setup (student actually tried)
      const setupBlockCount = config.setup.length;
      if (workspaceBlocks.length === setupBlockCount && comparisonBlocks.length === 0) return;

      const newAttempts = state.guidedAttempts + 1;
      dispatch({ type: 'GUIDED_ATTEMPT' });
      if (newAttempts >= 2) {
        const demoScript = GUIDED_DEMO_SCRIPTS[state.guidedProblemIndex];
        if (demoScript) {
          dispatch({ type: 'SET_DEMO_ACTIVE', active: true });
          if (demoScript.type === 'split') {
            const block = curr.find(
              (b) =>
                b.fraction.numerator === demoScript.blockFraction.numerator &&
                b.fraction.denominator === demoScript.blockFraction.denominator
            );
            if (block) {
              dispatch({ type: 'DEMO_SPLIT', blockId: block.id, parts: demoScript.parts });
              playPop();
            }
          } else if (demoScript.type === 'combine') {
            const [f1, f2] = demoScript.fractions;
            const b1 = curr.find((b) => b.fraction.numerator === f1.numerator && b.fraction.denominator === f1.denominator);
            const b2 = curr.find((b) => b.fraction.numerator === f2.numerator && b.fraction.denominator === f2.denominator);
            if (b1 && b2) {
              dispatch({ type: 'DEMO_COMBINE', blockIds: [b1.id, b2.id] });
              playSnap(1);
            }
          }
          setTimeout(() => {
            dispatch({ type: 'SET_DEMO_ACTIVE', active: false });
            dispatch({
              type: 'TUTOR_RESPONSE',
              content: "Let me show you. Now you try!",
              isStreaming: false,
            });
            dispatch({ type: 'INIT_GUIDED_PROBLEM', problemIndex: state.guidedProblemIndex });
          }, 600);
        } else {
          dispatch({
            type: 'TUTOR_RESPONSE',
            content: "Not quite — try again!",
            isStreaming: false,
          });
        }
      } else {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: "Not quite — try again!",
          isStreaming: false,
        });
      }
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

  // CFU validation: when student sends message and we're in CFU step
  useEffect(() => {
    if (state.phase !== 'guided' || state.guidedStep !== 'cfu') return;
    if (state.cfuExpectedAnswer === null) return;

    const msgs = state.chatMessages;
    if (msgs.length <= prevChatLengthRef.current) return;
    prevChatLengthRef.current = msgs.length;

    const lastMsg = msgs[msgs.length - 1];
    if (!lastMsg || lastMsg.sender !== 'student') return;

    const correct = parseCFUAnswer(lastMsg.content, state.cfuExpectedAnswer);
    if (correct) {
      playCorrect();
      dispatch({ type: 'CLEAR_CFU' });
      if (state.guidedProblemIndex >= guidedProblems.length - 1) {
        dispatch({ type: 'PHASE_TRANSITION', to: 'assess' });
      } else {
        dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
      }
    } else {
      playIncorrect();
      dispatch({
        type: 'TUTOR_RESPONSE',
        content: "Almost! The answer is " + state.cfuExpectedAnswer + ". Let's move on.",
        isStreaming: false,
      });
      dispatch({ type: 'CLEAR_CFU' });
      if (state.guidedProblemIndex >= guidedProblems.length - 1) {
        dispatch({ type: 'PHASE_TRANSITION', to: 'assess' });
      } else {
        dispatch({ type: 'ADVANCE_GUIDED_PROBLEM' });
      }
    }
  }, [
    state.phase,
    state.guidedStep,
    state.chatMessages,
    state.cfuExpectedAnswer,
    state.guidedProblemIndex,
    dispatch,
    playCorrect,
    playIncorrect,
  ]);
}
